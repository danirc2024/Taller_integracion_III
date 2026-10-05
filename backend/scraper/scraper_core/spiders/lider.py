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


class LiderRscSpider(scrapy.Spider):
    name = "lider_rsc"
    allowed_domains = ["super.lider.cl"]
    default_category_urls = (
        "https://super.lider.cl/browse/frutas-y-verduras/frutas/22884697_93034836",
    )
    category_file = Path(__file__).parents[2] / "research" / "lider_categories.txt"
    max_pages = 100
    handle_httpstatus_list = [404]

    custom_settings = {
        "LOG_LEVEL": "INFO",
        "ROBOTSTXT_OBEY": True,
        "DEFAULT_REQUEST_HEADERS": {
            "User-Agent": "TallerIntegracionIII/1.0 (contacto del proyecto)",
            "Accept": "text/html,application/xhtml+xml",
        },
    }

    def __init__(self, *args, add_url=None, max_pages=None, **kwargs):
        super().__init__(*args, **kwargs)
        if add_url:
            self._append_category_url(add_url)
        if max_pages is not None:
            self.max_pages = max(1, int(max_pages))

    @classmethod
    def from_crawler(cls, crawler, *args, **kwargs):
        spider = super().from_crawler(crawler, *args, **kwargs)
        file_urls = cls._read_category_urls()
        configured_urls = os.getenv("LIDER_CATEGORY_URLS", "")
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
            page = self._page_number(url)
            yield scrapy.Request(
                self._page_url(url, page),
                callback=self.parse,
                errback=self.handle_error,
                meta={"category_url": url, "page": page},
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
                "No se encontraron productos en %s (status=%s); el formato pudo cambiar",
                response.url,
                response.status,
            )
            return

        category = self._category_from_url(category_url)
        for product in products:
            yield self._to_scraped_item(product, category, response.url)

        if page < self.max_pages:
            yield scrapy.Request(
                self._page_url(category_url, page + 1),
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
    def _extract_products(response):
        hydrated_products = LiderRscSpider._extract_next_data_products(response)
        if hydrated_products is not None:
            return hydrated_products

        return LiderRscSpider._extract_card_products(response)

    @staticmethod
    def _extract_next_data_products(response):
        payload_text = response.css("script#__NEXT_DATA__::text").get()
        if not payload_text:
            return None
        try:
            payload = json.loads(payload_text)
        except json.JSONDecodeError:
            return None

        search_result = (
            payload.get("props", {})
            .get("pageProps", {})
            .get("initialData", {})
            .get("searchResult", {})
        )
        item_stacks = search_result.get("itemStacks")
        if not isinstance(item_stacks, list):
            return None

        products = []
        for stack in item_stacks:
            if not isinstance(stack, dict):
                continue
            items = stack.get("items") or []
            if not isinstance(items, list):
                continue
            for item in items:
                if not isinstance(item, dict):
                    continue
                name = normalizar_texto(item.get("name"))
                product_code = normalizar_ean_gtin(item.get("usItemId"))
                current_price = normalizar_precio_clp(item.get("price"))
                if not name or not product_code or current_price is None:
                    continue

                price_info = item.get("priceInfo") or {}
                normal_price = normalizar_precio_clp(price_info.get("wasPrice"))
                if normal_price is None:
                    normal_price = normalizar_precio_clp(price_info.get("itemPrice"))
                if normal_price is None:
                    normal_price = current_price

                product_url = item.get("canonicalUrl")
                if not isinstance(product_url, str) or not product_url:
                    continue
                product_url = urljoin(response.url, product_url)
                try:
                    LiderRscSpider._validate_product_url(product_url)
                except ValueError:
                    continue

                image_info = item.get("imageInfo") or {}
                image = image_info.get("thumbnailUrl")
                out_of_stock = item.get("isOutOfStock")
                in_stock = not out_of_stock if isinstance(out_of_stock, bool) else None
                products.append(
                    {
                        "producto": name,
                        "precio": current_price,
                        "precio_normal": normal_price,
                        "precio_oferta": (
                            current_price if current_price < normal_price else None
                        ),
                        "ean_gtin": product_code,
                        "sku": normalizar_texto(item.get("sku")) or product_code,
                        "marca": normalizar_texto(item.get("brand")),
                        "formato_crudo": LiderRscSpider._format_from_text(name),
                        "mecanica_promocion": (
                            "promoción" if current_price < normal_price else None
                        ),
                        "en_stock": in_stock,
                        "url_producto": product_url,
                        "imagen": urljoin(response.url, image) if image else None,
                    }
                )
        return products

    @staticmethod
    def _extract_card_products(response):
        cards = response.css(
            '[data-testid="item-stack"] div[role="group"][data-item-id]'
        )
        if not cards:
            cards = response.css('div[role="group"][data-dca-id]')

        products = []
        for card in cards:
            name = normalizar_texto(
                " ".join(card.css('[data-automation-id="product-title"]::text').getall())
            )
            product_url = card.css('a[href*="/ip/"]::attr(href)').get()
            price_block = card.css('[data-automation-id="product-price"]')
            current_price = LiderRscSpider._price_from(
                price_block, 'div[aria-hidden="true"]'
            )
            if not name or not product_url or current_price is None:
                continue

            product_url = urljoin(response.url, product_url)
            try:
                LiderRscSpider._validate_product_url(product_url)
            except ValueError:
                continue

            normal_price = LiderRscSpider._price_from(price_block, "span.strike")
            if normal_price is None:
                normal_price = current_price

            product_code = normalizar_ean_gtin(
                card.attrib.get("data-dca-id")
                or urlparse(product_url).path.rstrip("/").split("/")[-1]
            )
            image = card.css('img[data-testid="productTileImage"]::attr(src)').get()
            image = image or card.css("img::attr(data-src)").get()
            image = image or card.css("img::attr(src)").get()
            card_text = " ".join(card.xpath(".//text()").getall()).lower()
            if "available for despacho" in card_text or "available for pickup" in card_text:
                in_stock = True
            elif "agotado" in card_text or "no disponible" in card_text:
                in_stock = False
            else:
                in_stock = None

            products.append(
                {
                    "producto": name,
                    "precio": current_price,
                    "precio_normal": normal_price,
                    "precio_oferta": (
                        current_price if current_price < normal_price else None
                    ),
                    "ean_gtin": product_code,
                    "sku": product_code or card.attrib.get("data-item-id"),
                    "marca": normalizar_texto(card.css("div.mb1.mt2.b::text").get()),
                    "formato_crudo": LiderRscSpider._format_from_text(name),
                    "mecanica_promocion": (
                        "promoción" if current_price < normal_price else None
                    ),
                    "en_stock": in_stock,
                    "url_producto": product_url,
                    "imagen": urljoin(response.url, image) if image else None,
                }
            )
        return products

    @staticmethod
    def _price_from(selector, price_selector):
        amount = selector.css(price_selector).xpath("string(.)").get()
        return normalizar_precio_clp(amount)

    @staticmethod
    def _format_from_text(name):
        match = re.search(
            r"\b\d+(?:[.,]\d+)?\s*(?:kg|grs?|g|ml|lt|l|un(?:idades?)?)\b",
            name,
            re.IGNORECASE,
        )
        return normalizar_texto(match.group(0)) if match else None

    @staticmethod
    def _to_scraped_item(product, category, response_url):
        return {
            **product,
            "url_producto": product["url_producto"] or response_url,
            "supermercado": "Lider",
            "categoria": category,
        }

    @staticmethod
    def _category_from_url(category_url):
        segments = [segment for segment in urlparse(category_url).path.split("/") if segment]
        if segments and segments[0] == "browse":
            segments = segments[1:]
        if segments and re.fullmatch(r"\d+(?:_\d+)*", segments[-1]):
            segments = segments[:-1]
        return segments[-1] if segments else "sin_categoria"

    @staticmethod
    def _page_number(url):
        value = parse_qs(urlparse(url).query).get("page", ["1"])[0]
        try:
            return max(1, int(value))
        except ValueError:
            return 1

    @staticmethod
    def _page_url(category_url, page):
        parsed = urlparse(category_url)
        query = parse_qs(parsed.query, keep_blank_values=True)
        if page <= 1:
            query.pop("page", None)
        else:
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

    @staticmethod
    def _validate_category_url(url):
        parsed = urlparse(url)
        if (
            parsed.scheme != "https"
            or parsed.hostname != "super.lider.cl"
            or not parsed.path.startswith("/browse/")
        ):
            raise ValueError("La categoría debe ser una URL HTTPS /browse/ de super.lider.cl")
        return url

    @staticmethod
    def _validate_product_url(url):
        parsed = urlparse(url)
        if (
            parsed.scheme != "https"
            or parsed.hostname != "super.lider.cl"
            or not parsed.path.startswith("/ip/")
        ):
            raise ValueError("product_url debe ser una URL HTTPS /ip/ de super.lider.cl")
        return url
