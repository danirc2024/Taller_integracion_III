# Sugerencias de Endpoints (Para el Encargado de la API)

Durante la configuración de la arquitectura y las pruebas de los contenedores, se generaron lógicas de endpoints que fueron retiradas del código fuente para no entorpecer ni definir arquitecturas sin la revisión del encargado principal de la API.

A continuación se documentan estas estructuras sugeridas como referencia técnica.

## 1. Endpoint de Validación de Rutas (Microservicio: Motor de Rutas)
En el `motor_rutas` se implementó un **Patrón Estrategia** (`app/core/strategy.py`). Para poder utilizar este patrón desde fuera, se sugiere crear un endpoint similar al siguiente, que instancie la estrategia requerida ("osrm" o "osmnx") y resuelva el problema.

```python
# Archivo sugerido: backend/motor_rutas/app/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from app.core.strategy import RoutingStrategy
from app.algorithms.osmnx_strategy import OSMnxStrategy, OSRMApiStrategy

app = FastAPI(title="Motor Geoespacial y de Rutas")

class RouteRequest(BaseModel):
    lat_origen: float
    lon_origen: float
    lat_destino: float
    lon_destino: float
    strategy_name: str = "osrm" # Permite probar algoritmos en caliente

# Mapeo de estrategias
strategies = {
    "osmnx": OSMnxStrategy(),
    "osrm": OSRMApiStrategy()
}

@app.post("/api/v1/calculate-route")
def calculate_route(req: RouteRequest):
    strategy: RoutingStrategy = strategies.get(req.strategy_name, strategies["osrm"])
    
    origin = (req.lat_origen, req.lon_origen)
    destination = (req.lat_destino, req.lon_destino)
    
    result = strategy.calculate_route(origin, destination)
    
    return {
        "success": True,
        "input": {"origin": origin, "destination": destination},
        "routing_result": result
    }
```

## 2. Health Check y Base de Datos (API Gateway)
Para el `api_gateway`, se dejó preparado el generador de la sesión de PostgreSQL (`get_db`). Se sugiere utilizar un endpoint `/health` de esta manera para verificar rápidamente la estabilidad del túnel entre la API y la Base de Datos.

```python
# Archivo sugerido: backend/api/app/api/health.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.infrastructure.database import get_db

router = APIRouter()

@router.get("/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"
        
    return {
        "status": "ok",
        "message": "La API Gateway está funcionando.",
        "database_status": db_status
    }
```
