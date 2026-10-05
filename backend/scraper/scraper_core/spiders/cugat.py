import json
import os
from pathlib import Path
from urllib.parse import urljoin, urlparse

import scrapy
from scraper_core.normalization import (
    normalizar_ean_gtin,
    normalizar_precio_clp,
    normalizar_texto,
)


class CugatRscSpider(scrapy.Spider):
    name = "cugat_rsc"
    allowed_domains = ["cugat.cl"]
    default_category_urls = (
        "https://cugat.cl/categoria-producto/bebidas-jugos-y-aguas/",
    )
    category_file = Path(__file__).parents[2] / "research" / "cugat_categories.txt"
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

    def __init__(self, *args, add_url=None, enrich_details=False, **kwargs):
        super().__init__(*args, **kwargs)
        self.enrich_details = str(enrich_details).lower() in {"1", "true", "yes"}
        if add_url:
            self._append_category_url(add_url)

    @classmethod
    def from_crawler(cls, crawler, *args, **kwargs):
        spider = super().from_crawler(crawler, *args, **kwargs)
        file_urls = cls._read_category_urls()
        configured_urls = os.getenv("CUGAT_CATEGORY_URLS", "")
        environment_urls = tuple(
            url.strip() for url in configured_urls.split(",") if url.strip()
        )
        urls = tuple(dict.fromkeys(file_urls + environment_urls))
        spider.start_urls = tuple(cls._validate_category_url(url) for url in urls)
        if not spider.start_urls:
            spider.start_urls = cls.default_category_urls
        return spider

    def start_requests(self):
        product_url = getattr(self, "product_url", None)
        if product_url:
            product_url = self._validate_product_url(product_url)
            yield scrapy.Request(
                product_url,
                callback=self.parse_product,
                errback=self.handle_error,
                meta={"product_url": product_url},
            )
            return

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

        category = self._category_from_url(category_url)
        for product in products:
            product_url = product.get("url_producto")
            if self.enrich_details and product_url:
                yield scrapy.Request(
                    product_url,
                    callback=self.parse_product_detail,
                    errback=self.handle_detail_error,
                    cb_kwargs={
                        "catalog_product": product,
                        "category": category,
                        "category_page_url": response.url,
                    },
                )
            else:
                yield self._to_scraped_item(product, category, response.url)

        if page < self.max_pages:
            next_url = self._page_url(category_url, page + 1)
            yield scrapy.Request(
                next_url,
                callback=self.parse,
                errback=self.handle_error,
                meta={"category_url": category_url, "page": page + 1},
            )

    def parse_product(self, response):
        product = self._extract_detail_product(response)
        if product is not None:
            yield self._to_scraped_item(product, "producto", response.url)

    def parse_product_detail(
        self, response, catalog_product, category, category_page_url
    ):
        detail_product = self._extract_detail_product(response)
        enriched_product = dict(catalog_product)
        if detail_product:
            for field, value in detail_product.items():
                if value is not None:
                    enriched_product[field] = value
        yield self._to_scraped_item(enriched_product, category, category_page_url)

    def handle_detail_error(self, failure):
        request = failure.request
        self.logger.warning("No se pudo enriquecer el producto %s", request.url)
        yield self._to_scraped_item(
            request.cb_kwargs["catalog_product"],
            request.cb_kwargs["category"],
            request.cb_kwargs["category_page_url"],
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
        products = []
        for card in response.css("div.products div.product-small.product"):
            name = normalizar_texto(card.css("p.product-title a::text").get())
            if not name:
                continue

            offer_price = CugatRscSpider._price_from(card, "ins")
            normal_price = CugatRscSpider._price_from(card, "del")
            if offer_price is None:
                offer_price = CugatRscSpider._price_from(card, "span.price")
            if normal_price is None:
                normal_price = offer_price
            product_url = card.css("p.product-title a::attr(href)").get()
            image = card.css("img::attr(data-src)").get()
            image = image or card.css("img::attr(data-lazy-src)").get()
            image = image or card.css("noscript img::attr(src)").get()
            image = image or card.css("img::attr(src)").get()
            cart_link = card.css("a.add_to_cart_button")
            sku = normalizar_ean_gtin(cart_link.attrib.get("data-product_sku"))
            product_id = cart_link.attrib.get("data-product_id") or card.attrib.get(
                "id", ""
            ).removeprefix("product-")

            products.append(
                {
                    "producto": name,
                    "precio": offer_price,
                    "precio_normal": normal_price,
                    "precio_oferta": (
                        offer_price
                        if normal_price is not None and offer_price < normal_price
                        else None
                    ),
                    "ean_gtin": sku,
                    "sku": product_id or sku,
                    "marca": None,
                    "formato_crudo": None,
                    "mecanica_promocion": None,
                    "en_stock": "instock" in card.attrib.get("class", "").split(),
                    "url_producto": urljoin(response.url, product_url)
                    if product_url
                    else None,
                    "imagen": urljoin(response.url, image) if image else None,
                }
            )
        return products

    @staticmethod
    def _price_from(card, selector):
        amount = card.css(selector).xpath(
            ".//span[contains(@class, 'woocommerce-Price-amount')][1]"
        ).xpath("string(.)").get()
        return normalizar_precio_clp(amount)

    @staticmethod
    def _extract_detail_product(response):
        for script in response.css('script[type="application/ld+json"]::text').getall():
            try:
                data = json.loads(script)
            except json.JSONDecodeError:
                continue
            for entry in CugatRscSpider._walk_json(data):
                types = entry.get("@type")
                if types == "Product" or (
                    isinstance(types, list) and "Product" in types
                ):
                    offers = entry.get("offers") or {}
                    if isinstance(offers, list):
                        offers = offers[0] if offers else {}
                    price = normalizar_precio_clp(offers.get("price"))
                    image = entry.get("image")
                    if isinstance(image, list):
                        image = image[0] if image else None
                    if isinstance(image, dict):
                        image = image.get("url")
                    brand = entry.get("brand")
                    if isinstance(brand, dict):
                        brand = brand.get("name")
                    return {
                        "producto": normalizar_texto(entry.get("name")),
                        "precio": price,
                        "precio_normal": price,
                        "precio_oferta": None,
                        "ean_gtin": normalizar_ean_gtin(
                            entry.get("gtin13") or entry.get("gtin")
                        ),
                        "sku": normalizar_texto(entry.get("sku")),
                        "marca": normalizar_texto(brand),
                        "formato_crudo": normalizar_texto(entry.get("description")),
                        "mecanica_promocion": None,
                        "en_stock": CugatRscSpider._stock_value(
                            offers.get("availability")
                        ),
                        "url_producto": entry.get("url") or response.url,
                        "imagen": image if isinstance(image, str) else None,
                    }
        return None

    @staticmethod
    def _walk_json(value):
        if isinstance(value, dict):
            yield value
            for child in value.values():
                yield from CugatRscSpider._walk_json(child)
        elif isinstance(value, list):
            for child in value:
                yield from CugatRscSpider._walk_json(child)

    @staticmethod
    def _stock_value(availability):
        if not isinstance(availability, str):
            return None
        return availability.rsplit("/", 1)[-1].lower() != "outofstock"

    @staticmethod
    def _to_scraped_item(product, category, response_url):
        return {
            **product,
            "url_producto": product["url_producto"] or response_url,
            "supermercado": "Cugat",
            "categoria": category,
        }

    @staticmethod
    def _category_from_url(category_url):
        segments = [segment for segment in urlparse(category_url).path.split("/") if segment]
        if len(segments) >= 2 and segments[-2] == "page":
            segments = segments[:-2]
        return segments[-1] if segments else "sin_categoria"

    @staticmethod
    def _page_url(category_url, page):
        parsed = urlparse(category_url)
        segments = [segment for segment in parsed.path.split("/") if segment]
        if len(segments) >= 2 and segments[-2] == "page" and segments[-1].isdigit():
            segments = segments[:-2]
        path = "/" + "/".join(segments)
        return parsed._replace(path=f"{path}/page/{page}/").geturl()

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
        if parsed.scheme != "https" or parsed.hostname not in {"cugat.cl", "www.cugat.cl"}:
            raise ValueError("La categoría debe ser una URL HTTPS pública de cugat.cl")
        return url

    @staticmethod
    def _validate_product_url(url):
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.hostname not in {"cugat.cl", "www.cugat.cl"}:
            raise ValueError("product_url debe ser una URL HTTPS pública de cugat.cl")
        return url