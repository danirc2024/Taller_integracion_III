import os

from itemadapter import ItemAdapter

from scraper_core.api_client import ScraperAPIClient


class ScraperCorePipeline:
    def __init__(self, api_client, batch_size):
        self.api_client = api_client
        self.batch_size = batch_size
        self.batch = []
        self.supermarket = None
        self.work_id = os.getenv("SCRAPER_TRABAJO_ID")

    @classmethod
    def from_crawler(cls, crawler):
        endpoint = crawler.settings.get("SCRAPER_API_URL")
        timeout = crawler.settings.getfloat("SCRAPER_API_TIMEOUT", 30.0)
        batch_size = crawler.settings.getint("SCRAPER_API_BATCH_SIZE", 100)
        if not endpoint:
            raise RuntimeError("SCRAPER_API_URL no está configurada")
        if batch_size < 1:
            raise ValueError("SCRAPER_API_BATCH_SIZE debe ser mayor que cero")

        return cls(
            api_client=ScraperAPIClient(endpoint=endpoint, timeout=timeout),
            batch_size=batch_size,
        )

    def process_item(self, item, spider):
        product = ItemAdapter(item).asdict()
        supermarket = product.pop("supermercado", None)
        if self.supermarket and supermarket != self.supermarket:
            self._flush()
        self.supermarket = supermarket or self.supermarket
        self.batch.append(product)

        if len(self.batch) >= self.batch_size:
            self._flush()
        return item

    def close_spider(self, spider):
        self._flush()

    def _flush(self):
        if not self.batch:
            return
        self.api_client.ingest_batch(
            self.batch,
            supermarket=self.supermarket,
            work_id=self.work_id,
        )
        self.batch = []
