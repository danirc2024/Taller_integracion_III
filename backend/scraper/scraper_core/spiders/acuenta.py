import os
import re
from pathlib import Path
from urllib.parse import parse_qs, quote, urlencode, urljoin, urlparse, urlunparse

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
            return AcuentaRscSpider._merge_visible_prices(response, rsc_products)

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
    def _merge_visible_prices(response, products):
        products_by_url = {product["url_producto"]: product for product in products}
        for link in response.css('a[href^="/p/"]'):
            product_url = urljoin(response.url, link.attrib.get("href", ""))
            product = products_by_url.get(product_url)
            if product is None:
                continue

            card = link.xpath("ancestor::*[.//text()[contains(., '$')]][1]")
            text = normalizar_texto(" ".join(card.xpath(".//text()").getall()))
            prices, promotion = AcuentaRscSpider._prices_from_text(text)
            if prices is None:
                continue

            current_price, normal_price = prices
            if current_price < normal_price:
                product["precio"] = current_price
                product["precio_normal"] = normal_price
                product["precio_oferta"] = current_price
                product["mecanica_promocion"] = product["mecanica_promocion"] or "promoción"
            if promotion:
                product["mecanica_promocion"] = promotion

        return products

    @staticmethod
    def _extract_rsc_promotion_prices(text):
        references = dict(
            re.findall(
                r'(?:^|\\n)([a-z0-9]+):(.*?)(?=\\n[a-z0-9]+:|$)',
                text,
                re.DOTALL,
            )
        )
        promotion_prices = {}
        for promotion_ref, promotion_data in references.items():
            promotion_type = re.search(
                r'\\"type\\":\\"([^"\\]+)\\"', promotion_data
            )
            if not promotion_type or promotion_type.group(1) != "specialPrice":
                continue

            conditions_match = re.search(
                r'\\"conditions\\":\\"\$([a-z0-9]+)\\"', promotion_data
            )
            if not conditions_match:
                continue

            condition_refs = re.findall(
                r'\\"\$([a-z0-9]+)\\"',
                references.get(conditions_match.group(1), ""),
            )
            prices = []
            for condition_ref in condition_refs:
                condition_data = references.get(condition_ref, "")
                price_match = re.search(
                    r'\\"priceBeforeTaxes\\":(\d+)',
                    condition_data,
                )
                if price_match:
                    price = normalizar_precio_clp(price_match.group(1))
                    if price is not None:
                        prices.append(price)
            if prices:
                promotion_prices[promotion_ref] = min(prices)

        return promotion_prices

    @staticmethod
    def _extract_rsc_products(response):
        text = response.text
        promotion_prices = AcuentaRscSpider._extract_rsc_promotion_prices(text)
        ean_references = {
            key: value
            for key, value in re.findall(
                r'(?:^|\\n)([a-z0-9]+):\[\\"?(\d{8,14})',
                text,
            )
        }
        products = []
        seen_skus = set()
        sku_pattern = re.compile(r'\\"sku\\":\\"(?P<sku>\d+)\\"')
        for sku_match in sku_pattern.finditer(text):
            sku = sku_match.group("sku")
            if sku in seen_skus:
                continue
            window = text[max(0, sku_match.start() - 1200) : sku_match.end() + 1800]
            slug_match = re.search(r'\\"slug\\":\\"([^"\\]+)\\"', window)
            brand_match = re.search(r'\\"brand\\":\\"([^"\\]+)\\"', window)
            stock_match = re.search(r'\\"stock\\":(-?\d+)', window)
            price_match = re.search(r'\\"priceBeforeTaxes\\":(-?\d+)', window)
            image = AcuentaRscSpider._image_from_rsc(text, sku)
            image = image or AcuentaRscSpider._resolve_image_reference(text, window)
            if not slug_match or not price_match:
                continue

            slug = slug_match.group(1)
            normal_price = normalizar_precio_clp(price_match.group(1))
            if normal_price is None:
                continue
            name_match = re.search(r'\\"name\\":\\"([^"\\]+)\\"', window)
            name = normalizar_texto(name_match.group(1)) if name_match else None
            if not name or not AcuentaRscSpider._name_matches_slug(name, slug):
                name = AcuentaRscSpider._name_from_slug(slug)
            ean_field = re.search(
                r'\\"ean\\":(.*?),\\"maxQty\\"',
                window,
            )
            ean_values = (
                re.findall(r"\d{8,14}", ean_field.group(1))
                if ean_field
                else []
            )
            if not ean_values and ean_field:
                reference_match = re.search(r'\\"\$(?P<reference>[a-z0-9]+)\\"', ean_field.group(1))
                if reference_match:
                    referenced_ean = ean_references.get(reference_match.group("reference"))
                    if referenced_ean:
                        ean_values = [referenced_ean]
            ean = normalizar_ean_gtin(ean_values[0]) if ean_values else None
            promotion_ref_match = re.search(r'\\"promotion\\":\\"\$([a-z0-9]+)\\"', window)
            promotion_ref = promotion_ref_match.group(1) if promotion_ref_match else None
            current_price = promotion_prices.get(promotion_ref, normal_price)
            image = image or AcuentaRscSpider._image_from_sku(sku)
            image = AcuentaRscSpider._canonical_image_url(image)
            seen_skus.add(sku)
            products.append(
                {
                    "producto": name,
                    "precio": current_price,
                    "precio_normal": normal_price,
                    "precio_oferta": current_price if current_price < normal_price else None,
                    "ean_gtin": ean,
                    "sku": sku,
                    "marca": normalizar_texto(brand_match.group(1)) if brand_match else None,
                    "formato_crudo": AcuentaRscSpider._format_from_text(name),
                    "mecanica_promocion": "promoción" if promotion_ref else None,
                    "en_stock": int(stock_match.group(1)) > 0 if stock_match else None,
                    "url_producto": urljoin(response.url, f"/p/{slug}"),
                    "imagen": image,
                }
            )
        return products

    @staticmethod
    def _resolve_image_reference(text, window):
        reference_match = re.search(
            r'\\"photosUrl\\":\\"\$(?P<reference>[a-z0-9]+)\\"',
            window,
        )
        if not reference_match:
            return None
        reference = re.escape(reference_match.group("reference"))
        image_match = re.search(
            rf'{reference}:\[\\?"(https?://[^"\\]+)',
            text,
        )
        return image_match.group(1).replace(r"\u0026", "&") if image_match else None

    @staticmethod
    def _image_from_rsc(text, sku):
        escaped_sku = re.escape(sku)
        match = re.search(
            rf'(https://images\.lider\.cl/wmtcl\?source=url\[file:/productos/{escaped_sku}[^\]"\\]*\.(?:jpe?g|png|webp)\](?:\\u0026|&)sink)',
            text,
            re.IGNORECASE,
        )
        if not match:
            return None
        return match.group(1).replace(r"\u0026", "&")

    @staticmethod
    def _image_from_sku(sku):
        return f"https://images.lider.cl/wmtcl?source=url[file:/productos/{sku}a.jpg]&sink"

    @staticmethod
    def _canonical_image_url(image_url):
        return quote(image_url, safe=":/?=&.%") if image_url else None

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