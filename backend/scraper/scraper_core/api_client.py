from __future__ import annotations

import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class ScraperAPIError(RuntimeError):
    """Indica que la API no aceptó o no pudo procesar una ingesta."""


class ScraperAPIClient:
    """Cliente HTTP síncrono para enviar lotes al API Gateway."""

    def __init__(self, endpoint: str, timeout: float = 30.0, opener=urlopen):
        self.endpoint = endpoint.rstrip("/")
        self.timeout = timeout
        self.opener = opener

    def ingest_batch(
        self,
        products: list[dict],
        supermarket: str | None = None,
        branch_id: int | None = None,
        branch_code: str | None = None,
        work_id: str | None = None,
    ) -> dict:
        if not products:
            return {"total_recibidos": 0}

        payload = {"productos": products}
        if supermarket:
            payload["supermercado"] = supermarket
        if branch_id is not None:
            payload["sucursal_id"] = branch_id
        if branch_code:
            payload["codigo_sucursal"] = branch_code

        endpoint = self._ingestion_endpoint(work_id)

        request = Request(
            endpoint,
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with self.opener(request, timeout=self.timeout) as response:
                body = response.read().decode("utf-8")
        except HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise ScraperAPIError(
                f"La API rechazó la ingesta ({error.code}): {detail or error.reason}"
            ) from error
        except URLError as error:
            raise ScraperAPIError(f"No se pudo conectar con la API: {error.reason}") from error

        if not body:
            return {}
        try:
            return json.loads(body)
        except json.JSONDecodeError as error:
            raise ScraperAPIError("La API respondió con JSON inválido") from error

    def finalize_work(
        self,
        work_id: str,
        status: str,
        extracted_items: int,
        error_message: str | None = None,
    ) -> dict:
        payload = {
            "estado": status,
            "elementos_extraidos": extracted_items,
        }
        if error_message:
            payload["registro_errores"] = error_message

        endpoint = self.endpoint
        if endpoint.endswith("/productos"):
            endpoint = endpoint[: -len("/productos")]
        endpoint = f"{endpoint}/trabajos/{work_id}/finalizar"
        request = Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            method="PUT",
        )
        try:
            with self.opener(request, timeout=self.timeout) as response:
                body = response.read().decode("utf-8")
        except HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise ScraperAPIError(
                f"La API rechazó el cierre del trabajo ({error.code}): {detail or error.reason}"
            ) from error
        except URLError as error:
            raise ScraperAPIError(f"No se pudo conectar con la API: {error.reason}") from error

        try:
            return json.loads(body) if body else {}
        except json.JSONDecodeError as error:
            raise ScraperAPIError("La API respondió con JSON inválido al cerrar el trabajo") from error

    def _ingestion_endpoint(self, work_id: str | None) -> str:
        if work_id:
            endpoint = self.endpoint
            if endpoint.endswith("/productos"):
                endpoint = endpoint[: -len("/productos")]
            return f"{endpoint}/trabajos/{work_id}/productos"
        if self.endpoint.endswith("/productos"):
            return self.endpoint
        return f"{self.endpoint}/productos"
