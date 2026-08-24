"""Punto de entrada histórico para probar el spider de Jumbo.

La implementación vive en ``scraper_core/spiders/jumbo`` para que
``scrapy crawl jumbo_rsc`` y esta prueba no puedan divergir.
"""

import unittest

from scrapy.http import TextResponse

from scraper_core.spiders.jumbo import JumboRscSpider


class JumboExtractionTest(unittest.TestCase):
    def test_extract_names_from_json_ld(self):
        response = TextResponse(
            url="https://www.jumbo.cl/frutas-y-verduras/verduras",
            body=(
                b'<script type="application/ld+json">'
                b'{"@graph":[{"item":{"@type":"Product",'
                b'"name":"Tomate Larga Vida"}}]}'
                b'</script>'
            ),
            encoding="utf-8",
        )

        self.assertEqual(
            JumboRscSpider._extract_names(response), ["Tomate Larga Vida"]
        )

    def test_category_is_taken_from_url(self):
        response = TextResponse(
            url="https://www.jumbo.cl/frutas-y-verduras/verduras",
            body=b"",
            encoding="utf-8",
        )

        self.assertEqual(response.url.rstrip("/").split("/")[-1], "verduras")


if __name__ == "__main__":
    unittest.main()