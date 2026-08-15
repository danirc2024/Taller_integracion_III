from fastapi import APIRouter
from app.api import health

api_router = APIRouter()

# Aquí el desarrollador registrará todos los sub-routers (users, products, etc)
api_router.include_router(health.router)
