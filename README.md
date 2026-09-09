# Plataforma de Comparación de Precios y Optimización de Rutas (Taller de Integración III)

Este repositorio contiene la arquitectura de microservicios para la plataforma de comparación de precios de alimentos de supermercados, incluyendo capacidades de optimización espacial. El proyecto está diseñado íntegramente bajo un ecosistema de **Docker** para garantizar aislamiento, control de recursos (vía cgroups) y portabilidad total.

## Arquitectura de Directorios

El repositorio se divide en dos dominios macro (`frontend` y `backend`), aplicando patrones de **Clean Architecture** y **Feature-Sliced Design** para maximizar la mutabilidad y mantenibilidad del código fuente.

```text
/
├── frontend/
│   └── web/                   # Aplicación principal (React + Vite)
│       └── src/               # Organizado en Features, Shared, Services y Core
├── backend/
│   ├── api/                   # API Gateway Central (FastAPI)
│   │   └── app/               # Clean Architecture: api, core, domain, infrastructure, services
│   ├── ia_conversacional/     # Asistente LLM con patrón anti-alucinaciones (FastAPI)
│   ├── motor_rutas/           # Microservicio de algoritmia y trazado geoespacial (Python)
│   └── scraper/               # Extractor asíncrono de catálogos y ofertas (Python)
├── docs/                      # Documentación del proyecto (PDFs, LaTeX, Guías Markdown)
├── docker-compose.yml         # Orquestador principal de la red de microservicios
├── .env.example               # Plantilla de variables de entorno requeridas
└── .gitignore                 # Exclusiones de Git (node_modules, pycache, .env, etc.)
```

### Dominio Frontend (`frontend/web`)
Desarrollado sobre **React + Vite**. La estructura interna se orienta a funcionalidades (Feature-Sliced Design) en lugar de tipos de archivo (ej. `src/features/comparador`), lo cual permite escalar la UI de manera orgánica y predecible. La imagen Docker de producción utiliza un *multi-stage build* que compila los estáticos con Node.js y los sirve mediante Nginx ligero.

### Dominio Backend (`backend/`)
- **`api/`:** Funciona como el Gateway nervioso de la plataforma, construido sobre **FastAPI**. Separa estrictamente los controladores HTTP (`app/api/`) de la lógica de negocio pura (`app/services/`) y los adaptadores de terceros o base de datos (`app/infrastructure/`).
- **`scraper/`:** Nodo _worker_ asíncrono aislado. Se encarga exclusivamente de consumir e iterar catálogos web/APIs de supermercados sin bloquear el servidor web principal.
- **`motor_rutas/`:** Microservicio dedicado a la alta carga matemática de trazado espacial (Problema del Viajante, A*), impulsado por OSRM y Google OR-Tools.
- **`ia_conversacional/`:** Microservicio que integra Modelos de Lenguaje (Gemini/Groq) para interpretar consultas naturales y explicar resultados, operando estrictamente sobre datos pre-filtrados para evitar alucinaciones.

## Infraestructura Docker y Servicios

El entorno se levanta unificado a través de `docker-compose.yml`, el cual despliega una subred local (`microservices_net`) y coordina 6 contenedores principales:

1. **`db` (PostgreSQL):** Base de datos unificada persistente.
2. **`redis`:** Message Broker en memoria para encolar tareas asíncronas del web scraper.
3. **`api_gateway`:** Backend RESTful, expuesto en el host vía puerto `8000`.
4. **`frontend_web`:** Servidor Nginx que entrega la WebApp, expuesto en el puerto `3000`.
5. **`web_scraper_alimentos`:** Contenedor restringido intencionalmente a 3GB RAM para prevenir fugas de memoria.
6. **`spatial_optimizer`:** Contenedor Python para resolver logísticas algorítmicas (TSP).
7. **`osrm_engine`:** Motor backend en C++ (Open Source Routing Machine) que procesa mapas viales para el contenedor espacial.
8. **`ia_chatbot_service`:** Asistente inteligente aislado en FastAPI.

## Despliegue Rápido (Modo Desarrollo)

1. Clona el archivo de configuración base:
   ```bash
   cp .env.example .env
   ```
2. Asegúrate de tener el demonio de Docker corriendo (ej. `sudo systemctl start docker` en Linux).
3. Levanta la malla de microservicios en segundo plano:
   ```bash
   docker compose up -d --build
   ```

> **Nota:** Para un desglose exhaustivo de comandos, resolución de errores comunes (como permisos de `docker.sock`) y buenas prácticas del equipo, revisa la [Guía de Docker (GUIA_DOCKER.md)](docs/GUIA_DOCKER.md).