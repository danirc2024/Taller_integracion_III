"""Implementacion de ProveedorIA para GroqCloud."""

import json
import time

import httpx

from app.explicacion import construir_prompt_explicacion
from app.filtros import rescatar_filtros_de_error_groq, sanitizar_filtros_crudos
from app.proveedores.base import ProveedorIA, ResultadoExtraccion


class GroqProveedor(ProveedorIA):
    nombre = "groq"

    def __init__(
        self,
        api_key: str | None,
        endpoint: str,
        modelo_extraccion: str,
        modelo_explicacion: str,
        definicion_funcion: dict,
    ):
        self.api_key = api_key
        self.endpoint = endpoint
        self.modelo_extraccion = modelo_extraccion
        self.modelo_explicacion = modelo_explicacion
        self.definicion_funcion = definicion_funcion

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def extraer_filtros(self, mensaje: str) -> ResultadoExtraccion:
        inicio = time.perf_counter()
        payload = {
            "model": self.modelo_extraccion,
            "messages": [{"role": "user", "content": mensaje}],
            "tools": [self.definicion_funcion],
            # Forzado (en vez de "auto"): con "auto" el modelo a veces
            # decide responder en texto libre usando su propio
            # conocimiento de cocina en vez de extraer filtros 
            "tool_choice": {
                "type": "function",
                "function": {"name": self.definicion_funcion["function"]["name"]},
            },
            "max_tokens": 512,
            "frequency_penalty": 0.4,
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.post(self.endpoint, headers=self._headers(), json=payload)
                r.raise_for_status()
                data = r.json()
        except httpx.HTTPStatusError as e:
            tiempo_ms = round((time.perf_counter() - inicio) * 1000)
            rescatados = rescatar_filtros_de_error_groq(e.response)
            if rescatados is not None:
                print("Groq rechazo el schema; filtros rescatados del failed_generation:", rescatados)
                return ResultadoExtraccion(
                    filtros=rescatados,
                    tiempo_extraccion_ms=tiempo_ms,
                    nota=(
                        "Groq rechazo la tool call por validacion de schema "
                        "(un campo vino con el tipo incorrecto, ej. texto en "
                        "vez de numero). Se descarto ese campo puntual y se "
                        "siguio con los filtros validos en vez de fallar."
                    ),
                )
            return ResultadoExtraccion(error=f"Groq respondio {e.response.status_code}: {e.response.text}")
        except httpx.RequestError as e:
            return ResultadoExtraccion(error=f"No se pudo conectar a Groq: {e}")

        tiempo_ms = round((time.perf_counter() - inicio) * 1000)
        mensaje_modelo = data["choices"][0]["message"]
        tool_calls = mensaje_modelo.get("tool_calls")

        if not tool_calls:
            # El modelo respondio con texto libre en vez de llamar la funcion
            return ResultadoExtraccion(
                texto_libre=mensaje_modelo.get("content"),
                nota="El modelo no uso function calling esta vez",
                tiempo_extraccion_ms=tiempo_ms,
            )

        filtros = json.loads(tool_calls[0]["function"]["arguments"])
        filtros = sanitizar_filtros_crudos(filtros)
        print("Filtros extraidos (Groq):", filtros)
        return ResultadoExtraccion(filtros=filtros, tiempo_extraccion_ms=tiempo_ms)

    async def generar_explicacion(self, mensaje_usuario: str, productos_filtrados: list) -> str:
        prompt = construir_prompt_explicacion(mensaje_usuario, productos_filtrados)
        payload = {
            "model": self.modelo_explicacion,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 200,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post(self.endpoint, headers=self._headers(), json=payload)
            r.raise_for_status()
            data = r.json()

        return data["choices"][0]["message"]["content"]
