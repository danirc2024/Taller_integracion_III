# Microservicio de Web Scraping (Scrapy)

Este microservicio está destinado a extraer de manera asíncrona los catálogos de productos y ofertas desde sitios web de supermercados, implementando el framework **Scrapy**. 

La imagen del scraper se construye de forma independiente porque el
`docker-compose.yml` actual no incluye este servicio. Esto permite ejecutar
Scrapy bajo demanda sin modificar los demás microservicios.

## Tecnologías y Entorno
El contenedor ya cuenta con las dependencias necesarias inyectadas en su `Dockerfile`:
- `Scrapy`: Framework de extracción web.
- `psycopg2-binary`: Driver oficial para enviar los datos parseados directamente a PostgreSQL.
- `redis`: Cliente para interactuar con la cola en memoria (para control de duplicados o coordinación).

## Documentación de Uso (Modo Desarrollo)

A diferencia de FastAPI, **Scrapy no es un servidor web permanente**. Es un
entorno de ejecución de _scripts_ (Spiders). Desde la raíz del repositorio,
construye la imagen actual así:

```bash
docker build -t taller-integracion-scraper:local ./backend/scraper
```

### 1. Inicializar el proyecto Scrapy
Si aún no has andamiado la estructura estándar de Scrapy, ejecuta el comando
desde el directorio `backend/scraper` usando el entorno local:

```bash
scrapy startproject scraper_core .
```

### 2. Crear un nuevo "Spider" (Bot recolector)
Para generar el archivo de un bot que escanee un supermercado ficticio:

```bash
docker run --rm taller-integracion-scraper:local \
	scrapy genspider ejemplo_supermercado misupermercado.com
```

### 3. Ejecutar la recolección de datos
Cuando el desarrollador haya programado su araña (ej. `ejemplo_supermercado`), puede disparar la recolección lanzando:

```bash
docker run --rm taller-integracion-scraper:local \
	scrapy crawl ejemplo_supermercado
```

Para Jumbo:

```bash
docker run --rm \
	-v "$PWD:/salida" \
	taller-integracion-scraper:local \
	scrapy crawl jumbo_rsc \
	-s JOBDIR= \
	-O /salida/jumbo.json
```

El archivo queda en `jumbo.json` dentro de la carpeta desde la que se ejecuta
el comando. Para obtener una prueba de un solo producto, agrega
`-s CLOSESPIDER_ITEMCOUNT=1`.

La lista persistente está en `research/jumbo_categories.txt`. Para agregar una
categoría y ejecutar todas las URLs guardadas:

```bash
docker run --rm \
	-v "$PWD/backend/scraper:/app" \
	-v "$PWD:/salida" \
	taller-integracion-scraper:local \
	scrapy crawl jumbo_rsc \
	-a add_url="https://www.jumbo.cl/ruta-de-la-categoria" \
	-s JOBDIR= \
	-O /salida/jumbo.json
```

El comando agrega la URL sólo si no existe. Ejecuta el comando una vez por cada
nueva categoría, o edita directamente el archivo dejando una URL pública por
línea. Como el archivo no se monta como volumen, reconstruye la imagen después
de modificarlo para que el contenedor reciba la lista actualizada.

El spider `jumbo_rsc` procesa todas las categorías guardadas y avanza por sus
páginas hasta encontrar una respuesta sin productos, con un máximo de 20
páginas por categoría. Respeta `robots.txt`, usa una identidad identificable
y mantiene una solicitud simultánea por dominio. `AutoThrottle`, el timeout de
30 segundos, el máximo de 5 MiB por respuesta y un solo reintento reducen la
carga y el consumo del contenedor.

Cada producto conserva los campos básicos (`producto`, `precio`, `categoria`,
`imagen`) y puede incluir `ean_gtin`, `sku`, `precio_normal`, `precio_oferta`,
`marca`, `formato_crudo`, `mecanica_promocion`, `en_stock` y `url_producto`.
Los campos no publicados por Jumbo quedan como `null`.

La respuesta con `Accept: text/x-component` (RSC) es un detalle interno de
Next.js, no una API pública estable. Por eso el spider usa HTML por defecto y
la extracción está aislada: si Jumbo cambia su formato, registra una
advertencia en vez de generar datos silenciosamente incorrectos.

## Conectividad
Tanto la URL de Redis como la URL de la Base de Datos están siendo pasadas dinámicamente al contenedor a través de `docker-compose.yml`. Para conectarte a ellas desde Scrapy (por ejemplo en el archivo `pipelines.py`), solo debes invocar las variables de entorno:

```python
import os

db_url = os.getenv("DB_URL")
redis_url = os.getenv("REDIS_URL")
```
