# Guía de Hardware y Optimización

Dado que el servidor de despliegue y desarrollo es un procesador de gama básica (Intel Pentium), los recursos computacionales son estrictamente limitados. Para asegurar que la plataforma entera fluya sin congelar el sistema ni agotar la RAM, se implementaron reglas defensivas en la arquitectura de Docker.

## 1. Contención por Cgroups (Docker Compose)
Los procesos matemáticos o de red agresivos pueden hacer que el procesador alcance el *Thermal Throttling* (ralentización por temperatura). Para evitarlo, en `docker-compose.yml` se configuraron límites duros (Hardware Limits):

- **Web Scraper (`web_scraper_alimentos`)**: 
  - **Límite RAM**: `3GB`
  - **Límite CPU**: `1.0` (un solo núcleo lógico).
  - *Justificación*: Scrapy encolará miles de peticiones asíncronas para extraer catálogos. El límite de RAM previene un "Out of Memory" (OOM) en el host.
- **Motor de Rutas (`spatial_optimizer`)**: 
  - **Límite RAM**: `2GB`
  - **Límite CPU**: `0.8` (80% de un núcleo).
  - *Justificación*: Procesar grafos espaciales (NetworkX / OSMnx) es carga pesada para la CPU. El límite garantiza que la API Gateway no se caiga por culpa de que el motor de rutas asfixie el hardware.

> *La Base de Datos (PostgreSQL) y el API Gateway no tienen límites estrictos para asegurar que no sufran latencias en las peticiones web, confiando en que su uso es estable.*

## 2. Dieta de los Dockerfiles (Ahorro de Disco y Memoria)
Revisando los `Dockerfile` del Frontend, API, Scraper y Motor, todos están estandarizados bajo técnicas de "Slimming":

1. **Imágenes Base Enanas:** 
   - Backend: `python:3.11-slim` (Solo las librerías base de Debian, omitiendo interfaces gráficas y paquetes pesados de Ubuntu completo).
   - Frontend: `node:20-alpine` (La distribución más diminuta de Linux, apenas unos megabytes).
2. **Prevención de Basura en Disco:** 
   - `ENV PYTHONDONTWRITEBYTECODE=1`: Instruye a Python a no crear archivos intermedios `.pyc`, salvando operaciones de disco (I/O) en el Pentium.
   - `pip install --no-cache-dir`: Evita que pip guarde copias ocultas de las librerías tras instalarlas.
   - `apt-get install --no-install-recommends`: Instala solo las librerías de C++ críticas, rechazando el bloatware recomendado por el sistema operativo.

## Manteniendo la Optimización a Futuro
Para el equipo de desarrollo, si agregan un nuevo microservicio, la regla de oro es:
1. Iniciar con imágenes `-slim` o `-alpine`.
2. Definir un límite en `docker-compose.yml` (`deploy.resources.limits`) si sospechan que el proceso hace cálculos pesados en *loops*.
