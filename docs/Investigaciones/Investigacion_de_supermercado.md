# **Investigación de Estrategias y Arquitecturas para la Extracción de Datos en Supermercados** 

Matriz de Selección: API vs. React Server Components vs. Web Scraping 

15 de agosto de 2026 

1 

# **Resumen** 

Este informe presenta una investigación técnica sobre las distintas estrategias de extracción automatizada de datos (nombres, precios, ofertas e imágenes) en plataformas de comercio electrónico de supermercados. Se analizan los escenarios en los cuales es factible consumir APIs públicas/internas, aquellos donde se requiere parsear arquitecturas modernas como Next.js (RSC/SSR), y los casos complejos donde se vuelve indispensable el web scraping tradicional o la simulación de navegador. 

2 

# **Introducción** 

El desarrollo de un microservicio de monitoreo de precios requiere identificar y clasificar las tecnologías frontend/backend utilizadas por las grandes cadenas de supermercados. El objetivo principal es extraer los siguientes datos clave por cada producto: 

- **Identificador/SKU:** Código único de producto. **Nombre y Marca:** Descripción completa del ítem. 

- **Estructura de Precios:** Precio regular, precio oferta y precio con tarjeta/fidelización. **Recursos Multimedia:** URL directa a la imagen estática del catálogo. 

# **Matriz de Decisión Tecnológica** 

Dependiendo de la arquitectura del supermercado objetivo, la estrategia de extracción se clasifica en tres categorías principales. 

Tabla 1: Comparativa de Estrategias de Extracción según la Arquitectura del Sitio Web 

|**Estrategia**|**Casos de Uso Ideales**|**Ventajas Principales**|**Desventajas**<br>**/**<br>**Riesgos**|
|---|---|---|---|
|**1. Consumo Di-**<br>**recto de API**|Sitios con endpoints REST<br>o GraphQL expuestos (ej.<br>VTEX antiguo, APIs móvi-<br>les).|• Respuesta en JSON lim-<br>pio.<br>• Ultra rápido y liviano.<br>• Bajo consumo de CPU/-<br>RAM.|• Riesgo de migra-<br>ción/deprecación.<br>• Bloqueos por IP o<br>llaves de API.|
|**2.**<br>**Scraping**<br>**RSC / SSR**|Frameworks<br>modernos<br>(Next.js, Nuxt) que trans-<br>miten<br>el<br>estado<br>en<br>la<br>respuesta HTTP initial.|• No requiere ejecutar Ja-<br>vaScript.<br>• Altamente estable con<br>headers correctos.|• Formato de datos<br>no estándar (requie-<br>re Regex/Parseo es-<br>pecial).|
|**3.**<br>**Scraping**<br>**DOM / Head-**<br>**less**|Sitios renderizados<br>100 %<br>en cliente (SPA/React) o<br>protegidos por Cloudflare/-<br>DataDome.|• Permite extraer lo que el<br>usuario ve visualmente.|• Alto consumo de<br>recursos.<br>• Lento (requiere es-<br>pera de carga).|



3 

# **Análisis de Casos de Estudio y Supermercados Objetivos** 

Para abarcar el mercado de retail, se asignó una estrategia de extracción óptima a cada una de las principales cadenas de supermercados según su arquitectura tecnológica. 

## **Caso 1: Consumo Directo de API (Ejemplo: Lider.cl / Unimarc.cl)** 

**Sistemas Objetivo:** `Lider.cl` (Walmart) y `Unimarc.cl` (SMU). 

**Análisis de Arquitectura:** Plataformas que utilizan motores de búsqueda desacoplados como **Algolia** o APIs públicas en **GraphQL / REST** . Las peticiones devuelven respuestas estrictamente en formato JSON con la información de catálogo, ofertas y precios sin necesidad de procesar HTML. 

- **Mecanismo:** Consulta directa a endpoints de búsqueda (ejemplo: `/api/graphql` o endpoints de catálogo con filtros de categoría). 

- **Ventaja:** Respuestas ultra livianas ( _≈_ 50 KB), con tiempos de ejecución menores a 500 ms y sin overhead de renderizado. 

- **Ejemplo de Petición Directa (Python):** 

1 <mark>`import requests`</mark> 2 3 _<mark>`# Consulta directa a la API de catalogo / busqueda`</mark>_ 4 <mark>`url = "https :// www.unimarc.cl/api/graphql"`</mark> 5 <mark>`headers = { "Content -Type" : "application/json" }`</mark> 6 <mark>`payload = {`</mark> 7 <mark>`"query" : "query GetProducts { products(category: \" verduras \") { id name price offerPrice image } }"`</mark> 8 <mark>`}`</mark> 9 <mark>`response = requests.post(url , json=payload , headers=headers)`</mark> 10 <mark>`datos = response.json ()`</mark> 

## **Caso 2: Extracción en Capa de Datos RSC/SSR (Ejemplo: Jumbo.cl / Santa Isabel)** 

**Sistemas Objetivo:** `Jumbo.cl` y `Santa Isabel` (Grupo Cencosud). **Análisis de Arquitectura:** Ambos sitios migraron a **Next.js App Router** . No exponen una API REST limpia de catálogo público, pero aprovechan **React Server Components (RSC)** para transmitir los datos desde el servidor en el primer render. 

- **Mecanismo:** Petición GET a la URL limpia del catálogo enviando las cabeceras nativas del framework ( `RSC: 1` y `Accept: text/x-component` ). 

- **Ventaja:** Se obtiene el estado completo de productos (IDs, nombres, marcas y precios) en una sola petición HTTP de _≈_ 1.9 segundos sin ejecutar un navegador headless. **Ejemplo de Cabeceras en Scrapy:** 

1 _<mark>`# Configuracion de cabeceras en Scrapy para Jumbo/Santa Isabel`</mark>_ 2 <mark>`custom_settings = {`</mark> 3 <mark>`" DEFAULT_REQUEST_HEADERS " : {`</mark> 4 <mark>`"User -Agent" : "Mozilla /5.0 (Windows NT 10.0; Win64; x64)" ,`</mark> 5 <mark>`"RSC" : "1" ,`</mark> 6 <mark>`"Accept" : "text/x-component"`</mark> 7 <mark>`}`</mark> 8 <mark>`}`</mark> 

4 

## **Caso 3: Web Scraping Headless / DOM (Ejemplo: Tottus.cl)** 

**Sistemas Objetivo:** `Tottus.cl` (Integrado en Falabella.com). 

**Análisis de Arquitectura:** Sitios integrados en ecosistemas Single Page Application (SPA) complejos o protegidos por WAF estrictos (Cloudflare Bot Management / DataDome). Cargan los precios dinámicamente mediante eventos de cliente y validaciones de tokens en navegador. 

- **Mecanismo:** Automatización con **Playwright** o **Puppeteer** para renderizar el DOM completo, simular la interacción del usuario (esperar la hidratación de componentes) y extraer los selectores visuales. 

- **Desventaja:** Mayor consumo de recursos (CPU/RAM) y mayor tiempo de procesamiento por página ( _≈_ 5 a 8 segundos). 

- **Ejemplo de Extracción con Playwright:** 

1 <mark>`from playwright.sync_api import sync_playwright`</mark> 

2 

3 <mark>`with sync_playwright () as p:`</mark> 4 <mark>`browser = p.chromium.launch(headless=True)`</mark> 5 <mark>`page = browser.new_page ()`</mark> 6 <mark>`page.goto( "https :// www.falabella.com/falabella -cl/category/cat10002`</mark> `/Tottus" )` 7 <mark>`page. wait_for_selector ( ".product -name" )`</mark> 

8 

9 _<mark>`# Extrae datos directamente del DOM renderizado`</mark>_ 

10 <mark>`elementos = page. query_selector_all ( ".product -card" )`</mark> 

11 <mark>`for el in elementos:`</mark> 

12 <mark>`nombre = el.query_selector ( ".product -name" ).inner_text ()`</mark> 13 <mark>`precio = el.query_selector ( ".price" ).inner_text ()`</mark> 

14 <mark>`browser.close ()`</mark> 

5 

# **Políticas de Sostenibilidad y ”Polite Scraping”** 

Para garantizar que el proceso de extracción no afecte el rendimiento de los servidores objetivo ni provoque bloqueos anticipados de direcciones IP, el sistema debe regirse por los siguientes pilares: 

1. **Control de Frecuencia (** **_Rate Limiting_ ):** Implementar un retardo ( `DOWNLOAD` ~~`D`~~ `ELAY` ) de entre 1.0 y 2.0 segundos entre peticiones por dominio. 

2. **Rotación de Agentes y Cabeceras:** Utilizar User-Agents actualizados pertenecientes a navegadores reales. 

3. **Manejo Eficiente de Paginación:** Solicitar arreglos o páginas de productos en lotes máximos permitidos por el servidor (ej. 50 elementos por lote) para minimizar el total de peticiones HTTP. 

4. **Ventanas Horarias:** Ejecutar la actualización masiva de precios en horarios nocturnos o de bajo tráfico para la plataforma objetivo. 

# **Conclusiones y Propuestas para el Módulo de Web Scraping** 

**Jerarquía de Elección:** Siempre se priorizará el **Consumo de API** o la **Extracción RSC/SSR** por sobre el renderizado en navegador, reduciendo costos de infraestructura en más de un 80 %. 

**Tareas Propuestas para el Backlog (Módulo Scraping):** 

1. Mapear los endpoints y la estructura del DOM/API de los supermercados objetivo. 

2. Normalizar la extracción al esquema JSON acordado ( `SKU` , `Nombre` , `PrecioNormal` , `PrecioOferta` , `Categoria` , `ImagenUrl` ). 

3. Definir el contrato de entrega (exportación/payload JSON) para el consumo e integración con el módulo de Base de Datos. 

6 

