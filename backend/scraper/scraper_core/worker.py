from __future__ import annotations

import json
import logging
import os
import redis

from redis import Redis

from scraper_core.api_client import ScraperAPIClient, ScraperAPIError
from scraper_core.runtime import ScrapyCommandExecutor


QUEUE_NAME = os.getenv("SCRAPER_QUEUE", "scraper:jobs")
ALLOWED_SPIDERS = {"jumbo_rsc", "santa_isabel_rsc", "cugat_rsc", "acuenta_rsc"}
logger = logging.getLogger(__name__)


def process_job(job: dict, api_client: ScraperAPIClient) -> dict:
    spider_name = job.get("spider", "jumbo_rsc")
    work_id = job["trabajo_id"]
    if spider_name not in ALLOWED_SPIDERS:
        raise ValueError(f"Spider no permitido: {spider_name}")

    previous_work_id = os.environ.get("SCRAPER_TRABAJO_ID")
    os.environ["SCRAPER_TRABAJO_ID"] = work_id
    try:
        result = ScrapyCommandExecutor(spider_name=spider_name)(job)
    finally:
        if previous_work_id is None:
            os.environ.pop("SCRAPER_TRABAJO_ID", None)
        else:
            os.environ["SCRAPER_TRABAJO_ID"] = previous_work_id

    item_count = len(result.get("items", []))
    api_client.finalize_work(work_id, "completado", item_count)
    return result


def run_worker():
    logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    api_url = os.getenv(
        "SCRAPER_API_URL",
        "http://localhost:8080/api/v1/scraper/productos",
    )
    redis_client = Redis.from_url(
        redis_url, 
        decode_responses=True,
        socket_timeout=None,
        socket_keepalive=True,
        health_check_interval=30
    )
    api_client = ScraperAPIClient(
        endpoint=api_url,
        timeout=float(os.getenv("SCRAPER_API_TIMEOUT", "30")),
    )
    logger.info("Worker Scrapy escuchando la cola %s", QUEUE_NAME)

    while True:
        try:
            result = redis_client.brpop(QUEUE_NAME, timeout=5)
            if not result:
                continue
            _, raw_job = result
            job = json.loads(raw_job)
        except redis.exceptions.TimeoutError:
            # Timeout normal esperando trabajos, continuamos
            continue
        except Exception as e:
            logger.warning(f"Error conectando a Redis: {e}")
            import time; time.sleep(5)
            continue
            
        try:
            process_job(job, api_client)
            logger.info("Trabajo %s completado", job.get("trabajo_id"))
        except Exception as error:
            logger.exception("Falló el trabajo %s", job.get("trabajo_id"))
            try:
                api_client.finalize_work(
                    job["trabajo_id"],
                    "fallido",
                    0,
                    str(error),
                )
            except ScraperAPIError:
                logger.exception("No se pudo registrar el fallo del trabajo")


if __name__ == "__main__":
    run_worker()