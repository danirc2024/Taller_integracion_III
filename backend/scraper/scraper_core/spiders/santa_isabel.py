import json
import os
import re
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urljoin, urlparse, urlunparse

import scrapy
from scraper_core.normalization import (
    normalizar_ean_gtin,
    normalizar_precio_clp,
    normalizar_texto,
)


class SantaIsabelRscSpider(scrapy.Spider):
    name = "santa_isabel_rsc"
    allowed_domains = ["santaisabel.cl"]
    default_category_urls = ("https://www.santaisabel.cl/despensa",)
    category_file = Path(__file__).parents[2] / "research" / "santa_isabel_categories.txt"
    max_pages = 100
    handle_httpstatus_list = [404]

    custom_settings = {
        "LOG_LEVEL": "INFO",
        "ROBOTSTXT_OBEY": True,
        "RETRY_HTTP_CODES": [429, 500, 503, 504],
        "DEFAULT_REQUEST_HEADERS": {
            "User-Agent": "TallerIntegracionIII/1.0 (contacto del proyecto)",
            "Accept": "text/html,application/xhtml+xml",
        },
    }

    def __init__(self, *args, add_url=None, **kwargs):
        super().__init__(*args, **kwargs)
        if add_url:
            self._append_category_url(add_url)

    @classmethod
    def from_crawler(cls, crawler, *args, **kwargs):
        spider = super().from_crawler(crawler, *args, **kwargs)
        file_urls = cls._read_category_urls()
        configured_urls = os.getenv("SANTA_ISABEL_CATEGORY_URLS", "")
        environment_urls = tuple(
            url.strip() for url in configured_urls.split(",") if url.strip()
        )
        urls = tuple(dict.fromkeys(file_urls + environment_urls))
        spider.start_urls = tuple(cls._validate_category_url(url) for url in urls)
        if not spider.start_urls:
            spider.start_urls = cls.default_category_urls
        return spider

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                callback=self.parse,
                errback=self.handle_error,
                meta={"category_url": url, "page": 1},
            )

    def parse(self, response):
        category_url = response.meta.get("category_url", response.url)
        page = int(response.meta.get("page", 1))
        if response.status == 404:
            self.logger.info("Fin de paginación para %s en page=%s", category_url, page)
            return

        products = self._extract_products(response)
        if not products:
            self.logger.warning(
                "No se encontraron productos en %s (status=%s); el formato del sitio pudo cambiar",
                response.url,
                response.status,
            )
            return

        category = urlparse(category_url).path.rstrip("/").split("/")[-1]
        for product in products:
            yield self._to_scraped_item(product, category, response.url)

        if page < self.max_pages:
            next_url = self._page_url(category_url, page + 1)
            yield scrapy.Request(
                next_url,
                callback=self.parse,
                errback=self.handle_error,
                meta={"category_url": category_url, "page": page + 1},
            )
        else:
            self.logger.warning(
                "Se alcanzó el límite de %d páginas para %s",
                self.max_pages,
                category_url,
            )

    @staticmethod
    def _extract_products(response):
        match = re.search(
            r'window\.__renderData\s*=\s*("(?:\\.|[^"\\])*")', response.text
        )
        if not match:
            return []

        try:
            render_data = json.loads(match.group(1))
            payload = json.loads(render_data)
        except (json.JSONDecodeError, TypeError):
            return []

        products = payload.get("plp", {}).get("plp_products", {}).get("products", [])
        if not isinstance(products, list):
            return []

        extracted = []
        for product in products:
            if not isinstance(product, dict):
                continue
            name = normalizar_texto(product.get("productName"))
            items = product.get("items") or []
            item = next((value for value in items if isinstance(value, dict)), None)
            if not name or item is None:
                continue

            sellers = item.get("sellers") or []
            seller = next(
                (
                    value
                    for value in sellers
                    if isinstance(value, dict)
                    and (value.get("sellerName") or "").lower() == "santaisabel"
                ),
                None,
            )
            if seller is None:
                continue

            offer = seller.get("commertialOffer") or {}
            price = normalizar_precio_clp(offer.get("Price"))
            if price is None:
                continue
            normal_price = (
                normalizar_precio_clp(offer.get("ListPrice"))
                or normalizar_precio_clp(offer.get("PriceWithoutDiscount"))
                or price
            )
            available_quantity = SantaIsabelRscSpider._number(
                offer.get("AvailableQuantity")
            )
            image_list = item.get("images") or []
            first_image = image_list[0] if image_list else {}
            slug = product.get("linkText")
            product_url = urljoin(
                response.url, f"/{slug}/p" if isinstance(slug, str) and slug else ""
            )
            teasers = offer.get("teasers") or []
            promotion_names = [
                teaser["name"]
                for teaser in teasers
                if isinstance(teaser, dict) and teaser.get("name")
            ]
            measurement = item.get("measurementUnit")
            multiplier = item.get("unitMultiplier")
            raw_format = " ".join(
                str(value) for value in (multiplier, measurement) if value is not None
            ) or None

            extracted.append(
                {
                    "producto": name,
                    "precio": price,
                    "precio_normal": normal_price,
                    "precio_oferta": price if price < normal_price else None,
                    "ean_gtin": normalizar_ean_gtin(item.get("ean")),
                    "sku": item.get("itemId") or product.get("productId"),
                    "marca": normalizar_texto(product.get("brand")),
                    "formato_crudo": raw_format,
                    "mecanica_promocion": ", ".join(promotion_names) or None,
                    "en_stock": available_quantity > 0
                    if available_quantity is not None
                    else None,
                    "url_producto": product_url,
                    "imagen": first_image.get("imageUrl")
                    if isinstance(first_image, dict)
                    else None,
                }
            )
        return extracted

    @staticmethod
    def _number(value):
        try:
            return float(value) if value is not None else None
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _to_scraped_item(product, category, response_url):
        return {
            **product,
            "url_producto": product["url_producto"] or response_url,
            "supermercado": "Santa Isabel",
            "categoria": category,
        }

    @staticmethod
    def _page_url(category_url, page):
        parsed = urlparse(category_url)
        query = parse_qs(parsed.query, keep_blank_values=True)
        query["page"] = [str(page)]
        return urlunparse(parsed._replace(query=urlencode(query, doseq=True)))

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
        self._validate_category_url(url)
        urls = self._read_category_urls()
        if url not in urls:
            self.category_file.parent.mkdir(parents=True, exist_ok=True)
            with self.category_file.open("a", encoding="utf-8") as file:
                file.write(f"{url}\n")

    def handle_error(self, failure):
        request = failure.request
        response = getattr(failure.value, "response", None)
        status = response.status if response is not None else "sin respuesta"
        if status == 404 and request.meta.get("page", 1) > 1:
            return
        self.logger.error(
            "No se pudo procesar %s (HTTP %s): %s",
            request.url,
            status,
            failure.getErrorMessage(),
        )

    @staticmethod
    def _validate_category_url(url):
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.hostname not in {
            "santaisabel.cl",
            "www.santaisabel.cl",
        }:
            raise ValueError("La categoría debe ser una URL HTTPS pública de santaisabel.cl")
        return url