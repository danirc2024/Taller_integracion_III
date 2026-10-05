import json
import unittest

from scrapy.http import Request, TextResponse

from scraper_core.spiders.cugat import CugatRscSpider


class CugatExtractionTest(unittest.TestCase):
    def _response(
        self,
        body,
        url="https://cugat.cl/categoria-producto/bebidas-jugos-y-aguas/page/2/",
    ):
        return TextResponse(
            url=url,
            request=Request(url, meta={"category_url": url, "page": 2}),
            body=body.encode("utf-8"),
            encoding="utf-8",
        )

    def test_extracts_woocommerce_card_fields(self):
        body = """
        <div class="products"><div class="product-small col product type-product post-75118 instock"
            data-product_id="75118" data-product_sku="7801620000196">
          <a href="/producto/bebida-cugat/"><img data-src="/uploads/bebida.webp"></a>
          <p class="name product-title woocommerce-loop-product__title">
            <a href="/producto/bebida-cugat/">Bebida Cugat 350cc</a>
          </p>
          <span class="price"><del><span class="woocommerce-Price-amount amount">$7.290</span></del>
            <ins><span class="woocommerce-Price-amount amount">$6.290</span></ins></span>
                    <a class="add_to_cart_button" data-product_id="75118" data-product_sku="7801620000196"></a>
        </div></div>
        """

        product = CugatRscSpider._extract_products(self._response(body))[0]

        self.assertEqual(product["producto"], "Bebida Cugat 350cc")
        self.assertEqual(product["precio"], 6290.0)
        self.assertEqual(product["precio_normal"], 7290.0)
        self.assertEqual(product["precio_oferta"], 6290.0)
        self.assertEqual(product["ean_gtin"], "7801620000196")
        self.assertEqual(product["sku"], "75118")
        self.assertTrue(product["en_stock"])
        self.assertEqual(product["imagen"], "https://cugat.cl/uploads/bebida.webp")

    def test_page_url_and_category_preserve_cugat_path(self):
        category_url = "https://cugat.cl/categoria-producto/bebidas-jugos-y-aguas/"
        self.assertEqual(
            CugatRscSpider._page_url(category_url, 2),
            "https://cugat.cl/categoria-producto/bebidas-jugos-y-aguas/page/2/",
        )
        self.assertEqual(
            CugatRscSpider._page_url(
                "https://cugat.cl/categoria-producto/bebidas-jugos-y-aguas/page/2/",
                3,
            ),
            "https://cugat.cl/categoria-producto/bebidas-jugos-y-aguas/page/3/",
        )
        self.assertEqual(
            CugatRscSpider._category_from_url(
                "https://cugat.cl/categoria-producto/bebidas-jugos-y-aguas/page/2/"
            ),
            "bebidas-jugos-y-aguas",
        )

    def test_extracts_product_json_ld(self):
        payload = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Bebida Cugat",
            "sku": "7800000000001",
            "gtin13": "7800000000001",
            "brand": {"@type": "Brand", "name": "Marca Test"},
            "image": [{"url": "https://cugat.cl/bebida.webp"}],
            "offers": {
                "price": "1.290",
                "availability": "https://schema.org/InStock",
            },
        }
        response = self._response(
            f'<script type="application/ld+json">{json.dumps(payload)}</script>',
            "https://cugat.cl/producto/bebida-cugat/",
        )

        product = CugatRscSpider._extract_detail_product(response)

        self.assertEqual(product["precio"], 1290.0)
        self.assertEqual(product["ean_gtin"], "7800000000001")
        self.assertEqual(product["marca"], "Marca Test")
        self.assertTrue(product["en_stock"])

    def test_rejects_untrusted_urls(self):
        with self.assertRaises(ValueError):
            CugatRscSpider._validate_category_url("https://example.com/categoria/")


if __name__ == "__main__":
    unittest.main()