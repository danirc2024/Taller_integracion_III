from __future__ import annotations

from collections import deque
from datetime import datetime, timezone


CATALOG_REFRESH_INTERVAL_SECONDS = 6 * 60 * 60
PRODUCT_REFRESH_TTL_SECONDS = 30 * 60


def should_refresh_catalog(last_updated_at, interval_seconds: int = CATALOG_REFRESH_INTERVAL_SECONDS) -> bool:
    if last_updated_at is None:
        return True
    if not isinstance(last_updated_at, datetime):
        return True
    now = datetime.now(timezone.utc)
    elapsed = (now - last_updated_at).total_seconds()
    return elapsed >= interval_seconds


def should_refresh_product(last_updated_at, ttl_seconds: int = PRODUCT_REFRESH_TTL_SECONDS) -> bool:
    if last_updated_at is None:
        return True
    if not isinstance(last_updated_at, datetime):
        return True
    now = datetime.now(timezone.utc)
    elapsed = (now - last_updated_at).total_seconds()
    return elapsed >= ttl_seconds


def build_refresh_decision(product_id, last_updated_at, ttl_seconds: int = PRODUCT_REFRESH_TTL_SECONDS):
    needs_refresh = should_refresh_product(last_updated_at, ttl_seconds=ttl_seconds)
    if needs_refresh:
        return {
            "product_id": product_id,
            "needs_refresh": True,
            "reason": "ttl_exceeded",
        }
    return {
        "product_id": product_id,
        "needs_refresh": False,
        "reason": "fresh",
    }


def should_skip_refresh(product_id, in_flight_refreshes):
    if not isinstance(in_flight_refreshes, set):
        return False
    return product_id in in_flight_refreshes


class RefreshQueue:
    """Gestiona la cola de refresh puntual por producto.

    La intención es evitar que dos ejecuciones del scraper repitan el mismo
    refresh para un producto mientras uno todavía está en curso. El TTL define
    cuánto tiempo puede permanecer un producto "fresco" antes de volver a
    revisarlo.
    """

    def __init__(self, product_ttl_seconds: int = PRODUCT_REFRESH_TTL_SECONDS):
        self.product_ttl_seconds = product_ttl_seconds
        self._in_flight_refreshes = set()
        self._pending_refreshes = deque()

    @property
    def in_flight_refreshes(self):
        return set(self._in_flight_refreshes)

    def mark_started(self, product_id):
        if product_id is None:
            return False
        self._in_flight_refreshes.add(product_id)
        return True

    def mark_finished(self, product_id):
        if product_id is None:
            return False
        self._in_flight_refreshes.discard(product_id)
        return True

    def pop_next(self):
        if not self._pending_refreshes:
            return None
        return self._pending_refreshes.popleft()

    def enqueue(self, product_id, last_updated_at=None, product_url=None):
        if product_id in self._in_flight_refreshes:
            return {
                "product_id": product_id,
                "needs_refresh": False,
                "reason": "in_flight",
            }

        if last_updated_at is None or not isinstance(last_updated_at, datetime):
            self.mark_started(product_id)
            self._pending_refreshes.append(
                {"product_id": product_id, "product_url": product_url}
            )
            return {
                "product_id": product_id,
                "needs_refresh": True,
                "reason": "missing_timestamp",
            }

        if should_refresh_product(last_updated_at, ttl_seconds=self.product_ttl_seconds):
            self.mark_started(product_id)
            self._pending_refreshes.append(
                {"product_id": product_id, "product_url": product_url}
            )
            return {
                "product_id": product_id,
                "needs_refresh": True,
                "reason": "ttl_exceeded",
            }

        return {
            "product_id": product_id,
            "needs_refresh": False,
            "reason": "fresh",
        }


class RefreshWorker:
    """Consume trabajos y delega la ejecución real a un adaptador externo."""

    def __init__(self, queue, executor):
        self.queue = queue
        self.executor = executor

    def process_next(self):
        job = self.queue.pop_next()
        if job is None:
            return {"status": "empty"}

        product_id = job["product_id"]
        try:
            result = self.executor(job)
            return {
                "status": "completed",
                "product_id": product_id,
                "result": result,
            }
        except Exception as error:
            return {
                "status": "failed",
                "product_id": product_id,
                "error": str(error),
            }
        finally:
            self.queue.mark_finished(product_id)

    def process_all(self):
        results = []
        while True:
            result = self.process_next()
            if result["status"] == "empty":
                return results
            results.append(result)


class RefreshScheduler:
    """Coordina la decisión de refrescar catálogo y productos."""

    def __init__(
        self,
        catalog_interval_seconds: int = CATALOG_REFRESH_INTERVAL_SECONDS,
        product_ttl_seconds: int = PRODUCT_REFRESH_TTL_SECONDS,
        enabled: bool = True,
    ):
        self.catalog_interval_seconds = catalog_interval_seconds
        self.product_ttl_seconds = product_ttl_seconds
        self.enabled = enabled

    @classmethod
    def from_config(cls, config=None):
        config = config or {}
        return cls(
            catalog_interval_seconds=int(
                config.get(
                    "catalog_interval_seconds",
                    CATALOG_REFRESH_INTERVAL_SECONDS,
                )
            ),
            product_ttl_seconds=int(
                config.get("product_ttl_seconds", PRODUCT_REFRESH_TTL_SECONDS)
            ),
            enabled=bool(config.get("enabled", True)),
        )

    def catalog_needs_refresh(self, last_updated_at):
        if not self.enabled:
            return False
        return should_refresh_catalog(
            last_updated_at,
            interval_seconds=self.catalog_interval_seconds,
        )

    def product_needs_refresh(self, product_id, last_updated_at):
        del product_id
        if not self.enabled:
            return False
        return should_refresh_product(
            last_updated_at,
            ttl_seconds=self.product_ttl_seconds,
        )

    def build_catalog_and_product_plan(
        self,
        last_catalog_updated_at,
        product_id,
        last_product_updated_at,
        force_catalog_refresh=False,
    ):
        manual_trigger = bool(force_catalog_refresh)
        catalog_refresh = manual_trigger or self.catalog_needs_refresh(
            last_catalog_updated_at
        )
        product_refresh = self.product_needs_refresh(product_id, last_product_updated_at)
        reason = "fresh"
        if product_refresh:
            reason = "ttl_exceeded"
        elif not self.enabled and not manual_trigger:
            reason = "scheduler_disabled"

        return {
            "catalog_refresh": catalog_refresh,
            "product_refresh": product_refresh,
            "product_reason": reason,
            "manual_trigger": manual_trigger,
        }
