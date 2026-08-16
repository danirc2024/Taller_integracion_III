from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, productos

# TODO: Importar tu clase RespuestaUTF8 desde utils cuando la tengas lista
# app = FastAPI(default_response_class=RespuestaUTF8)
app = FastAPI(title="Microservicio de IA Conversacional")

# Configuración de CORS según tu sección 5.10
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Orígenes abiertos para que el frontend de prueba pase
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: Instanciar tu repositorio de productos y tus 3 proveedores aquí

# Registrar los routers
app.include_router(chat.router, prefix="/chat", tags=["Chat IA"])
app.include_router(productos.router, prefix="/productos", tags=["Productos Crudos"])

@app.get("/")
async def root():
    return {"status": "ok", "message": "Microservicio de IA activo. Agrega tu lógica aquí."}
