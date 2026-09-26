from dataclasses import dataclass
from typing import Optional


@dataclass
class ScraperCoreItem:
    producto: str
    supermercado: str
    categoria: str
    precio: Optional[float] = None
    precio_normal: Optional[float] = None
    precio_oferta: Optional[float] = None
    ean_gtin: Optional[str] = None
    sku: Optional[str] = None
    marca: Optional[str] = None
    formato_crudo: Optional[str] = None
    mecanica_promocion: Optional[str] = None
    en_stock: Optional[bool] = None
    url_producto: Optional[str] = None
    imagen: Optional[str] = None
