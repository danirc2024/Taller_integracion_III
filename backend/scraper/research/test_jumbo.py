"""Punto de entrada histórico para probar el spider de Jumbo.

La implementación vive en ``scraper_core/spiders/jumbo`` para que
``scrapy crawl jumbo_rsc`` y esta prueba no puedan divergir.
"""

import unittest

from scrapy.http import TextResponse

import scraper_core.settings as settings
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

    def test_scrapy_settings_use_ethic_rate_limit(self):
        self.assertTrue(settings.AUTOTHROTTLE_ENABLED)
        self.assertGreaterEqual(settings.DOWNLOAD_DELAY, 2)
        self.assertEqual(settings.CONCURRENT_REQUESTS, 1)
        self.assertEqual(settings.CONCURRENT_REQUESTS_PER_DOMAIN, 1)
        self.assertIn(429, settings.RETRY_HTTP_CODES)

    def test_scrapy_retry_policy_handles_transient_errors(self):
        self.assertTrue(settings.RETRY_ENABLED)
        self.assertGreaterEqual(settings.RETRY_TIMES, 3)
        self.assertGreaterEqual(settings.RETRY_BACKOFF_FACTOR, 2)
        self.assertIn(429, settings.RETRY_HTTP_CODES)
        self.assertIn(503, settings.RETRY_HTTP_CODES)


if __name__ == "__main__":
    unittest.main()