from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "API de Comparación y Rutas"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Base de Datos
    DB_URL: str
    
    # APIs externas (opcional por el momento)
    OPENAI_API_KEY: str | None = None
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
