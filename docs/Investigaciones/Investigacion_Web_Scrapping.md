Investigación Comparativa: Herramientas de Web Scraping 

# **Investigación Comparativa de Herramientas y Lenguajes para Web Scraping** 

Análisis Técnico de Librerías, Ventajas, Desventajas y Viabilidad Legal 

1 

Investigación Comparativa: Herramientas de Web Scraping 

## **1 Introducción** 

El _Web Scraping_ es una técnica fundamental en la ciencia de datos, inteligencia de negocios y automatización. Consiste en la extracción automatizada de datos desde sitios web. La elección del lenguaje y librería adecuada depende de la estructura del sitio (sitios estáticos vs. aplicaciones dinámicas rendered con JavaScript), los requerimientos de rendimiento, las medidas anti-bot y el volumen de datos a procesar. 

Este documento presenta una investigación sobre los principales lenguajes y librerías para la construcción de scrapers web. 

2 

Investigación Comparativa: Herramientas de Web Scraping 

## **Python: El Ecosistema Estándar de la Industria** 

Python se ha consolidado como el lenguaje estándar y dominante en la industria del _Web Scraping_ y la extracción masiva de datos. Esta hegemonía responde a una combinación de factores sintácticos, arquitectónicos y comunitarios: 

- **Sintaxis expresiva y bajo tiempo de desarrollo:** La filosofía de Python permite escribir scripts de extracción legibles y mantenibles en una fracción del tiempo que requerirían lenguajes compilados de bajo nivel. 

- **Ecosistema integrado de datos:** Las librerías de scraping en Python se conectan de forma nativa con herramientas fundamentales del pipeline de ciencia de datos, como Pandas para estructuración y limpieza, NumPy para manipulación vectorial, y conectores ORM (SQLAlchemy) o clientes NoSQL (PyMongo) para persistencia inmediata. 

- **Comunidad y soporte Anti-Bot:** La vasta comunidad de desarrolladores en Python mantiene constantemente actualizados paquetes especializados para evadir técnicas de huella digital ( _TLS fingerprinting_ ) y sistemas de detección automatizada (Cloudflare, Akamai, Datadome). 

A continuación, se analizan en detalle las principales herramientas de código en Python organizadas según su paradigma de extracción: 

### **BeautifulSoup (con Requests / HTTPX)** 

`BeautifulSoup` es un parser de documentos HTML/XML que se combina con clientes HTTP como `requests` o `httpx` . 

### **Ventajas:** 

- Curva de aprendizaje extremadamente baja. 

- Tolerante a errores en el código HTML de origen. 

- Ligero y con consumo mínimo de recursos de memoria y CPU. 

### **Desventajas:** 

- No ejecuta JavaScript; inútil para Single Page Applications (SPAs). 

- Depende de librerías externas para realizar las peticiones HTTP. 

- Rendimiento relativamente bajo en descargas masivas concurrentes. 

- **Mejor Caso de Uso:** Proyectos peque˜nos o medianos, sitios estáticos, scripts de prototipado rápido y análisis académico. 

3 

Investigación Comparativa: Herramientas de Web Scraping 

### **Scrapy** 

Framework de alto rendimiento basado en arquitectura asíncrona ( `Twisted` ) dise˜nado para extracción a gran escala. 

### **Ventajas:** 

- Extremadamente rápido y eficiente gracias al procesamiento de I/O no bloqueante. 

- Arquitectura completa (Pipelines para BD, Middlewares para rotación de Proxies/UserAgents). 

- Manejo automático de duplicados y seguimiento de enlaces. 

### **Desventajas:** 

- Curva de aprendizaje más pronunciada. 

- No renderiza JavaScript de forma nativa (requiere integración con `Scrapy-Playwright` o `Splash` ). 

**Mejor Caso de Uso:** Minería masiva de datos, web crawlers empresariales e indexación e-commerce a gran escala. 

### **Playwright for Python & Selenium** 

Automatizadores de navegadores reales (Headless Browsers) como Chromium, Firefox y WebKit. 

### **Ventajas:** 

- Capacidad total para ejecutar JavaScript y renderizar aplicaciones React, Angular o Vue. 

- Interacción avanzada: clicks, scroll, llenado de formularios, capturas de pantalla. 

- Playwright supera a Selenium en velocidad, ejecución asíncrona y auto-espera de elementos DOM. 

### **Desventajas:** 

- Alto consumo de CPU y memoria RAM por instancia de navegador. 

- Tiempos de ejecución sustancialmente más lentos comparados con peticiones HTTP puras. 

- Vulnerable a detección por sistemas Cloudflare/Akamai si no se usa con parches (e.g. `undetected-chromedriver` ). 

- **Mejor Caso de Uso:** Extracción de sitios con protección pesada por JS, portales bancarios, redes sociales y SPAs. 

4 

Investigación Comparativa: Herramientas de Web Scraping 

## **JavaScript / Node.js: Rendimiento Asíncrono Nativo** 

JavaScript, a través del entorno de ejecución Node.js, representa una alternativa natural y de alto rendimiento para el _Web Scraping_ . Al compartir el mismo motor de ejecución (V8) que el navegador objetivo, Node.js ofrece ventajas arquitectónicas clave: 

- **Ecosistema unificado y manipulación nativa del DOM:** Los desarrolladores utilizan las mismas APIs, selectores y conceptos sintácticos tanto en el script de extracción como en el sitio analizado. 

- **Bucle de eventos (Event Loop) no bloqueante:** La arquitectura asíncrona de Node.js gestiona eficientemente miles de solicitudes I/O concurrentes con un consumo de CPU y memoria significativamente menor que modelos multi-hilo tradicionales. 

- **Procesamiento nativo de JSON:** La intercepción de respuestas de APIs internas (peticiones XHR/Fetch) permite mapear objetos JSON directamente sin costos de serialización adicionales. 

- A continuación, se analizan en detalle las principales herramientas del ecosistema Node.js: 

### **Puppeteer & Playwright (Node.js)** 

Librerías Node.js que proporcionan una API de alto nivel para controlar Chromium y otros motores de renderizado. 

- **Ventajas:** 

   - Integración nativa con la sintaxis del lenguaje que se ejecuta en el navegador objetivo. 

   - Excelente rendimiento asíncrono ( `async/await` ). 

   - Puppeteer Stealth ofrece excelentes mecanismos para evadir la detección automatizada. 

- **Desventajas:** 

   - Alto consumo de infraestructura al escalar múltiples procesos headless. 

   - Manejo complejo de memoria a largo plazo si no se cierran adecuadamente las pesta˜nas. 

- **Mejor Caso de Uso:** Scraping de sitios dinámicos, generación de capturas/PDFs, automatización end-to-end. 

### **Cheerio (con Axios / Fetch)** 

Parser HTML ultrarrápido con la sintaxis y API equivalente a jQuery. 

- **Ventajas:** 

   - Increíblemente rápido: no renderiza un navegador ni carga el CSS/JS. 

   - Sintaxis amigable y conocida para desarrolladores web. 

- **Desventajas:** 

   - Limitado exclusivamente a contenido estático devuelto por el servidor HTTP. 

- **Mejor Caso de Uso:** Scraping de alta velocidad en arquitecturas basadas en Serverless (AWS Lambda, Cloudflare Workers). 

5 

Investigación Comparativa: Herramientas de Web Scraping 

## **Cuadro Comparativo de Herramientas** 

|**Librería / Tool**|**Lenguaje**|**Rendimiento**|**Soporte JS**|**Complejidad**|
|---|---|---|---|---|
|`BeautifulSoup`|Python|Medio|No|Muy Baja|
|`Scrapy`|Python|Muy Alto|No (Nativo)|Media-Alta|
|`Playwright`|Python / JS|Medio-Bajo|Sí|Media|
|`Selenium`|Python / Multi|Bajo|Sí|Media|
|`Cheerio`|Node.js|Alto|No|Baja|
|`Puppeteer`|Node.js|Medio|Sí|Media|



Cuadro 1: Comparativo general de capacidades y rendimiento. 

6 

Investigación Comparativa: Herramientas de Web Scraping 

## **Dise˜no y Justificación del Microservicio de Extracción** 

### **Estrategia de Extracción Directa a APIs Internas (JSON)** 

En lugar de procesar el marcado HTML completo y ejecutar motores de renderizado pesados en el servidor, el microservicio aprovecha la arquitectura moderna de las plataformas de _e-commerce_ ( _React, Next.js, VTEX, GraphQL_ ). Las interfaces web de los supermercados ejecutan consultas HTTP `GET` públicas en segundo plano para poblar sus catálogos. El scraper replica directamente estas peticiones a la API interna, obteniendo datos estructurados en formato JSON. Esta estrategia elimina el costo computacional de procesar imágenes y estilos gráficos, reduciendo significativamente el consumo de CPU y RAM. 

### **Matriz de Selección según Arquitectura de Servidor** 

Considerando las restricciones de hardware del entorno (ej. límites estrictos de CPU y memoria RAM asignados en `docker-compose.yml` ): 

- **Opción Principal: Scrapy (Python)** 

   - **Rendimiento y Recursos:** Capaz de procesar cientos de peticiones simultáneas consumiendo menos de 150 MB de RAM y un uso mínimo de CPU. 

   - **Alineación con el Proyecto:** Se integra de forma nativa con colas de mensajes (Redis / Celery) para procesar URLs de forma asíncrona en tareas programadas. 

   - **Estrategia de Extracción:** Ideal para consultar directamente las APIs públicas en formato JSON (como endpoints VTEX o GraphQL de cadenas como Jumbo, Lider o Santa Isabel) o parsear HTML estático. 

- **Opción para Ecosistemas Node.js: Crawlee (** `CheerioCrawler` **)** 

   - **Rendimiento y Recursos:** Gestión automática de concurrencia y auto-escalado según la memoria RAM disponible en el contenedor. 

   - **Alineación con el Proyecto:** Funciona sobre el motor ligero Cheerio (sin navegador gráfico), ofreciendo alta velocidad de descarga y bajo consumo. 

   - **Criterio de Aplicación:** Se evalúa como opción alternativa únicamente si el resto de la arquitectura de microservicios (API Gateway o Backend central) se desarrolla en Node.js, garantizando así la homogeneidad del stack tecnológico y facilitando el mantenimiento. 

7 

Investigación Comparativa: Herramientas de Web Scraping 

### **Estrategia Técnica e Implementación Operativa** 

1. **Captura de Endpoints Públicos:** Identificación de las rutas de consulta JSON mediante las herramientas de desarrollador ( _DevTools_ ) e inyección de encabezados de sesión en las peticiones HTTP del scraper. 

2. **Capas Anti-Bot Ligeras:** Rotación de encabezados _User-Agent_ e imitación de firmas de capa de transporte (TLS fingerprinting) en lugar de instanciar navegadores gráficos completos. 

3. **Plan de Contingencia (Fallback):** Si un objetivo impone un muro dinámico de verificación JavaScript, la tarea se aísla hacia un contenedor temporal restringido con **Playwright** , ejecutándose de forma estrictamente secuencial para proteger la CPU. 

## **Análisis de Viabilidad Legal, Etica**<sup>**´**</sup> **y Regulatoria** 

### **1. Naturaleza Técnica: Interceptación vs. Consumo de Endpoints Públicos** 

Es indispensable clarificar que el consumo de una API pública no constituye un ataque de interceptación de datos ni una intrusión. La petición HTTP `GET` ejecutada por el microservicio es formalmente idéntica a la que emite el navegador web de un cliente al visualizar el catálogo público. No se vulneran controles de acceso, no se descifran credenciales ni se accede a información privada. 

**2. Marco Penal Chileno (Ley N° 21.459 de Delitos Informáticos)** 

El análisis normativo bajo la legislación informática chilena determina: 

- **Acceso e Interceptación Ilícita (Arts. 2° y 3°):** No se configura delito, dado que los catálogos de precios y productos son datos de carácter público que no requieren autenticación, cuentas de usuario ni claves de acceso. 

- **Protección de Datos Personales (Ley N° 19.628):** Los precios, descripciones y SKUs de supermercados son datos comerciales de bienes y no corresponden a datos de carácter personal de personas naturales. 

- **Da˜no a Sistemas Informáticos (Art. 7°):** Un scraping sin control de velocidad podría saturar un servidor y ser considerado una denegación de servicio (DoS) involuntaria. Este riesgo se contrarresta mediante mecanismos de control de tasa ( _Rate Limiting_ ). 

### **3. Ambito**<sup>**´**</sup> **Civil y Gestión de Riesgos Operativos** 

El riesgo real de la extracción de datos no pertenece al ámbito penal, sino al cumplimiento de los Términos y Condiciones ( _ToS_ ) de las plataformas web: 

- **Bloqueo de Direcciones IP:** Los cortafuegos de aplicaciones web (WAF) pueden identificar volúmenes inusuales de tráfico y bloquear temporalmente la IP del servidor. 

- **Uso Responsable de Recursos:** Garantizar que la frecuencia de consulta no afecte el ancho de banda ni el rendimiento del sitio web objetivo. 

8 

Investigación Comparativa: Herramientas de Web Scraping 

**4. Protocolo de Buenas Prácticas (** **_Polite Scraping_ )** 

Para asegurar una conducta ética, sostenible y prevenir bloqueos de infraestructura, el microservicio establece las siguientes reglas operativas: 

- **Control de Tasa (** **_Autothrottling_ ):** Introducción de retardos aleatorios (de 1 a 3 segundos) entre peticiones para simular un comportamiento de consulta razonable. 

- **Actualización por Caché Local:** Almacenamiento persistente en base de datos de los datos extraídos, restringiendo las ejecuciones masivas a horarios de bajo tráfico (madrugadas). 

- **Identificación Transparente:** Configuración de un _User-Agent_ personalizado que incluya información de contacto o la identificación del proyecto de prueba de concepto (PoC). 

9 

Investigación Comparativa: Herramientas de Web Scraping 

## **Anexos** 

**Anexo A: Restricción de Recursos en Docker Compose** 

Configuración del archivo `docker-compose.yml` donde se aplican límites estrictos de CPU y memoria RAM ( _cgroups_ ) para el microservicio de scraping, protegiendo al servidor anfitrión contra picos de consumo durante la ingesta masiva de datos. 

```
version:’3.8’
```

```
services:
```

```
scraper_supermercados:
image:web_scraper_alimentos:latest
container_name:microservicio_scraper
restart:unless-stopped
deploy:
resources:
limits:
cpus:’1.0’#EvitasaturarlosnúcleosdelaCPUanfitriona
memory:3G#Límitemáximoparacontencióndememoria
reservations:
cpus:’0.2’
memory:512M
environment:
""""
```

**Anexo B: Flujo Operativo Anti-Bloqueo (** **_Polite Scraping_ )** 

Algoritmo de reintentos y retroceso exponencial ( _Exponential Backoff with Jitter_ ) implementado en el microservicio para garantizar la sostenibilidad de las peticiones y evitar la activación de reglas anti-bot en los servidores objetivo. 

**1. Extracción de Tarea:** El worker asíncrono ( `Scrapy` / `httpx` ) consume la URL o endpoint desde la cola de mensajes en Redis. 

**2. Despacho de Petición HTTP:** 

   - Inyección de encabezado _User-Agent_ válido de navegador moderno. 

   - Simulación de firma de capa de transporte mediante `curl` ~~`c`~~ `ffi` (TLS Fingerprinting). 

**3. Evaluación del Código de Estado HTTP:** 

   - **Código 200 (OK):** Se procesa el payload JSON, se persiste en la base de datos local y se aplica una pausa aleatoria ( _t ∈_ [1 _,_ 3] segundos). 

   - **Código 429 / 503 (** **_Rate Limit_ / Sobrecarga):** Se suspende el hilo, se incrementa el contador de reintentos _k_ y se calcula el tiempo de espera: 

_T_ espera = 2<sup>_k_</sup> + random(0 _,_ 1) (en segundos) 

- **Código 403 (Bloqueo WAF):** La petición se redirige al plan de contingencia diferido o se suspende temporalmente la IP del worker. 

10 

Investigación Comparativa: Herramientas de Web Scraping 

### **Anexo C: Estructura de Respuesta JSON de API Interna** 

Ejemplo representativo del payload en formato JSON que retorna la API pública/interna de un e-commerce (e.g., arquitectura VTEX / GraphQL) al consultar un producto. La extracción directa de esta estructura elimina la necesidad de procesar marcado HTML o renderizar código JavaScript. 

```
[
{
"productId":"7590123",
"productName":"AceitedeMaravilla1Litro",
"brand":"MarcaGenérica",
"categories":["/Abarrotes/AceitesyAderezos/"],
"items":[
{
"itemId":"100234",
"name":"AceitedeMaravilla1L",
"sellers":[
{
"sellerId":"1",
"commertialOffer":{
"Price":2190,
"ListPrice":2590,
"IsAvailable":true,
"AvailableQuantity":45
}
}
]
}
]
}
]
```

11 

Investigación Comparativa: Herramientas de Web Scraping 

### **Anexo D: Glosario de Términos Técnicos** 

- **TLS Fingerprinting** Técnica empleada por cortafuegos de aplicaciones web (WAF) como Cloudflare para identificar clientes automatizados analizando los parámetros de la negociación SSL/TLS (ja3 digest). 

- **Headless Browser** Navegador web sin interfaz gráfica ejecutable en servidores (e.g. Playwright, Puppeteer), capaz de interpretar JavaScript y renderizar el DOM completo de un sitio. 

- **Single Page App (SPA)** Aplicación web que carga una única página HTML y actualiza dinámicamente su contenido realizando llamadas asíncronas en segundo plano a APIs en formato JSON. 

- **Rate Limiting** Mecanismo de restricción utilizado por servidores web para limitar la cantidad de peticiones HTTP que una misma dirección IP puede realizar en un intervalo de tiempo determinado. 

- **cgroups** Funcionalidad del kernel de Linux utilizada por Docker para limitar y aislar el uso de recursos de hardware (CPU, memoria, I/O) de un grupo de procesos. 

12 

Investigación Comparativa: Herramientas de Web Scraping 

## **Referencias y Fuentes Consultadas** 

### **Marco Legal y Normativo (Chile)** 

- **Ley N° 21.459 (2022):** _Establece normas sobre delitos informáticos, deroga la Ley N° 19.223 y modifica otros cuerpos legales para adecuarlos al Convenio de Budapest._ Biblioteca del Congreso Nacional de Chile (BCN). 

   - Disponible en: `https://www.bcn.cl/leychile/navegar?idNorma=1177042` 

- **Ley N° 19.628 (1999):** _Sobre protección de la vida privada y tratamiento de datos de carácter personal._ Biblioteca del Congreso Nacional de Chile (BCN). Disponible en: `https://www.bcn.cl/leychile/navegar?idNorma=141597` 

### **Documentación Técnica y Frameworks** 

- **Scrapy Documentation:** _Scrapy 2.11 - A fast and powerful scraping and web crawling framework._ Disponible en: `https://docs.scrapy.org/` 

- **Crawlee by Apify:** _Crawlee - The scalable web scraping and browser automation library for JavaScript/TypeScript._ Disponible en: `https://crawlee.dev/` 

- **Playwright Python Documentation:** _Fast and reliable end-to-end testing and web automation for modern web apps._ Disponible en: `https://playwright.dev/python/` 

- **Docker Documentation:** _Resource management with Docker Compose (cgroups, CPU and memory limits)._ 

   - Disponible en: `https://docs.docker.com/compose/compose-file/deploy/#resources` 

- **curl** **~~c~~ ffi Project:** _Python binding for curl-impersonate via cffi, mimic browser TLS fingerprints._ 

   - Disponible en: `https://github.com/lexiforest/curl_cffi` 

13 

