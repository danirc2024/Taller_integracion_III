from __future__ import annotations

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

    def enqueue(self, product_id, last_updated_at=None):
        if product_id in self._in_flight_refreshes:
            return {
                "product_id": product_id,
                "needs_refresh": False,
                "reason": "in_flight",
            }

        if last_updated_at is None or not isinstance(last_updated_at, datetime):
            self.mark_started(product_id)
            return {
                "product_id": product_id,
                "needs_refresh": True,
                "reason": "missing_timestamp",
            }

        if should_refresh_product(last_updated_at, ttl_seconds=self.product_ttl_seconds):
            self.mark_started(product_id)
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


class RefreshScheduler:
    """Coordina la decisión de refrescar catálogo y productos."""

    def __init__(
        self,
        catalog_interval_seconds: int = CATALOG_REFRESH_INTERVAL_SECONDS,
        product_ttl_seconds: int = PRODUCT_REFRESH_TTL_SECONDS,
    ):
        self.catalog_interval_seconds = catalog_interval_seconds
        self.product_ttl_seconds = product_ttl_seconds

    def catalog_needs_refresh(self, last_updated_at):
        return should_refresh_catalog(
            last_updated_at,
            interval_seconds=self.catalog_interval_seconds,
        )

    def product_needs_refresh(self, product_id, last_updated_at):
        del product_id
        return should_refresh_product(
            last_updated_at,
            ttl_seconds=self.product_ttl_seconds,
        )

    def build_catalog_and_product_plan(
        self,
        last_catalog_updated_at,
        product_id,
        last_product_updated_at,
    ):
        catalog_refresh = self.catalog_needs_refresh(last_catalog_updated_at)
        product_refresh = self.product_needs_refresh(product_id, last_product_updated_at)
        reason = "fresh"
        if product_refresh:
            reason = "ttl_exceeded"

        return {
            "catalog_refresh": catalog_refresh,
            "product_refresh": product_refresh,
            "product_reason": reason,
        }
