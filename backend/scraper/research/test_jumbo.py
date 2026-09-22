"""Punto de entrada histórico para probar el spider de Jumbo.

La implementación vive en ``scraper_core/spiders/jumbo`` para que
``scrapy crawl jumbo_rsc`` y esta prueba no puedan divergir.
"""

import unittest
from datetime import datetime, timedelta, timezone

from scrapy.http import TextResponse

from scraper_core.freshness import (
    build_refresh_decision,
    RefreshQueue,
    RefreshScheduler,
    should_refresh_catalog,
    should_refresh_product,
    should_skip_refresh,
)
from scraper_core.spiders.jumbo import JumboRscSpider


class JumboExtractionTest(unittest.TestCase):
    def test_extract_names_from_json_ld(self):
        response = TextResponse(
            url="https://www.jumbo.cl/frutas-y-verduras/verduras",
            body=(
                b'<script type="application/ld+json">'
                b'{"@graph":[{"item":{"@type":"Product",'
                b'"name":"Tomate Larga Vida","image":["https://img.test/tomate.jpg"],'
                b'"offers":{"price":"1290"}}}]}'
                b'</script>'
            ),
            encoding="utf-8",
        )

        self.assertEqual(
            JumboRscSpider._extract_products(response),
            [
                {
                    "producto": "Tomate Larga Vida",
                    "precio": 1290.0,
                    "precio_normal": None,
                    "precio_oferta": 1290.0,
                    "ean_gtin": None,
                    "sku": None,
                    "marca": None,
                    "formato_crudo": None,
                    "mecanica_promocion": None,
                    "en_stock": None,
                    "url_producto": None,
                    "imagen": "https://img.test/tomate.jpg",
                }
            ],
        )

    def test_category_is_taken_from_url(self):
        response = TextResponse(
            url="https://www.jumbo.cl/frutas-y-verduras/verduras",
            body=b"",
            encoding="utf-8",
        )

        self.assertEqual(response.url.rstrip("/").split("/")[-1], "verduras")

    def test_extracts_comparison_fields(self):
        response = TextResponse(
            url="https://www.jumbo.cl/frutas-y-verduras/verduras",
            body=(
                b'<script type="application/ld+json">'
                b'{"@type":"Product","name":"Lechuga", "gtin13":"7800000000001",'
                b'"sku":"SKU-1","brand":{"name":"Marca Test"},'
                b'"description":"1 unidad", "url":"https://jumbo.cl/p/lechuga",'
                b'"offers":{"price":"990","availability":"https://schema.org/InStock",'
                b'"offerDescription":"2x1"}}'
                b'</script>'
            ),
            encoding="utf-8",
        )

        product = JumboRscSpider._extract_products(response)[0]

        self.assertEqual(product["ean_gtin"], "7800000000001")
        self.assertEqual(product["sku"], "SKU-1")
        self.assertEqual(product["marca"], "Marca Test")
        self.assertEqual(product["formato_crudo"], "1 unidad")
        self.assertEqual(product["mecanica_promocion"], "2x1")
        self.assertTrue(product["en_stock"])
        self.assertEqual(product["url_producto"], "https://jumbo.cl/p/lechuga")

    def test_page_url_preserves_category(self):
        url = JumboRscSpider._page_url(
            "https://www.jumbo.cl/frutas-y-verduras/verduras", 2
        )

        self.assertEqual(
            url, "https://www.jumbo.cl/frutas-y-verduras/verduras?page=2"
        )

    def test_catalog_refresh_is_needed_when_never_updated(self):
        self.assertTrue(should_refresh_catalog(None))

    def test_catalog_refresh_is_not_needed_while_fresh(self):
        recent = datetime.now(timezone.utc) - timedelta(minutes=30)
        self.assertFalse(should_refresh_catalog(recent, interval_seconds=3600))

    def test_product_refresh_is_needed_after_ttl(self):
        stale = datetime.now(timezone.utc) - timedelta(minutes=45)
        self.assertTrue(should_refresh_product(stale, ttl_seconds=1800))

    def test_product_refresh_is_not_needed_while_fresh(self):
        recent = datetime.now(timezone.utc) - timedelta(minutes=10)
        self.assertFalse(should_refresh_product(recent, ttl_seconds=1800))

    def test_refresh_decision_marks_stale_product(self):
        stale = datetime.now(timezone.utc) - timedelta(minutes=45)
        decision = build_refresh_decision("sku-123", stale, ttl_seconds=1800)

        self.assertEqual(decision["product_id"], "sku-123")
        self.assertTrue(decision["needs_refresh"])
        self.assertEqual(decision["reason"], "ttl_exceeded")

    def test_duplicate_refresh_request_is_skipped(self):
        in_flight = {"sku-123"}
        self.assertTrue(should_skip_refresh("sku-123", in_flight))
        self.assertFalse(should_skip_refresh("sku-456", in_flight))

    def test_scheduler_marks_catalog_as_stale_after_interval(self):
        scheduler = RefreshScheduler(catalog_interval_seconds=3600, product_ttl_seconds=1800)
        stale = datetime.now(timezone.utc) - timedelta(hours=2)

        self.assertTrue(scheduler.catalog_needs_refresh(stale))
        self.assertFalse(
            scheduler.product_needs_refresh(
                "sku-1",
                datetime.now(timezone.utc) - timedelta(minutes=10),
            )
        )

    def test_queue_skips_duplicate_in_flight_refresh(self):
        queue = RefreshQueue(product_ttl_seconds=1800)

        queue.mark_started("sku-123")
        decision = queue.enqueue("sku-123")

        self.assertFalse(decision["needs_refresh"])
        self.assertEqual(decision["reason"], "in_flight")

    def test_queue_schedules_stale_product_refresh(self):
        queue = RefreshQueue(product_ttl_seconds=1800)
        stale = datetime.now(timezone.utc) - timedelta(minutes=45)

        decision = queue.enqueue("sku-777", last_updated_at=stale)

        self.assertTrue(decision["needs_refresh"])
        self.assertEqual(decision["reason"], "ttl_exceeded")

    def test_scheduler_decides_catalog_and_product_update_flow(self):
        scheduler = RefreshScheduler(catalog_interval_seconds=3600, product_ttl_seconds=1800)
        last_catalog = datetime.now(timezone.utc) - timedelta(hours=3)
        last_product = datetime.now(timezone.utc) - timedelta(minutes=45)

        self.assertTrue(scheduler.catalog_needs_refresh(last_catalog))
        self.assertTrue(scheduler.product_needs_refresh("sku-99", last_product))
        self.assertEqual(
            scheduler.build_catalog_and_product_plan(last_catalog, "sku-99", last_product),
            {
                "catalog_refresh": True,
                "product_refresh": True,
                "product_reason": "ttl_exceeded",
            },
        )


if __name__ == "__main__":
    unittest.main()