from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Creación del motor de base de datos usando SQLAlchemy y Psycopg2
engine = create_engine(settings.DB_URL, pool_pre_ping=True)

# Generador de sesiones de base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los futuros modelos ORM
Base = declarative_base()

def get_db():
    """Dependencia (generador) para inyectar la sesión DB en los endpoints de FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
