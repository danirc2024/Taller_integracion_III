# Microservicio de Web Scraping (Scrapy)

Este microservicio está destinado a extraer de manera asíncrona los catálogos de productos y ofertas desde sitios web de supermercados, implementando el framework **Scrapy**. 

A través de la configuración global de Docker, el contenedor de este servicio (`web_scraper_alimentos`) tiene límites estrictos de consumo (1 CPU, 3GB RAM) para asegurar que la alta carga de procesamiento durante el raspado masivo no paralice tu equipo base (Pentium).

## Tecnologías y Entorno
El contenedor ya cuenta con las dependencias necesarias inyectadas en su `Dockerfile`:
- `Scrapy`: Framework de extracción web.
- `psycopg2-binary`: Driver oficial para enviar los datos parseados directamente a PostgreSQL.
- `redis`: Cliente para interactuar con la cola en memoria (para control de duplicados o coordinación).

## Documentación de Uso (Modo Desarrollo)

A diferencia de FastAPI, **Scrapy no es un servidor web permanente**. Es un entorno de ejecución de _scripts_ (Spiders). Por lo tanto, este contenedor está programado para iniciarse en modo "Standby" (espera silenciosa), permitiendo que el desarrollador invoque comandos a demanda.

Para trabajar, todos los comandos se deben lanzar apuntando al contenedor activo mediante `docker compose exec`.

### 1. Inicializar el proyecto Scrapy
Si aún no has andamiado la estructura estándar de Scrapy (pipelines, items, settings), ejecuta este comando desde la consola de tu computadora:

```bash
docker compose exec scraper_supermercados scrapy startproject scraper_core .
```
*(El punto al final es importante para generarlo en el directorio actual `/app` del contenedor).*

### 2. Crear un nuevo "Spider" (Bot recolector)
Para generar el archivo de un bot que escanee un supermercado ficticio:

```bash
docker compose exec scraper_supermercados scrapy genspider ejemplo_supermercado misupermercado.com
```

### 3. Ejecutar la recolección de datos
Cuando el desarrollador haya programado su araña (ej. `ejemplo_supermercado`), puede disparar la recolección lanzando:

```bash
docker compose exec scraper_supermercados scrapy crawl ejemplo_supermercado
```

Para Jumbo:

```bash
docker compose exec scraper_supermercados scrapy crawl jumbo_rsc -O /tmp/jumbo.json
```

La lista persistente está en `research/jumbo_categories.txt`. Para agregar una
categoría y ejecutar todas las URLs guardadas:

```bash
docker compose exec scraper_supermercados scrapy crawl jumbo_rsc \
	-a add_url="https://www.jumbo.cl/ruta-de-la-categoria" \
	-O /tmp/jumbo.json
```

El comando agrega la URL sólo si no existe. Ejecuta el comando una vez por cada
nueva categoría, o edita directamente el archivo dejando una URL pública por
línea. El volumen de Docker conserva la lista al recrear el contenedor.

El spider `jumbo_rsc` consulta la categoría de verduras una sola vez por
ejecución. Respeta `robots.txt`, usa una identidad identificable y mantiene
una solicitud simultánea por dominio. `AutoThrottle`, el timeout de 30
segundos, el máximo de 5 MiB por respuesta y un solo reintento reducen la
carga y el consumo del contenedor.

La respuesta con `Accept: text/x-component` (RSC) es un detalle interno de
Next.js, no una API pública estable. Por eso el spider usa HTML por defecto y
la extracción de nombres está aislada: si Jumbo cambia su formato, registra
una advertencia en vez de generar datos silenciosamente incorrectos. La URL
actual no implementa paginación; agregarla requiere confirmar primero el
enlace o endpoint público que el sitio entregue.

## Conectividad
Tanto la URL de Redis como la URL de la Base de Datos están siendo pasadas dinámicamente al contenedor a través de `docker-compose.yml`. Para conectarte a ellas desde Scrapy (por ejemplo en el archivo `pipelines.py`), solo debes invocar las variables de entorno:

```python
import os

db_url = os.getenv("DB_URL")
redis_url = os.getenv("REDIS_URL")
```
