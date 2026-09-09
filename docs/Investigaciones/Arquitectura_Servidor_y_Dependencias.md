Arquitectura de Microservicios para Plataforma de Comparación de Precios de Supermercados y Optimización de Rutas 

Vicente Matus Daniela Romero Renato Carrasco Fabian Sánchez Esban Vejar 

Marcelo Matamala 

14 de agosto de 2026 

### **Resumen** 

Este informe técnico analiza la viabilidad y estrategias para desplegar una arquitectura orientada a microservicios en un entorno on-premise con hardware de consumo (Lenovo IdeaPad 320, procesador Intel Pentium y 12GB de RAM). El proyecto, concebido como un comparador de precios de alimentos en supermercados, exige la segregación de responsabilidades mediante contenedores Docker. Se abordan microservicios dedicados al web scraping asíncrono de catálogos, optimización de rutas espaciales considerando gastos de combustible, interfaces de usuario y enrutadores lógicos. Con enfoque en alta disponibilidad, se documenta la delegación del procesamiento de Inteligencia Artificial hacia servicios Cloud como pilar fundamental para la normalización semántica de productos, relegando el cómputo local con GPU a estatus estricto de contingencia. Finalmente, se establece la portabilidad del modelo hacia infraestructuras corporativas. 

# **Índice** 

|**1. Introducción**|**3**|
|---|---|
|**2. Arquitectura Orientada a Microservicios y Contenedorización**|**3**|
|2.1. El Rol de Docker en el Ecosistema . . . . . . . . . . . . . . . . . . . . .|.<br>3|
|2.2. Gestión Restrictiva de Recursos (cgroups)<br>. . . . . . . . . . . . . . . .|.<br>3|
|2.3. Exposición a Red Pública (NO-IP y Enrutamiento) . . . . . . . . . . .|.<br>4|
|**3. Web Scraping de Catálogos como Microservicio**|**4**|
|3.1. Desacoplamiento Operativo y Eficiencia . . . . . . . . . . . . . . . . . .|.<br>4|
|**4. Microservicios Web y Procesamiento Espacial**|**5**|
|4.1. API Gateway / Backend Central (Ej. FastAPI)<br>. . . . . . . . . . . . .|.<br>5|
|4.2. Microservicio de Optimización Espacial y Algoritmia<br>. . . . . . . . . .|.<br>5|
|4.3. Microservicio de Frontend (Ej. Next.js) . . . . . . . . . . . . . . . . . .|.<br>5|



1 

|**5. Integración de Inteligencia Artificial (Normalización)**|**5**|
|---|---|
|5.1. Microservicio Cloud Primario (APIs de Terceros)<br>. . . . . . . . .|. . . .<br>6|
|5.2. Nodos Locales Dedicados como Contingencia Excepcional . . . . .|. . . .<br>6|
|**6. Problemas Comunes, Soluciones y Escalabilidad**|**7**|
|6.1. Migración Matricial (Scale-Out / Scale-Up)<br>. . . . . . . . . . . .|. . . .<br>7|
|**7. Conclusiones**|**7**|



2 

# **1. Introducción** 

La inflación y la volatilidad en el costo de la canasta básica han generado la necesidad imperante de herramientas tecnológicas que empoderen al consumidor final. Este proyecto tiene como objetivo desarrollar una plataforma integral de comparación de precios de alimentos y artículos de supermercado (análoga conceptualmente a plataformas tecnológicas consolidadas como SoloTodo, pero enfocada estrictamente en abarrotes y productos de consumo diario). 

Para que esta propuesta tenga un impacto real, el sistema no solo debe recopilar y unificar listados de precios brutos, sino responder a un dilema logístico común: calcular si el ahorro en un determinado producto realmente justifica el desplazamiento físico, optimizando las rutas espaciales en el mapa y cruzando los datos con el gasto proyectado de combustible (bencina) o transporte público. 

Este informe documenta la implementación de dicho ecosistema de microservicios (Microservices Architecture) sobre un hardware base severamente restringido: un portátil Lenovo IdeaPad 320-15IKB (CPU Intel Pentium 4415U a 2.30 GHz y 12GB de RAM). El objetivo central es demostrar cómo el dise˜no basado en microservicios permite sortear los cuellos de botella de hardware al desacoplar procesos masivamente intensivos (scraping ininterrumpido de catálogos, algoritmia geoespacial y normalización de textos vía IA) de la gestión de peticiones web estándar, estableciendo una Prueba de Concepto (PoC) lista para escalar. 

# **2. Arquitectura Orientada a Microservicios y Contenedorización** 

En un entorno con recursos limitados, compilar una plataforma de tal magnitud en un único binario o proceso (monolito) resultaría fatal; si la recolección nocturna de precios de cientos de sucursales agota la memoria principal, colapsaría invariablemente el servidor web afectando a los usuarios concurrentes. La separación lógica y física es, por tanto, obligatoria (Turnbull, 2014). 

## **2.1. El Rol de Docker en el Ecosistema** 

Docker actúa como el facilitador primordial de la red de microservicios. Cada componente vital del comparador (Frontend interactivo, API Gateway, Scraper de Supermercados, Motor Geoespacial, Base de Datos Unificada) se despliega en su propio contenedor, lo que aporta: 

- **Aislamiento de Fallos:** La falla térmica de un microservicio específico no compromete la disponibilidad de la plataforma para los consumidores. 

- **Escalabilidad Horizontal Independiente:** Permite levantar múltiples réplicas (workers) únicamente del módulo de scraping durante las madrugadas (periodo de actualización de precios) sin sobredimensionar la plataforma web. 

## **2.2. Gestión Restrictiva de Recursos (cgroups)** 

Al alojar la plataforma en un equipo dual-core de gama baja, es mandatorio asignar cuotas estrictas de uso mediante el kernel de Linux. 

3 

1 <mark>`services:`</mark> 

2 <mark>`scraper_supermercados :`</mark> 3 <mark>`image: web_scraper_alimentos :latest`</mark> 4 <mark>`deploy:`</mark> 5 <mark>`resources:`</mark> 6 <mark>`limits:`</mark> 7 <mark>`cpus: ’1.0’ # Evita acaparar el Pentium durante recoleccion masiva`</mark> 8 <mark>`memory: 3G # Contencion contra fugas de memoria del DOM`</mark> 9 10 <mark>`motor_rutas_gasolina :`</mark> 11 <mark>`image: spatial_optimizer :latest`</mark> 12 <mark>`deploy:`</mark> 13 <mark>`resources:`</mark> 14 <mark>`limits:`</mark> 15 <mark>`cpus: ’0.8’ # Prioridad balanceada para calculo espacial intensivo`</mark> 16 <mark>`memory: 2G`</mark> 

Listing 1: Definición de microservicios aislados en docker-compose.yml 

## **2.3. Exposición a Red Pública (NO-IP y Enrutamiento)** 

Debido a la naturaleza de Prueba de Concepto (PoC) y la carencia de un dominio de nivel superior propio (TLD) asociado a un proxy inverso corporativo como Cloudflare, la plataforma web se expone a Internet utilizando una solución de DNS Dinámico (DDNS) provista por NO-IP. 

El enrutador perimetral de la red local realiza un reenvío de puertos (Port Forwarding) directamente hacia el servidor Lenovo. El API Gateway de la arquitectura asume la responsabilidad de recibir el tráfico desde el dominio de NO-IP y distribuirlo hacia los contenedores correspondientes (Frontend o Backend). Esta configuración demuestra que el ecosistema Dockerizado es completamente agnóstico al proveedor de red, permitiendo escalar a una infraestructura de DNS y CDN estándar en el futuro sin refactorizar el código base. 

# **3. Web Scraping de Catálogos como Microservicio** 

La extracción de listas de precios, ofertas temporales y disponibilidad de stock en diversas cadenas de retail alimenticio representa la fuente primaria de datos del proyecto (Mitchell, 2018). 

## **3.1. Desacoplamiento Operativo y Eficiencia** 

Para evitar que el procesador Pentium sufra de Thermal Throttling, el módulo de extracción se estructura como un microservicio asíncrono y aislado. En lugar de utilizar motores pesados de renderizado basados en Chromium para cargar catálogos repletos de imágenes (lo cual devoraría la memoria unificada), este nodo intercepta preferiblemente peticiones HTTP nativas desde las APIs privadas de los supermercados (usando aiohttp) e itera el marcado de manera secuencial y ligera. 

La orquestación se realiza a través de un Message Broker (como Redis o RabbitMQ). Esto permite encolar miles de URLs de productos alimenticios (carnes, lácteos, abarro- 

4 

tes) y procesarlas paulatinamente al ritmo dictaminado por el hardware, actuando como escudo protector de la integridad operativa del sistema base (Celery Project, 2023). 

# **4. Microservicios Web y Procesamiento Espacial** 

## **4.1. API Gateway / Backend Central (Ej. FastAPI)** 

El backend funciona como el enrutador central y nervioso de la red de microservicios. Su función no es computar los datos matemáticamente, sino enrutar eficientemente: recibe búsquedas HTTP del usuario (ej. búsqueda transversal del término .<sup>A</sup> ceite de Maravilla”), despacha la consulta a la base de datos indexada, y delega el análisis secundario de las rutas al microservicio espacial correspondiente (Ramalho, 2022). 

## **4.2. Microservicio de Optimización Espacial y Algoritmia** 

El pilar diferenciador de esta plataforma recae en cruzar el ahorro neto con la logística de desplazamiento. ¿Vale la pena viajar 15 kilómetros en automóvil cruzando la ciudad para ahorrar $1.000 en un kilo de arroz? Para responder matemáticamente a esto, el ecosistema integra un microservicio dedicado a la algoritmia espacial sobre mapas de geolocalización (ej. integrando Google Maps API, Mapbox o motores open-source como OSRM). 

Este módulo ejecuta algoritmos de optimización de recorridos (derivados del Problema del Viajante o grafos heurísticos tipo A*) para trazar la distancia física y el tráfico hacia la sucursal del supermercado. Posteriormente, evalúa el consumo estimado de bencina (en base al rendimiento del vehículo configurado por el usuario) o tarifas de transporte público para calcular el .<sup>A</sup> horro Real”. 

Debido a la altísima complejidad combinatoria subyacente, aislar este motor es incuestionable. Así, mientras este contenedor absorbe la carga matemática analizando el trazado de las calles, el hilo de eventos del API Gateway principal no sufre bloqueos y la web se mantiene responsiva. 

## **4.3. Microservicio de Frontend (Ej. Next.js)** 

La interfaz final donde el usuario visualiza la cartografía y las matrices comparativas se desacopla íntegramente. El frontend se compila estáticamente (Static Site Generation) para despachar HTML y Javascript pre-generado mediante un contenedor Nginx ultraligero, eximiendo a la CPU local del costoso renderizado bajo demanda. 

# **5. Integración de Inteligencia Artificial (Normalización)** 

En un comparador de supermercados transversal, la IA no es un adorno, sino una necesidad arquitectónica para el Análisis Semántico. Es imperativo que el sistema sea capaz de .<sup>en</sup> tender normalizar que los textos escrapeados C¸oca Cola 1.5L”, ”Bebida Coca-Cola 1500cc C¸ola Normal 1,5 Litros”de diferentes supermercados, corresponden exactamente al mismo identificador de producto para poder compararlos en la misma tabla. 

5 

## **5.1. Microservicio Cloud Primario (APIs de Terceros)** 

Dada la absoluta carencia de aceleración gráfica (GPU) en el servidor Lenovo, las cargas de Procesamiento de Lenguaje Natural (NLP) deben externalizarse prioritariamente hacia servicios Cloud empresariales (ej. OpenAI, Anthropic, Gemini). 

En este paradigma, la Inteligencia Artificial se consume como un microservicio SaaS externo, brindando un costo computacional nulo a nivel local y garantizando escalabilidad inmediata frente a los picos masivos de catalogación de productos nuevos (Zhao y cols., 2023). El código backend implementa mecanismos de Exponential Backoff para tolerar y mitigar caídas de la conexión hacia estas APIs (HTTP 429). 

- 1 <mark>`import httpx`</mark> 

2 <mark>`import asyncio`</mark> 3 4 <mark>`async def normalizar_producto_cloud (texto_producto : str):`</mark> 5 <mark>`# Enrutamiento primario a la Nube (Microservicio Externo)`</mark> 6 <mark>`cloud_api = "https :// api.openai.com/v1/chat/completions"`</mark> 7 <mark>`headers = {"Authorization": f"Bearer {API_KEY}"}`</mark> 8 9 <mark>`prompt = f"Normaliza el nombre de este producto de supermercado extraido: { texto_producto}"`</mark> 10 <mark>`payload = {`</mark> 11 <mark>`"model": "gpt -4o-mini",`</mark> 12 <mark>`"messages": [{"role": "user", "content": prompt }],`</mark> 13 <mark>`"temperature": 0.1 # Muy baja entropia para asegurar datos exactos`</mark> 14 <mark>`}`</mark> 15 16 <mark>`try:`</mark> 17 <mark>`async with httpx.AsyncClient(timeout =15.0) as client:`</mark> 18 <mark>`resp = await client.post(cloud_api , headers=headers , json= payload)`</mark> 19 <mark>`resp. raise_for_status ()`</mark> 20 <mark>`return resp.json ()[’choices ’][0][ ’message ’][’content ’]`</mark> 21 <mark>`except httpx.HTTPStatusError as e:`</mark> 22 <mark>`print(f"Error HTTP en Nube (Normalizacion): {e.response. status_code}")`</mark> 23 <mark>`return None`</mark> 

23 

Listing 2: API Gateway consumiendo IA Cloud para normalizar productos 

## **5.2. Nodos Locales Dedicados como Contingencia Excepcional** 

Exclusiva y estrictamente para escenarios de contingencia (tales como caídas prolongadas de la red WAN, cortes de API o políticas transitorias), el dise˜no de microservicios contempla un camino secundario de resguardo (Fallback). 

Ante la inaccesibilidad de la Cloud API primaria, el orquestador redirigirá temporalmente los prompts de normalización de alimentos hacia un nodo en la misma LAN. Como ejemplo demostrativo de este proyecto, este nodo secundario de contingencia podría ser una PC de escritorio con una gráfica dedicada comercial genérica (ej. AMD Radeon RX 570 de 8GB) ejecutando el motor local Ollama. Al compartir interfaces estándar RESTful, el enrutamiento se modifica fluidamente sin refactorizar la lógica central, salvaguardando la catalogación de precios sin forzar al hardware local doméstico a asumir el protagonismo del flujo de negocio. 

6 

# **6. Problemas Comunes, Soluciones y Escalabilidad** 

El reto ingenieril fundamental es orquestar la ingesta paralela masiva de precios, su normalización semántica con IA y la subsecuente triangulación de rutas espaciales de mapas, todo confinado a los estrechos límites del procesador y RAM del portátil base. 

## **6.1. Migración Matricial (Scale-Out / Scale-Up)** 

El laurel técnico de haber implementado esta plataforma íntegramente bajo la filosofía de Microservicios Dockerizados es su portabilidad total. Cuando la plataforma de supermercados gane tracción de usuarios y agote su etapa de PoC en el Lenovo base, toda la malla de servicios (Service Mesh) es exportable de manera íntegra e intacta (estrategia Lift and Shift). El ecosistema puede ser relocalizado en hiper-servidores en la nube (AWS, Azure) o administrado a través de orquestadores profesionales (Kubernetes), lo que permitiría que el comparador abarque cadenas minoristas a escala nacional. 

# **7. Conclusiones** 

La materialización de una plataforma logística y comparativa de precios de alimentos de alto impacto social, alojada primariamente sobre hardware severamente restringido, se demuestra factible única y exclusivamente gracias a la Arquitectura Orientada a Microservicios. 

El confinamiento estricto de cuotas en Docker evita bloqueos fatales durante el scraping masivo. El aislamiento asíncrono de la algoritmia espacial protege la fluidez e interactividad de la interfaz de usuario, y la adopción de infraestructuras SaaS externas Cloud para la unificación semántica por IA resguarda los limitados núcleos de la CPU anfitriona. El producto final destila resiliencia ingenieril, trazabilidad documental y está intrínsecamente dise˜nado para escalar hacia su despliegue en entornos comerciales definitivos. 

# **Referencias** 

- Celery Project. (2023). Celery: Distributed task queue. 

- Mitchell, R. (2018). Web scraping with python: Collecting more data from the modern web. O’Reilly Media, Inc. 

- Ramalho, L. (2022). Fluent python: Clear, concise, and effective programming. O’Reilly Media, Inc. 

- Turnbull, J. (2014). The docker book: Containerization is the new virtualization. James Turnbull. 

- Zhao, W. X., Zhou, K., Li, J., Tang, T., Wang, X., Hou, Y. (2023). A survey of large language models. arXiv preprint arXiv:2303.18223. 

7 

