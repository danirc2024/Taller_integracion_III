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
