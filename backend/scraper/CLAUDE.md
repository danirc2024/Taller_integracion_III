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
- `max_pages = 100` por categoría
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

**11 archivos .py** detectados


### `research/test_jumbo.py`

- **class JumboExtractionTest(unittest.TestCase)**
  - `test_extract_names_from_json_ld()`
  - `test_category_is_taken_from_url()`
  - `test_extracts_comparison_fields()`
  - `test_page_url_preserves_category()`
  - `test_catalog_refresh_is_needed_when_never_updated()`
  - `test_catalog_refresh_handles_naive_datetime_without_type_error()`
  - `test_catalog_refresh_is_not_needed_while_fresh()`
  - `test_product_refresh_is_needed_after_ttl()`
  - `test_product_refresh_is_not_needed_while_fresh()`
  - `test_refresh_decision_marks_stale_product()`
  - `test_duplicate_refresh_request_is_skipped()`
  - `test_scheduler_marks_catalog_as_stale_after_interval()`
  - `test_queue_skips_duplicate_in_flight_refresh()`
  - `test_queue_schedules_stale_product_refresh()`
  - `test_queue_exposes_enqueued_product_for_processing()`
  - `test_worker_processes_next_product_and_releases_in_flight_lock()`
  - `test_worker_reports_failure_and_releases_in_flight_lock()`
  - `test_worker_propagates_structured_failure_from_executor()`
  - `test_worker_processes_all_pending_products()`
  - `test_result_publisher_sends_item_to_injected_sender()`
  - `test_result_publisher_reports_api_failure()`
  - `test_refresh_flow_consumes_queue_and_publishes_result()`
  - `test_scrapy_executor_runs_catalog_without_persisting_output_file()`
  - `test_scrapy_executor_targets_product_url_for_queued_job()`
  - `test_scheduler_decides_catalog_and_product_update_flow()`
  - `test_scheduler_accepts_future_api_configuration()`
  - `test_scheduler_can_force_catalog_refresh_from_manual_trigger()`
  - `test_scrapy_settings_use_ethic_rate_limit()`
  - `test_scrapy_retry_policy_handles_transient_errors()`
  - `test_404_page_stops_pagination_cleanly()`

### `scraper_core/freshness.py`

- **class RefreshQueue**
  - `__init__(product_ttl_seconds: int)`
  - `in_flight_refreshes()`
  - `mark_started(product_id)`
  - `mark_finished(product_id)`
  - `pop_next()`
  - `enqueue(product_id, last_updated_at, product_url)`
- **class RefreshWorker**
  - `__init__(queue, executor)`
  - `process_next()`
  - `process_all()`
- **class RefreshScheduler**
  - `__init__(catalog_interval_seconds: int, product_ttl_seconds: int, enabled: bool)`
  - `from_config(cls, config)`
  - `catalog_needs_refresh(last_updated_at)`
  - `product_needs_refresh(product_id, last_updated_at)`
  - `build_catalog_and_product_plan(last_catalog_updated_at, product_id, last_product_updated_at, force_catalog_refresh)`
- `_normalize_datetime(value)`
- `should_refresh_catalog(last_updated_at, interval_seconds: int) → bool`
- `should_refresh_product(last_updated_at, ttl_seconds: int) → bool`
- `build_refresh_decision(product_id, last_updated_at, ttl_seconds: int)`
- `should_skip_refresh(product_id, in_flight_refreshes)`

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

### `scraper_core/output.py`

- **class ScraperResultPublisher**
  - `__init__(sender)`
  - `publish(item)`

### `scraper_core/pipelines.py`

- **class ScraperCorePipeline**
  - `process_item(item)`

### `scraper_core/runtime.py`

- **class ScrapyCommandExecutor**
  - `__init__(command_runner, spider_name)`
  - `__call__(job)`
- `main()`

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
