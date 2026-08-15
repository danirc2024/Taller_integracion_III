from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.infrastructure.database import get_db

router = APIRouter()

@router.get("/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """
    Endpoint de prueba para verificar que la API está viva y
    que la conexión a PostgreSQL funciona correctamente.
    """
    try:
        # Prueba simple a la base de datos
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"
        
    return {
        "status": "ok",
        "message": "La API Gateway está funcionando.",
        "database_status": db_status
    }
