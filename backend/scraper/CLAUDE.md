# Microservicio: Scraper de Supermercados (Python + Scrapy)

Modo: Standby worker (tail -f /dev/null) | Dockerfile: Dockerfile | Ejecución manual via docker exec

## Estructura de módulos

```
scraper_core/
├── __init__.py
├── items.py          → ScraperCoreItem(@dataclass) - modelo base (vacío)
├── middlewares.py     → ScraperCoreSpiderMiddleware, ScraperCoreDownloaderMiddleware
├── pipelines.py       → ScraperCorePipeline.process_item()
├── settings.py        → Config Scrapy (throttle, concurrency, delays)
└── spiders/
    ├── __init__.py
    └── jumbo.py       → JumboRscSpider(scrapy.Spider)
research/
├── jumbo_categories.txt  → URLs de categorías de Jumbo (14 URLs)
└── test_jumbo.py         → Tests unitarios del spider
```

## Spider principal: JumboRscSpider [scraper_core/spiders/jumbo.py]

- `name = "jumbo_rsc"`, `allowed_domains = ["jumbo.cl"]`
- `max_pages = 20` por categoría
- Extrae productos desde bloques `<script type="application/ld+json">`
- Campos extraídos: nombre, precio, imagen
- URLs de categorías desde: archivo txt + env JUMBO_CATEGORY_URLS + arg -a add_url
- Paginación automática con parámetro ?page=X
- `_walk_json(value)`: generador recursivo para JSON anidados

## Configuración clave [scraper_core/settings.py]

- CONCURRENT_REQUESTS = 1, CONCURRENT_REQUESTS_PER_DOMAIN = 1
- DOWNLOAD_DELAY = 1, AUTOTHROTTLE_ENABLED = True (2-60s)
- DOWNLOAD_MAXSIZE = 5MB (control de memoria)
- ROBOTSTXT_OBEY = True
- JOBDIR desde env SCRAPY_JOBDIR (persistencia de estado)

## Ejecución

```bash
docker compose exec web_scraper_alimentos scrapy crawl jumbo_rsc -O /tmp/jumbo.json
```

## Dependencias (requirements.txt)

- Scrapy >= 2.11.0
- psycopg2-binary >= 2.9.0 (para futura persistencia en PostgreSQL)
- redis >= 5.0.0 (para colas y deduplicación)

## Notas

- Pipeline y middlewares están en estado boilerplate (no conectan a DB/Redis aún)
- Contenedor limitado a 3GB RAM via cgroups en docker-compose.yml

<!-- ARCHITECTURE:AUTO-GENERATED — NO EDITAR DEBAJO DE ESTA LÍNEA -->

## Mapa auto-generado: Scraper (Scrapy)

**8 archivos .py** detectados


### `research/test_jumbo.py`

- **class JumboExtractionTest(unittest.TestCase)**
  - `test_extract_names_from_json_ld()`
  - `test_category_is_taken_from_url()`
  - `test_extracts_comparison_fields()`
  - `test_page_url_preserves_category()`

### `scraper_core/items.py`

- **class ScraperCoreItem**

### `scraper_core/middlewares.py`

- **class ScraperCoreSpiderMiddleware**
  - `from_crawler(cls, crawler)`
  - `process_spider_input(response, spider)`
  - `process_spider_output(response, result, spider)`
  - `process_spider_exception(response, exception, spider)`
  - `async process_start(start)`
  - `spider_opened(spider)`
- **class ScraperCoreDownloaderMiddleware**
  - `from_crawler(cls, crawler)`
  - `process_request(request, spider)`
  - `process_response(request, response, spider)`
  - `process_exception(request, exception, spider)`
  - `spider_opened(spider)`

### `scraper_core/pipelines.py`

- **class ScraperCorePipeline**
  - `process_item(item)`

### `scraper_core/settings.py`


### `scraper_core/spiders/jumbo.py`

- **class JumboRscSpider(scrapy.Spider)**
  - `parse(response)`
  - `start_requests()`
  - `_page_url(category_url, page)`
  - `handle_error(failure)`
  - `__init__()`
  - `from_crawler(cls, crawler)`
  - `_read_category_urls(cls)`
  - `_append_category_url(url)`
  - `_extract_products(response)`
  - `_first_value(data)`
  - `_first_price(data)`
  - `_normal_price(entry)`
  - `_stock_value(availability)`
  - `_walk_json(value)`
