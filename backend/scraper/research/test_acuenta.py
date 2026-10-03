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

    def test_merges_visible_offer_into_rsc_product(self):
        body = (
            '<main><div class="product-card">'
            '<a href="/p/helado-chocolate-1-l-savory-1075736">'
            'Helado Chocolate Suizo 1 L Savory</a>'
            '<div>$2.590 ($3.490) $2.590 por LT</div>'
            '</div></main>'
            '<script>self.__next_f.push([1,'
            r'\"name\":\"Helado Chocolate Suizo 1 L Savory\",\"sku\":\"1075736\",\"ean\":null,\"maxQty\":1,'
            r'\"slug\":\"helado-chocolate-1-l-savory-1075736\",\"brand\":\"Savory\",\"stock\":1,'
            r'\"priceBeforeTaxes\":3490,\"promotion\":\"$p1\"'
            '])</script>'
        )

        product = AcuentaRscSpider._extract_products(self._response(body))[0]

        self.assertEqual(product["precio"], 2590.0)
        self.assertEqual(product["precio_normal"], 3490.0)
        self.assertEqual(product["precio_oferta"], 2590.0)

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

    def test_does_not_cross_rsc_script_boundaries(self):
        body = (
            '<script>self.__next_f.push([1,'
            r'\"name\":\"Producto limpio\",\"sku\":\"123\",\"ean\":[\"7800000000001\"],\"maxQty\":1,'
            r'\"slug\":\"producto-limpio-123\",\"brand\":\"Marca\",\"stock\":1,'
            r'\"priceBeforeTaxes\":990,\"promotion\":null'
            '])</script><script>self.__next_f.push([1,'
            r'\"name\":\"otro bloque del runtime\"'
            '])</script>'
        )

        products = AcuentaRscSpider._extract_rsc_products(self._response(body))

        self.assertEqual(len(products), 1)
        self.assertEqual(products[0]["producto"], "Producto Limpio 123")
        self.assertEqual(products[0]["ean_gtin"], "7800000000001")
        self.assertNotIn("Script", products[0]["producto"])

    def test_resolves_rsc_ean_reference(self):
        body = (
            '<script>self.__next_f.push([1,'
            r'\"name\":\"Producto referencia\",\"sku\":\"456\",\"ean\":\"$ec\",\"maxQty\":1,'
            r'\"slug\":\"producto-referencia-456\",\"brand\":\"Marca\",\"stock\":1,'
            r'\"priceBeforeTaxes\":990,\"promotion\":null'
            '])</script><script>self.__next_f.push([1,'
            r'\nec:[\"7800000000002\"]'
            '])</script>'
        )

        products = AcuentaRscSpider._extract_rsc_products(self._response(body))

        self.assertEqual(products[0]["ean_gtin"], "7800000000002")

    def test_resolves_rsc_special_price_reference_chain(self):
        body = (
            '<script>self.__next_f.push([1,'
            r'\"name\":\"Producto oferta\",\"sku\":\"123\",\"ean\":null,\"maxQty\":1,'
            r'\"slug\":\"producto-oferta-123\",\"brand\":\"Marca\",\"stock\":1,'
            r'\"priceBeforeTaxes\":3490,\"promotion\":\"$d7\"'
            '])</script><script>self.__next_f.push([1,'
            r'\nd9:{\"quantity\":0,\"price\":2590,\"priceBeforeTaxes\":2590}'
            r'\nd8:[\"$d9\"]'
            r'\nd7:{\"type\":\"specialPrice\",\"conditions\":\"$d8\"}'
            '])</script>'
        )

        product = AcuentaRscSpider._extract_rsc_products(self._response(body))[0]

        self.assertEqual(product["precio"], 2590.0)
        self.assertEqual(product["precio_normal"], 3490.0)
        self.assertEqual(product["precio_oferta"], 2590.0)

    def test_does_not_use_multiunit_rsc_price_as_unit_offer(self):
        body = (
            '<script>self.__next_f.push([1,'
            r'\"name\":\"Producto pack\",\"sku\":\"456\",\"ean\":null,\"maxQty\":1,'
            r'\"slug\":\"producto-pack-456\",\"brand\":\"Marca\",\"stock\":1,'
            r'\"priceBeforeTaxes\":3490,\"promotion\":\"$p1\"'
            '])</script><script>self.__next_f.push([1,'
            r'\nc1:{\"quantity\":5,\"price\":2000,\"priceBeforeTaxes\":2000}'
            r'\nc0:[\"$c1\"]'
            r'\np1:{\"type\":\"nx$\",\"conditions\":\"$c0\"}'
            '])</script>'
        )

        product = AcuentaRscSpider._extract_rsc_products(self._response(body))[0]

        self.assertEqual(product["precio_oferta"], None)

    def test_resolves_rsc_image_reference(self):
        body = (
            '<script>self.__next_f.push([1,'
            r'\"name\":\"Producto imagen\",\"sku\":\"789\",\"ean\":null,\"maxQty\":1,'
            r'\"slug\":\"producto-imagen-789\",\"brand\":\"Marca\",\"stock\":1,'
            r'\"photosUrl\":\"$d5\",\"priceBeforeTaxes\":990,\"promotion\":null'
            '])</script><script>self.__next_f.push([1,'
            r'\nd5:[\"https://images.test/producto.jpg\"]'
            '])</script>'
        )

        products = AcuentaRscSpider._extract_rsc_products(self._response(body))

        self.assertEqual(products[0]["imagen"], "https://images.test/producto.jpg")

    def test_uses_exact_image_variant_published_for_sku(self):
        text = (
            r'd5:["https://images.lider.cl/wmtcl?source=url[file:/productos/'
            r'4756977aa.jpg]\u0026sink"]'
        )

        image = AcuentaRscSpider._image_from_rsc(text, "4756977")

        self.assertEqual(
            image,
            "https://images.lider.cl/wmtcl?source=url[file:/productos/4756977aa.jpg]&sink",
        )

    def test_encodes_image_proxy_brackets(self):
        image = AcuentaRscSpider._canonical_image_url(
            "https://images.lider.cl/wmtcl?source=url[file:/productos/4756977aa.jpg]&sink"
        )

        self.assertEqual(
            image,
            "https://images.lider.cl/wmtcl?source=url%5Bfile:/productos/4756977aa.jpg%5D&sink",
        )

    def test_rejects_untrusted_urls(self):
        with self.assertRaises(ValueError):
            AcuentaRscSpider._validate_category_url("https://example.com/ca/congelados/04")


if __name__ == "__main__":
    unittest.main()