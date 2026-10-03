import json
import unittest

from scrapy.http import Request, TextResponse

from scraper_core.spiders.santa_isabel import SantaIsabelRscSpider


class SantaIsabelExtractionTest(unittest.TestCase):
    def _response(self, payload, page=1):
        category_url = "https://www.santaisabel.cl/despensa"
        url = SantaIsabelRscSpider._page_url(category_url, page)
        render_data = json.dumps(json.dumps(payload))
        body = f"<script>window.__renderData = {render_data};</script>"
        return TextResponse(
            url=url,
            request=Request(url, meta={"category_url": category_url, "page": page}),
            body=body.encode("utf-8"),
            encoding="utf-8",
        )

    def test_extracts_santa_isabel_render_data(self):
        payload = {
            "plp": {
                "plp_products": {
                    "products": [
                        {
                            "productId": "product-1",
                            "productName": "Cafe molido 250 g",
                            "brand": "Marca Test",
                            "linkText": "cafe-molido-250-g-product-1",
                            "items": [
                                {
                                    "itemId": "sku-1",
                                    "ean": "7800000000001",
                                    "measurementUnit": "un",
                                    "unitMultiplier": 1,
                                    "images": [{"imageUrl": "https://img.test/cafe.jpg"}],
                                    "sellers": [
                                        {
                                            "sellerName": "santaisabel",
                                            "commertialOffer": {
                                                "Price": "$990",
                                                "ListPrice": "1.290",
                                                "PriceWithoutDiscount": "1290.00",
                                                "AvailableQuantity": 3,
                                                "teasers": [{"name": "2x1"}],
                                            },
                                        }
                                    ],
                                }
                            ],
                        }
                    ]
                }
            }
        }

        products = SantaIsabelRscSpider._extract_products(self._response(payload))

        self.assertEqual(len(products), 1)
        product = products[0]
        self.assertEqual(product["precio"], 990.0)
        self.assertEqual(product["precio_normal"], 1290.0)
        self.assertEqual(product["precio_oferta"], 990.0)
        self.assertEqual(product["ean_gtin"], "7800000000001")
        self.assertEqual(product["sku"], "sku-1")
        self.assertEqual(product["mecanica_promocion"], "2x1")
        self.assertTrue(product["en_stock"])
        self.assertEqual(
            product["url_producto"],
            "https://www.santaisabel.cl/cafe-molido-250-g-product-1/p",
        )

    def test_category_pagination_preserves_category(self):
        url = SantaIsabelRscSpider._page_url(
            "https://www.santaisabel.cl/despensa", 2
        )

        self.assertEqual(url, "https://www.santaisabel.cl/despensa?page=2")

    def test_spider_obeys_robots_txt(self):
        self.assertTrue(SantaIsabelRscSpider.custom_settings["ROBOTSTXT_OBEY"])

    def test_only_uses_santa_isabel_seller(self):
        payload = {
            "plp": {
                "plp_products": {
                    "products": [
                        {
                            "productId": "product-1",
                            "productName": "Cafe",
                            "items": [
                                {
                                    "itemId": "sku-1",
                                    "sellers": [
                                        {
                                            "sellerName": "other-seller",
                                            "commertialOffer": {"Price": 990},
                                        }
                                    ],
                                }
                            ],
                        }
                    ]
                }
            }
        }

        self.assertEqual(
            SantaIsabelRscSpider._extract_products(self._response(payload)), []
        )


if __name__ == "__main__":
    unittest.main()