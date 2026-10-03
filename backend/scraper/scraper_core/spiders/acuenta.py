import os
import re
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urljoin, urlparse, urlunparse

import scrapy

from scraper_core.normalization import normalizar_ean_gtin, normalizar_precio_clp, normalizar_texto


class AcuentaRscSpider(scrapy.Spider):
    name = "acuenta_rsc"
    allowed_domains = ["acuenta.cl", "www.acuenta.cl"]
    default_category_urls = ("https://www.acuenta.cl/ca/congelados/04",)
    category_file = Path(__file__).parents[2] / "research" / "acuenta_categories.txt"
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

    def __init__(self, *args, add_url=None, **kwargs):
        super().__init__(*args, **kwargs)
        if add_url:
            self._append_category_url(add_url)

    @classmethod
    def from_crawler(cls, crawler, *args, **kwargs):
        spider = super().from_crawler(crawler, *args, **kwargs)
        file_urls = cls._read_category_urls()
        configured_urls = os.getenv("ACUENTA_CATEGORY_URLS", "")
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

        if page < self.max_pages and len(products) >= 1:
            yield scrapy.Request(
                self._page_url(category_url, page + 1),
                callback=self.parse,
                errback=self.handle_error,
                meta={"category_url": category_url, "page": page + 1},
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
        rsc_products = AcuentaRscSpider._extract_rsc_products(response)
        if rsc_products:
            return rsc_products

        products = []
        seen_urls = set()
        for link in response.css('a[href^="/p/"]'):
            product_url = urljoin(response.url, link.attrib.get("href", ""))
            if product_url in seen_urls:
                continue
            seen_urls.add(product_url)

            card = link.xpath("ancestor::*[.//text()[contains(., '$')]][1]")
            text = normalizar_texto(" ".join(card.xpath(".//text()").getall()))
            name = normalizar_texto(" ".join(link.xpath(".//text()").getall()))
            if not name or not text:
                continue

            prices, promotion = AcuentaRscSpider._prices_from_text(text)
            if prices is None:
                continue
            image = card.css("img::attr(src)").get()
            image = image or card.css("img::attr(data-src)").get()
            products.append(
                {
                    "producto": name,
                    "precio": prices[0],
                    "precio_normal": prices[1],
                    "precio_oferta": prices[0] if prices[0] < prices[1] else None,
                    "ean_gtin": None,
                    "sku": AcuentaRscSpider._sku_from_url(product_url),
                    "marca": AcuentaRscSpider._brand_from_text(text),
                    "formato_crudo": AcuentaRscSpider._format_from_text(name),
                    "mecanica_promocion": promotion,
                    "en_stock": None,
                    "url_producto": product_url,
                    "imagen": urljoin(response.url, image) if image else None,
                }
            )
        return products

    @staticmethod
    def _extract_rsc_products(response):
        text = response.text
        product_pattern = re.compile(
            r'\\"name(?:Complete)?\\":\\"(?P<name>.*?)\\".*?'
            r'\\"sku\\":\\"(?P<sku>\d+)\\".*?'
            r'\\"ean\\":(?P<ean>.*?),\\"maxQty\\".*?'
            r'\\"slug\\":\\"(?P<slug>.*?)\\",\\"brand\\":\\"(?P<brand>.*?)\\".*?'
            r'\\"stock\\":(?P<stock>[-]?\d+).*?'
            r'\\"priceBeforeTaxes\\":(?P<normal>[-]?\d+).*?'
            r'\\"promotion\\":(?P<promotion>null|\\"\$(?P<promotion_ref>[a-z0-9]+)\\")',
            re.DOTALL,
        )
        promotion_prices = {
            key: float(price)
            for key, price in re.findall(
                r'(?:^|\\n)([a-z0-9]+):\{"quantity":\d+,"price":(\d+)',
                text,
            )
        }
        products = []
        seen_skus = set()
        for match in product_pattern.finditer(text):
            sku = normalizar_texto(match.group("sku"))
            if not sku or sku in seen_skus:
                continue
            seen_skus.add(sku)
            normal_price = normalizar_precio_clp(match.group("normal"))
            current_price = normal_price
            promotion_ref = match.group("promotion_ref")
            if promotion_ref and promotion_ref in promotion_prices:
                current_price = promotion_prices[promotion_ref]
            ean_values = re.findall(r"\d{8,14}", match.group("ean"))
            ean = normalizar_ean_gtin(ean_values[0]) if ean_values else None
            slug = match.group("slug")
            name = normalizar_texto(match.group("name"))
            if not AcuentaRscSpider._name_matches_slug(name, slug):
                name = AcuentaRscSpider._name_from_slug(slug)
            product_url = urljoin(response.url, f"/p/{slug}")
            products.append(
                {
                    "producto": name,
                    "precio": current_price,
                    "precio_normal": normal_price,
                    "precio_oferta": current_price if current_price < normal_price else None,
                    "ean_gtin": ean,
                    "sku": sku,
                    "marca": normalizar_texto(match.group("brand")),
                    "formato_crudo": AcuentaRscSpider._format_from_text(name),
                    "mecanica_promocion": "promoción" if promotion_ref else None,
                    "en_stock": int(match.group("stock")) > 0,
                    "url_producto": product_url,
                    "imagen": None,
                }
            )
        return products

    @staticmethod
    def _name_matches_slug(name, slug):
        name_tokens = {
            token.lower()
            for token in re.findall(r"[a-záéíóúñ0-9]+", name or "")
            if len(token) > 2
        }
        slug_tokens = {
            token.lower()
            for token in re.findall(r"[a-záéíóúñ0-9]+", slug or "")
            if len(token) > 2
        }
        return len(name_tokens & slug_tokens) >= 2

    @staticmethod
    def _name_from_slug(slug):
        readable = re.sub(r"-\d+$", "", slug.replace("-", " "))
        return normalizar_texto(readable.title())

    @staticmethod
    def _prices_from_text(text):
        multi = re.search(r"\b(\d+)\s*[xX]\s*\$\s*([\d.,]+)", text)
        if multi:
            prefix_amounts = [
                normalizar_precio_clp(value)
                for value in re.findall(r"\$\s*([\d.,]+)", text[: multi.start()])
            ]
            prefix_amounts = [amount for amount in prefix_amounts if amount is not None]
            if prefix_amounts:
                current = prefix_amounts[-1]
            else:
                current = normalizar_precio_clp(multi.group(2))
            if current is not None:
                return (current, current), multi.group(0)

        amounts = [
            normalizar_precio_clp(value)
            for value in re.findall(r"\$\s*([\d.,]+)", text)
        ]
        amounts = [amount for amount in amounts if amount is not None]
        if not amounts:
            return None, None
        current = amounts[0]
        normal = amounts[1] if len(amounts) > 1 else current
        promotion = None
        if normal < current:
            normal = current
        return (current, normal), promotion

    @staticmethod
    def _brand_from_text(text):
        match = re.search(r"\b(Lider|Super Cerdo|La Crianza|Savory|Mega|PF)\b", text, re.IGNORECASE)
        return normalizar_texto(match.group(1)) if match else None

    @staticmethod
    def _format_from_text(text):
        match = re.search(
            r"\b\d+(?:[.,]\d+)?\s*(?:kg|g|gr|ml|lt|l|un(?:idad(?:es)?)?)\b",
            text,
            re.IGNORECASE,
        )
        return normalizar_texto(match.group(0)) if match else None

    @staticmethod
    def _sku_from_url(product_url):
        slug = urlparse(product_url).path.rstrip("/").split("/")[-1]
        match = re.search(r"-(\d+)$", slug)
        return f"ACUENTA-{match.group(1)}" if match else f"ACUENTA-{slug}"[:100]

    @staticmethod
    def _to_scraped_item(product, category, response_url):
        return {
            **product,
            "url_producto": product["url_producto"] or response_url,
            "supermercado": "A Cuenta",
            "categoria": category,
        }

    @staticmethod
    def _category_from_url(category_url):
        segments = [segment for segment in urlparse(category_url).path.split("/") if segment]
        return segments[-2] if segments and segments[-1].isdigit() else segments[-1]

    @staticmethod
    def _page_number(url):
        value = parse_qs(urlparse(url).query).get("currentPage", ["1"])[0]
        try:
            return max(1, int(value))
        except ValueError:
            return 1

    @staticmethod
    def _page_url(category_url, page):
        parsed = urlparse(category_url)
        query = {"currentPage": [str(page)]}
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
        if parsed.scheme != "https" or parsed.hostname not in {"acuenta.cl", "www.acuenta.cl"}:
            raise ValueError("La categoría debe ser una URL HTTPS pública de acuenta.cl")
        if not parsed.path.startswith("/ca/"):
            raise ValueError("La categoría de A Cuenta debe usar la ruta /ca/")
        return url