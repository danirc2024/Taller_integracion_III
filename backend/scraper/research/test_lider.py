import json
import unittest

from scrapy.http import Request, TextResponse

from scraper_core.spiders.lider import LiderRscSpider


class LiderExtractionTest(unittest.TestCase):
    def _response(
        self,
        body,
        url="https://super.lider.cl/browse/frutas-y-verduras/frutas/22884697_93034836?page=2",
    ):
        return TextResponse(
            url=url,
            request=Request(url, meta={"category_url": url, "page": 2}),
            body=body.encode("utf-8"),
            encoding="utf-8",
        )

    def test_extracts_regular_and_offer_prices_from_product_cards(self):
        body = """
        <div data-testid="item-stack">
          <div role="group" data-item-id="item-1" data-dca-id="00079919219638">
            <a href="/ip/cafe-te-y-hierbas/pack-cafe/00079919219638">
              <img data-testid="productTileImage" src="/images/cafe.webp">
            </a>
            <div data-automation-id="product-price">
              <div aria-hidden="true">$26.990</div>
              <span>precio actual $26.990, Costaba $30.970</span>
              <div><span class="strike">$30.970</span></div>
            </div>
            <div class="mb1 mt2 b f6 black mr1 lh-copy">Marca Lider</div>
            <span data-automation-id="product-title">Pack Café Molido 100g</span>
            <div>Available for Despacho</div>
          </div>
          <div role="group" data-item-id="item-2" data-dca-id="00040005049502">
            <a href="/ip/cafe-te-y-hierbas/cafe-veracruz/00040005049502">
              <img data-testid="productTileImage" src="/images/veracruz.webp">
            </a>
            <div data-automation-id="product-price">
              <div aria-hidden="true">$13.350</div>
              <span>precio actual $13.350</span>
            </div>
            <span data-automation-id="product-title">Café Veracruz</span>
          </div>
        </div>
        """

        products = LiderRscSpider._extract_products(self._response(body))

        self.assertEqual(len(products), 2)
        self.assertEqual(products[0]["precio"], 26990.0)
        self.assertEqual(products[0]["precio_normal"], 30970.0)
        self.assertEqual(products[0]["precio_oferta"], 26990.0)
        self.assertEqual(products[0]["ean_gtin"], "00079919219638")
        self.assertEqual(products[0]["marca"], "Marca Lider")
        self.assertEqual(products[0]["formato_crudo"], "100g")
        self.assertTrue(products[0]["en_stock"])
        self.assertEqual(products[1]["precio"], 13350.0)
        self.assertEqual(products[1]["precio_normal"], 13350.0)
        self.assertIsNone(products[1]["precio_oferta"])

    def test_prefers_all_hydrated_items_over_partial_product_cards(self):
        payload = {
            "props": {
                "pageProps": {
                    "initialData": {
                        "searchResult": {
                            "itemStacks": [
                                {
                                    "items": [
                                        {
                                            "usItemId": "00079919219638",
                                            "name": "Pack Café Descafeinado 100g",
                                            "brand": "Marca Test",
                                            "price": 26990,
                                            "priceInfo": {"wasPrice": "$30.970"},
                                            "canonicalUrl": "/ip/cafe/pack-cafe/00079919219638",
                                            "imageInfo": {
                                                "thumbnailUrl": "https://images.test/cafe.webp"
                                            },
                                            "isOutOfStock": False,
                                        },
                                        {
                                            "usItemId": "00040005049502",
                                            "name": "Café Veracruz",
                                            "price": 13350,
                                            "priceInfo": {"wasPrice": ""},
                                            "canonicalUrl": "/ip/cafe/veracruz/00040005049502",
                                            "imageInfo": {},
                                            "isOutOfStock": True,
                                        },
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        }
        body = (
            '<div data-testid="item-stack"><div role="group" data-item-id="tile-only" '
            'data-dca-id="00000000000001"><a href="/ip/cafe/tile-only/00000000000001">'
            '<span data-automation-id="product-title">Only card</span></a></div></div>'
            '<script id="__NEXT_DATA__" type="application/json">'
            f"{json.dumps(payload)}"
            "</script>"
        )

        products = LiderRscSpider._extract_products(self._response(body))

        self.assertEqual(len(products), 2)
        self.assertEqual(products[0]["precio"], 26990.0)
        self.assertEqual(products[0]["precio_normal"], 30970.0)
        self.assertEqual(products[0]["precio_oferta"], 26990.0)
        self.assertEqual(products[0]["marca"], "Marca Test")
        self.assertEqual(products[0]["imagen"], "https://images.test/cafe.webp")
        self.assertFalse(products[1]["en_stock"])

    def test_accepts_super_lider_category_and_product_routes(self):
        category_url = (
            "https://super.lider.cl/browse/frutas-y-verduras/frutas/"
            "22884697_93034836"
        )
        product_url = "https://super.lider.cl/ip/frutas/00203017000000"

        self.assertEqual(LiderRscSpider._validate_category_url(category_url), category_url)
        self.assertEqual(LiderRscSpider._validate_product_url(product_url), product_url)
        with self.assertRaises(ValueError):
            LiderRscSpider._validate_category_url(
                "https://www.lider.cl/browse/alimentacion/94975735"
            )

    def test_page_url_preserves_category_and_other_query_parameters(self):
        category_url = (
            "https://super.lider.cl/browse/frutas-y-verduras/frutas/"
            "22884697_93034836?sort=price"
        )

        self.assertEqual(
            LiderRscSpider._page_url(category_url, 2),
            "https://super.lider.cl/browse/frutas-y-verduras/frutas/"
            "22884697_93034836?sort=price&page=2",
        )
        self.assertEqual(
            LiderRscSpider._page_url(
                "https://super.lider.cl/browse/frutas-y-verduras/frutas/"
                "22884697_93034836?page=2",
                3,
            ),
            "https://super.lider.cl/browse/frutas-y-verduras/frutas/"
            "22884697_93034836?page=3",
        )
        self.assertEqual(
            LiderRscSpider._category_from_url(category_url), "frutas"
        )

    def test_page_limit_argument_is_configurable(self):
        spider = LiderRscSpider(max_pages="1")

        self.assertEqual(spider.max_pages, 1)

    def test_only_accepts_allowed_catalog_and_product_routes(self):
        with self.assertRaises(ValueError):
            LiderRscSpider._validate_category_url(
                "https://www.lider.cl/supermercado/category/frutas-y-verduras"
            )
        with self.assertRaises(ValueError):
            LiderRscSpider._validate_product_url("https://example.com/ip/item/1")


if __name__ == "__main__":
    unittest.main()