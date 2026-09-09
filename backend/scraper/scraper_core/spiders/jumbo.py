import json
import os
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

import scrapy


class JumboRscSpider(scrapy.Spider):
    name = "jumbo_rsc"
    allowed_domains = ["jumbo.cl"]
    default_category_urls = (
        "https://www.jumbo.cl/frutas-y-verduras/verduras",
    )
    category_file = Path(__file__).parents[2] / "research" / "jumbo_categories.txt"
    max_pages = 20

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
        products = self._extract_products(response)
        category_url = response.meta.get("category_url", response.url)
        category = urlparse(category_url).path.rstrip("/").split("/")[-1]

        if not products:
            self.logger.warning(
                "No se encontraron productos en %s; el formato del sitio pudo cambiar",
                response.url,
            )

        for product in products:
            yield {
                "producto": product["producto"],
                "precio": product["precio"],
                "imagen": product["imagen"],
                "supermercado": "Jumbo",
                "categoria": category,
            }

        page = int(response.meta.get("page", 1))
        if products and page < self.max_pages:
            next_url = self._page_url(category_url, page + 1)
            yield scrapy.Request(
                next_url,
                callback=self.parse,
                errback=self.handle_error,
                meta={"category_url": category_url, "page": page + 1},
            )
        elif products:
            self.logger.warning(
                "Se alcanzó el límite de %d páginas para %s",
                self.max_pages,
                category_url,
            )

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                callback=self.parse,
                errback=self.handle_error,
                meta={"category_url": url, "page": 1},
            )

    @staticmethod
    def _page_url(category_url, page):
        parsed = urlparse(category_url)
        query = parse_qs(parsed.query, keep_blank_values=True)
        query["page"] = [str(page)]
        return urlunparse(parsed._replace(query=urlencode(query, doseq=True)))

    def handle_error(self, failure):
        request = failure.request
        response = getattr(failure.value, "response", None)
        status = response.status if response is not None else "sin respuesta"
        if status == 404 and request.meta.get("page", 1) > 1:
            self.logger.info(
                "Fin de paginación para %s en page=%s",
                request.meta.get("category_url", request.url),
                request.meta["page"],
            )
            return
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
    def _extract_products(response):
        """Extrae nombre, precio e imagen desde los bloques JSON-LD."""
        products = []
        seen = set()
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
                        name = name.strip()
                        if name in seen:
                            continue
                        seen.add(name)
                        offer = entry.get("offers", {})
                        if isinstance(offer, list):
                            offer = offer[0] if offer else {}
                        image = entry.get("image")
                        if isinstance(image, list):
                            image = image[0] if image else None
                        products.append(
                            {
                                "producto": name,
                                "precio": offer.get("price") if isinstance(offer, dict) else None,
                                "imagen": image if isinstance(image, str) else None,
                            }
                        )
        return products

    @staticmethod
    def _walk_json(value):
        if isinstance(value, dict):
            yield value
            for child in value.values():
                yield from JumboRscSpider._walk_json(child)
        elif isinstance(value, list):
            for child in value:
                yield from JumboRscSpider._walk_json(child)