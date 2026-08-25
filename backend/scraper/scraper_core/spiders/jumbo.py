import json
import os
from pathlib import Path
from urllib.parse import urlparse

import scrapy


class JumboRscSpider(scrapy.Spider):
    name = "jumbo_rsc"
    allowed_domains = ["jumbo.cl"]
    default_category_urls = (
        "https://www.jumbo.cl/frutas-y-verduras/verduras",
    )
    category_file = Path(__file__).parents[2] / "research" / "jumbo_categories.txt"

    custom_settings = {
        "LOG_LEVEL": "INFO",
        "DEFAULT_REQUEST_HEADERS": {
            "User-Agent": (
                "TallerIntegracionIII/1.0 (contacto del proyecto)"
            ),
            "Accept": "text/html,application/xhtml+xml",
        },
    }

    def parse(self, response):
        names = self._extract_names(response)
        category = response.url.rstrip("/").split("/")[-1]

        if not names:
            self.logger.warning(
                "No se encontraron productos en %s; el formato del sitio pudo cambiar",
                response.url,
            )

        for nombre in dict.fromkeys(names):
            yield {
                "producto": nombre,
                "supermercado": "Jumbo",
                "categoria": category,
            }

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(url, callback=self.parse, errback=self.handle_error)

    def handle_error(self, failure):
        request = failure.request
        response = getattr(failure.value, "response", None)
        status = response.status if response is not None else "sin respuesta"
        self.logger.error(
            "No se pudo procesar %s (HTTP %s): %s",
            request.url,
            status,
            failure.getErrorMessage(),
        )

    def __init__(self, *args, add_url=None, **kwargs):
        super().__init__(*args, **kwargs)
        if add_url:
            self._append_category_url(add_url)

    @classmethod
    def from_crawler(cls, crawler, *args, **kwargs):
        spider = super().from_crawler(crawler, *args, **kwargs)
        file_urls = cls._read_category_urls()
        configured_urls = os.getenv("JUMBO_CATEGORY_URLS", "")
        environment_urls = tuple(
            url.strip() for url in configured_urls.split(",") if url.strip()
        )
        urls = tuple(dict.fromkeys(file_urls + environment_urls))
        spider.start_urls = urls or cls.default_category_urls
        if not spider.start_urls:
            spider.logger.warning(
                "No hay categorías configuradas para Jumbo",
            )
        return spider

    @classmethod
    def _read_category_urls(cls):
        if not cls.category_file.exists():
            return ()
        return tuple(
            line.strip()
            for line in cls.category_file.read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.lstrip().startswith("#")
        )

    def _append_category_url(self, url):
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.hostname not in {"jumbo.cl", "www.jumbo.cl"}:
            raise ValueError("add_url debe ser una URL HTTPS pública de jumbo.cl")
        urls = self._read_category_urls()
        if url not in urls:
            self.category_file.parent.mkdir(parents=True, exist_ok=True)
            with self.category_file.open("a", encoding="utf-8") as file:
                file.write(f"{url}\n")

    @staticmethod
    def _extract_names(response):
        """Extrae nombres desde los bloques JSON-LD de la categoría."""
        names = []
        scripts = response.css('script[type="application/ld+json"]::text').getall()
        for script in scripts:
            try:
                data = json.loads(script)
            except json.JSONDecodeError:
                continue
            for entry in JumboRscSpider._walk_json(data):
                if entry.get("@type") == "Product":
                    name = entry.get("name")
                    if isinstance(name, str) and name.strip():
                        names.append(name.strip())
        return names

    @staticmethod
    def _walk_json(value):
        if isinstance(value, dict):
            yield value
            for child in value.values():
                yield from JumboRscSpider._walk_json(child)
        elif isinstance(value, list):
            for child in value:
                yield from JumboRscSpider._walk_json(child)