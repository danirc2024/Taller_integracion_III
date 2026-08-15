from fastapi import FastAPI
# Aquí el encargado de la API puede importar sus propios enrutadores
# from app.api.router import api_router

app = FastAPI(title="Motor Geoespacial y de Rutas")

@app.get("/")
def root():
    return {"message": "Microservicio Motor de Rutas activo. Esperando definición de endpoints."}
