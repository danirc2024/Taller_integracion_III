# Guía de Uso del Backend en Go (API Gateway)

Esta guía documenta la estructura, el uso y las herramientas del nuevo backend en Go, el cual reemplaza a la antigua arquitectura en FastAPI.

## Tecnologías Principales
- **Lenguaje:** Go (Golang) 1.26+
- **Framework Web:** [Gin](https://gin-gonic.com/) (rápido, simple y robusto)
- **ORM:** [GORM](https://gorm.io/) (para interactuar con PostgreSQL)
- **Recarga en vivo (Live-Reloading):** [Air](https://github.com/air-verse/air)
- **Documentación de API:** [Swaggo / gin-swagger](https://github.com/swaggo/gin-swagger)

## ¿Cómo levantar el servicio?

El backend está dockerizado y gestionado a través del archivo `docker-compose.yml` en la raíz del proyecto.

Para iniciar el backend junto con la base de datos:
```bash
docker-compose up --build -d
```
El contenedor `go_service_api` iniciará y compilará la aplicación utilizando `air`.

## Desarrollo y Recarga Automática (Hot-Reload)

Gracias a `air`, **no necesitas reiniciar el contenedor de Docker manualmente cada vez que cambies el código**.
Cualquier cambio que realices y guardes en los archivos `.go` dentro de `backend/api/` será detectado automáticamente. `air` recompilará el binario y reiniciará el servidor de Gin en cuestión de segundos.

## Documentación Swagger UI

Hemos integrado Swagger UI para visualizar y probar los endpoints de la API. 

1. **Ruta de acceso:** Cuando el contenedor esté corriendo, visita en tu navegador:
   👉 `http://localhost:8080/swagger/index.html`

2. **¿Cómo actualizar la documentación?**
   Cada vez que agregues un endpoint nuevo o cambies los comentarios descriptivos (anotaciones `@Summary`, `@Description`, etc.) encima de las funciones controladoras, debes regenerar los archivos estáticos de Swagger.
   Para hacerlo, en la carpeta `backend/api`, ejecuta:
   ```bash
   # (Requiere tener swag instalado localmente: go install github.com/swaggo/swag/cmd/swag@latest)
   swag init
   ```
   Esto actualizará los archivos dentro de la carpeta `backend/api/docs/`. Al guardarse, `air` detectará el cambio y reiniciará el servidor para que Swagger UI muestre los nuevos datos.

## Estructura de Directorios

El backend respeta una arquitectura limpia orientada a dominios (la misma intención que tenía la versión de Python):

```text
backend/api/
├── main.go               # Punto de entrada de la aplicación, configuración de Gin y rutas principales
├── docs/                 # Archivos auto-generados por Swaggo (NO EDITAR MANUALMENTE)
├── infrastructure/       # Modelos de GORM, conexión a BD
├── api/                  # Controladores / Handlers HTTP
├── core/                 # Configuraciones transversales
├── domain/               # Entidades y reglas de negocio
└── services/             # Lógica de negocio e interacción con repositorios
```

## Configuración y Variables de Entorno

El servicio lee sus variables desde el archivo `.env` en la raíz del proyecto (inyectadas a través del `docker-compose.yml`). Las claves más relevantes son:
- `DB_URL`: Cadena de conexión completa a la base de datos PostgreSQL.
- `PORT`: (Opcional) Puerto donde escucha la aplicación (por defecto `8080`).
