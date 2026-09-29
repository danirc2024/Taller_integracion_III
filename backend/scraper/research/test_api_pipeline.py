import json
import unittest
from urllib.request import Request

from scraper_core.api_client import ScraperAPIClient
from scraper_core.pipelines import ScraperCorePipeline


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class APIPipelineTest(unittest.TestCase):
    def test_client_posts_ingestion_contract(self):
        requests = []

        def opener(request, timeout):
            requests.append((request, timeout))
            return FakeResponse({"insertados": 1})

        client = ScraperAPIClient(
            "http://api.test/api/v1/scraper/productos",
            timeout=12,
            opener=opener,
        )
        result = client.ingest_batch(
            [{"sku": "sku-1", "producto": "Leche", "precio_normal": 1000}],
            supermarket="Jumbo",
        )

        request, timeout = requests[0]
        self.assertEqual(result, {"insertados": 1})
        self.assertEqual(request.full_url, "http://api.test/api/v1/scraper/productos")
        self.assertEqual(timeout, 12)
        self.assertEqual(
            json.loads(request.data),
            {
                "supermercado": "Jumbo",
                "productos": [
                    {"sku": "sku-1", "producto": "Leche", "precio_normal": 1000}
                ],
            },
        )

    def test_pipeline_flushes_batches(self):
        sent = []

        class FakeClient:
            def ingest_batch(self, products, supermarket=None, work_id=None):
                sent.append((products, supermarket, work_id))

        pipeline = ScraperCorePipeline(FakeClient(), batch_size=2)
        pipeline.process_item(
            {
                "sku": "sku-1",
                "producto": "Leche",
                "precio_normal": 1000,
                "supermercado": "Jumbo",
            },
            spider=None,
        )
        self.assertEqual(sent, [])

        pipeline.process_item(
            {
                "sku": "sku-2",
                "producto": "Pan",
                "precio_normal": 800,
                "supermercado": "Jumbo",
            },
            spider=None,
        )
        self.assertEqual(
            sent,
            [
                (
                    [
                        {"sku": "sku-1", "producto": "Leche", "precio_normal": 1000},
                        {"sku": "sku-2", "producto": "Pan", "precio_normal": 800},
                    ],
                    "Jumbo",
                    None,
                )
            ],
        )
        self.assertEqual(pipeline.batch, [])


if __name__ == "__main__":
    unittest.main()
