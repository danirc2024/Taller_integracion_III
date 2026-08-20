"""Endpoints de solo lectura sobre el catalogo (sin IA de por medio)"""
from fastapi import APIRouter

from app.productos import ProductoRepositorio


def crear_router_productos(repositorio: ProductoRepositorio) -> APIRouter:
    router = APIRouter()

    @router.get("/")
    def root():
        return {"mensaje": "API funcionando", "total_productos": len(repositorio)}

    @router.get("/productos")
    def get_productos():
        return repositorio.obtener_todos()

    return router
