from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

# Inicialización de la aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuración de CORS para permitir peticiones del Frontend (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción cambiar por la URL del dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de todas las rutas de la API bajo el prefijo /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", include_in_schema=False)
def root():
    """Redirección informativa para la raíz del servidor."""
    return {
        "message": "Bienvenido a la API Gateway de Supermercados.",
        "docs": "Visita /docs para ver el autocompletado Swagger UI."
    }
