"""
Contrato comun para cualquier proveedor de IA (Groq y Gemini o
podria ser otro). El router de chat (app/routers/chat.py) solo conoce
esta interfaz no importa si por debajo hay una llamada REST a Groq
o a Gemini, asi que agregar un tercer proveedor es crear una clase nueva
que la implemente y conectarla en main.py, sin tocar el router
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ResultadoExtraccion:
    filtros: dict | None = None
    texto_libre: str | None = None
    error: str | None = None
    error_estado: str | None = None  # ej Gemini: "RESOURCE_EXHAUSTED"
    nota: str | None = None
    extra: dict | None = None  # datos adicionales para mezclar en la respuesta (ej: "raw")
    tiempo_extraccion_ms: int = 0


class ProveedorIA(ABC):
    """Interfaz que debe cumplir cualquier proveedor de IA conectado al chat."""

    nombre: str
    api_key: str | None

    @abstractmethod
    async def extraer_filtros(self, mensaje: str) -> ResultadoExtraccion:
        """Etapa 1: manda el mensaje del usuario al LLM y extrae filtros estructurados."""

    @abstractmethod
    async def generar_explicacion(self, mensaje_usuario: str, productos_filtrados: list) -> str:
        """Etapa 3: redacta la explicacion final a partir de productos ya filtrados."""
