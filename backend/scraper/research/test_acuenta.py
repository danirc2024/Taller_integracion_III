import unittest

from scrapy.http import Request, TextResponse

from scraper_core.spiders.acuenta import AcuentaRscSpider


class AcuentaExtractionTest(unittest.TestCase):
    def _response(self, body, url="https://www.acuenta.cl/ca/congelados/04?currentPage=2"):
        return TextResponse(
            url=url,
            request=Request(url, meta={"category_url": url, "page": 2}),
            body=body.encode("utf-8"),
            encoding="utf-8",
        )

    def test_extracts_product_card(self):
        body = """
        <main><div class="product-card">
          <a href="/p/helado-chocolate-1-l-savory-1075736">Helado Chocolate Suizo 1 L Savory</a>
          <img src="/images/helado.webp">
          <div>$2.950 ($3.490) $2.950 por LT</div>
        </div></main>
        """

        product = AcuentaRscSpider._extract_products(self._response(body))[0]

        self.assertEqual(product["producto"], "Helado Chocolate Suizo 1 L Savory")
        self.assertEqual(product["precio"], 2950.0)
        self.assertEqual(product["precio_normal"], 3490.0)
        self.assertEqual(product["precio_oferta"], 2950.0)
        self.assertEqual(product["sku"], "ACUENTA-1075736")
        self.assertEqual(product["marca"], "Savory")
        self.assertEqual(product["formato_crudo"], "1 L")

    def test_page_url_removes_internal_rsc_token(self):
        url = "https://www.acuenta.cl/ca/congelados/04?currentPage=2&_rsc=2x5uv"

        self.assertEqual(
            AcuentaRscSpider._page_url(url, 3),
            "https://www.acuenta.cl/ca/congelados/04?currentPage=3",
        )
        self.assertEqual(AcuentaRscSpider._category_from_url(url), "congelados")

    def test_extracts_multiunit_promotion(self):
        prices, promotion = AcuentaRscSpider._prices_from_text(
            "$3.090 2 X $5.700 Carne molida"
        )

        self.assertEqual(prices, (3090.0, 3090.0))
        self.assertEqual(promotion, "2 X $5.700")

    def test_rejects_untrusted_urls(self):
        with self.assertRaises(ValueError):
            AcuentaRscSpider._validate_category_url("https://example.com/ca/congelados/04")


if __name__ == "__main__":
    unittest.main()