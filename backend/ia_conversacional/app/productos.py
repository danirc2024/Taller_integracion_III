"""
Acceso al catalogo de productos. Hoy son 18 productos falsos en un JSON
cargado en memoria, el dia que esto se conecte al scraping real
o a PostgreSQL, es este el unico archivo que deberia cambiar, el resto
del codigo solo conoce el metodo obtener_todos(), no de donde vienen los
datos
"""

import json
from pathlib import Path


class ProductoRepositorio:
    def __init__(self, ruta_json: Path):
        self._ruta_json = ruta_json
        self._productos = self._cargar()

    def _cargar(self) -> list:
        with open(self._ruta_json, "r", encoding="utf-8") as f:
            return json.load(f)

    def obtener_todos(self) -> list:
        """devuelve todos los productos cargados en memoria sin filtros todavia"""
        return self._productos

    def __len__(self) -> int:
        return len(self._productos)
