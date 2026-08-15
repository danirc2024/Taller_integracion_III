# Arquitectura de Microservicios para Plataforma de Comparaci´on de Precios de Supermercados y Optimizaci´on de Rutas 

### Renato Carrasco 

### 14 de agosto de 2026 

#### **Resumen** 

Este informe t´ecnico analiza la viabilidad y estrategias para desplegar una arquitectura orientada a microservicios en un entorno on-premise con hardware de consumo (Lenovo IdeaPad 320, procesador Intel Pentium y 12GB de RAM). El proyecto, concebido como un comparador de precios de alimentos en supermercados, exige la segregaci´on de responsabilidades mediante contenedores Docker. Se abordan microservicios dedicados al web scraping as´ıncrono de cat´alogos, optimizaci´on de rutas espaciales considerando gastos de combustible, interfaces de usuario y enrutadores l´ogicos. Con enfoque en alta disponibilidad, se documenta la delegaci´on del procesamiento de Inteligencia Artificial hacia servicios Cloud como pilar fundamental para la normalizaci´on sem´antica de productos, relegando el c´omputo local con GPU a estatus estricto de contingencia. Finalmente, se establece la portabilidad del modelo hacia infraestructuras corporativas. 

## **´Indice** 

|**1. Introducci´on**|**3**|
|---|---|
|**2. Arquitectura Orientada a Microservicios y Contenedorizaci´on**|**3**|
|2.1. El Rol de Docker en el Ecosistema . . . . . . . . . . . . . . . . . . . . . <br>|.<br>3|
|2.2. Gesti´on Restrictiva de Recursos (cgroups)<br>. . . . . . . . . . . . . . . .|.<br>3|
|2.3. Exposici´on a Red P´ublica (NO-IP y Enrutamiento) . . . . . . . . . . .|.<br>4|
|**3. Web Scraping de Cat´alogos como Microservicio**<br>3.1. Desacoplamiento Operativo y Efciencia . . . . . . . . . . . . . . . . . .|**4**<br> .<br>4|
|**4. Microservicios Web y Procesamiento Espacial**|**5**|
|4.1. API Gateway / Backend Central (Ej. FastAPI)<br>. . . . . . . . . . . . .|.<br>5|
|4.2. Microservicio de Optimizaci´on Espacial y Algoritmia<br>. . . . . . . . . .|.<br>5|
|4.3. Microservicio de Frontend (Ej. Next.js) . . . . . . . . . . . . . . . . . .|.<br>5|
|**5. Integraci´on de Inteligencia Artifcial (Normalizaci´on)**|**5**|
|5.1. Microservicio Cloud Primario (APIs de Terceros)<br>. . . . . . . . . . . .|.<br>6|
|5.2. Nodos Locales Dedicados como Contingencia Excepcional . . . . . . . .|.<br>6|



1 

**6. Problemas Comunes, Soluciones y Escalabilidad 7** 6.1. Migraci´on Matricial (Scale-Out / Scale-Up) . . . . . . . . . . . . . . . . 7 **7. Conclusiones 7 Referencias 8** 

2 

## **1. Introducci´on** 

La inflaci´on y la volatilidad en el costo de la canasta b´asica han generado la necesidad imperante de herramientas tecnol´ogicas que empoderen al consumidor final. Este proyecto tiene como objetivo desarrollar una plataforma integral de comparaci´on de precios de alimentos y art´ıculos de supermercado (an´aloga conceptualmente a plataformas tecnol´ogicas consolidadas como SoloTodo, pero enfocada estrictamente en abarrotes y productos de consumo diario). 

Para que esta propuesta tenga un impacto real, el sistema no solo debe recopilar y unificar listados de precios brutos, sino responder a un dilema log´ıstico com´un: calcular si el ahorro en un determinado producto realmente justifica el desplazamiento f´ısico, optimizando las rutas espaciales en el mapa y cruzando los datos con el gasto proyectado de combustible (bencina) o transporte p´ublico. 

Este informe documenta la implementaci´on de dicho ecosistema de microservicios ( _Microservices Architecture_ ) sobre un hardware base severamente restringido: un port´atil Lenovo IdeaPad 320-15IKB (CPU Intel Pentium 4415U a 2.30 GHz y 12GB de RAM). El objetivo central es demostrar c´omo el dise˜no basado en microservicios permite sortear los cuellos de botella de hardware al desacoplar procesos masivamente intensivos (scraping ininterrumpido de cat´alogos, algoritmia geoespacial y normalizaci´on de textos v´ıa IA) de la gesti´on de peticiones web est´andar, estableciendo una Prueba de Concepto (PoC) lista para escalar. 

## **2. Arquitectura Orientada a Microservicios y Contenedorizaci´on** 

En un entorno con recursos limitados, compilar una plataforma de tal magnitud en un ´unico binario o proceso (monolito) resultar´ıa fatal; si la recolecci´on nocturna de precios de cientos de sucursales agota la memoria principal, colapsar´ıa invariablemente el servidor web afectando a los usuarios concurrentes. La separaci´on l´ogica y f´ısica es, por tanto, obligatoria (Turnbull, 2014). 

### **2.1. El Rol de Docker en el Ecosistema** 

Docker act´ua como el facilitador primordial de la red de microservicios. Cada componente vital del comparador (Frontend interactivo, API Gateway, Scraper de Supermercados, Motor Geoespacial, Base de Datos Unificada) se despliega en su propio contenedor, lo que aporta: 

- **Aislamiento de Fallos:** La falla t´ermica de un microservicio espec´ıfico no compromete la disponibilidad de la plataforma para los consumidores. 

- **Escalabilidad Horizontal Independiente:** Permite levantar m´ultiples r´eplicas ( _workers_ ) ´unicamente del m´odulo de scraping durante las madrugadas (periodo de actualizaci´on de precios) sin sobredimensionar la plataforma web. 

### **2.2. Gesti´on Restrictiva de Recursos (cgroups)** 

Al alojar la plataforma en un equipo dual-core de gama baja, es mandatorio asignar cuotas estrictas de uso mediante el kernel de Linux. 

3 

1 <mark>`services:`</mark> 2 <mark>`scraper_supermercados :`</mark> 3 <mark>`image: web_scraper_alimentos :latest`</mark> 4 <mark>`deploy:`</mark> 5 <mark>`resources:`</mark> 6 <mark>`limits:`</mark> 7 <mark>`cpus: ’1.0’ # Evita acaparar el Pentium durante recoleccion masiva`</mark> 8 <mark>`memory: 3G # Contencion contra fugas de memoria del DOM`</mark> 9 10 <mark>`motor_rutas_gasolina :`</mark> 11 <mark>`image: spatial_optimizer :latest`</mark> 12 <mark>`deploy:`</mark> 13 <mark>`resources:`</mark> 14 <mark>`limits:`</mark> 15 <mark>`cpus: ’0.8’ # Prioridad balanceada para calculo espacial intensivo`</mark> 16 <mark>`memory: 2G`</mark> 

Listing 1: Definici´on de microservicios aislados en `docker-compose.yml` 

### **2.3. Exposici´on a Red P´ublica (NO-IP y Enrutamiento)** 

Debido a la naturaleza de Prueba de Concepto (PoC) y la carencia de un dominio de nivel superior propio (TLD) asociado a un proxy inverso corporativo como Cloudflare, la plataforma web se expone a Internet utilizando una soluci´on de DNS Din´amico (DDNS) provista por **NO-IP** . 

El enrutador perimetral de la red local realiza un reenv´ıo de puertos ( _Port Forwarding_ ) directamente hacia el servidor Lenovo. El _API Gateway_ de la arquitectura asume la responsabilidad de recibir el tr´afico desde el dominio de NO-IP y distribuirlo hacia los contenedores correspondientes (Frontend o Backend). Esta configuraci´on demuestra que el ecosistema Dockerizado es completamente agn´ostico al proveedor de red, permitiendo escalar a una infraestructura de DNS y CDN est´andar en el futuro sin refactorizar el c´odigo base. 

## **3. Web Scraping de Cat´alogos como Microservicio** 

La extracci´on de listas de precios, ofertas temporales y disponibilidad de stock en diversas cadenas de retail alimenticio representa la fuente primaria de datos del proyecto (Mitchell, 2018). 

### **3.1. Desacoplamiento Operativo y Eficiencia** 

Para evitar que el procesador Pentium sufra de _Thermal Throttling_ , el m´odulo de extracci´on se estructura como un microservicio as´ıncrono y aislado. En lugar de utilizar motores pesados de renderizado basados en Chromium para cargar cat´alogos repletos de im´agenes (lo cual devorar´ıa la memoria unificada), este nodo intercepta preferiblemente peticiones HTTP nativas desde las APIs privadas de los supermercados (usando _aiohttp_ ) e itera el marcado de manera secuencial y ligera. 

La orquestaci´on se realiza a trav´es de un _Message Broker_ (como Redis o RabbitMQ). Esto permite encolar miles de URLs de productos alimenticios (carnes, l´acteos, abarro- 

4 

tes) y procesarlas paulatinamente al ritmo dictaminado por el hardware, actuando como escudo protector de la integridad operativa del sistema base (Celery Project, 2023). 

## **4. Microservicios Web y Procesamiento Espacial** 

### **4.1. API Gateway / Backend Central (Ej. FastAPI)** 

El backend funciona como el enrutador central y nervioso de la red de microservicios. Su funci´on no es computar los datos matem´aticamente, sino enrutar eficientemente: recibe b´usquedas HTTP del usuario (ej. b´usqueda transversal del t´ermino .<sup>A</sup> ceite de Maravilla”), despacha la consulta a la base de datos indexada, y delega el an´alisis secundario de las rutas al microservicio espacial correspondiente (Ramalho, 2022). 

### **4.2. Microservicio de Optimizaci´on Espacial y Algoritmia** 

El pilar diferenciador de esta plataforma recae en cruzar el ahorro neto con la log´ıstica de desplazamiento. ¿Vale la pena viajar 15 kil´ometros en autom´ovil cruzando la ciudad para ahorrar $1.000 en un kilo de arroz? Para responder matem´aticamente a esto, el ecosistema integra un microservicio dedicado a la algoritmia espacial sobre mapas de geolocalizaci´on (ej. integrando Google Maps API, Mapbox o motores open-source como OSRM). 

Este m´odulo ejecuta algoritmos de optimizaci´on de recorridos (derivados del Problema del Viajante o grafos heur´ısticos tipo A*) para trazar la distancia f´ısica y el tr´afico hacia la sucursal del supermercado. Posteriormente, eval´ua el consumo estimado de bencina (en base al rendimiento del veh´ıculo configurado por el usuario) o tarifas de transporte p´ublico para calcular el .<sup>A</sup> horro Real”. 

Debido a la alt´ısima complejidad combinatoria subyacente, aislar este motor es incuestionable. As´ı, mientras este contenedor absorbe la carga matem´atica analizando el trazado de las calles, el hilo de eventos del _API Gateway_ principal no sufre bloqueos y la web se mantiene responsiva. 

### **4.3. Microservicio de Frontend (Ej. Next.js)** 

La interfaz final donde el usuario visualiza la cartograf´ıa y las matrices comparativas se desacopla ´ıntegramente. El frontend se compila est´aticamente ( _Static Site Generation_ ) para despachar HTML y Javascript pre-generado mediante un contenedor Nginx ultraligero, eximiendo a la CPU local del costoso renderizado bajo demanda. 

## **5. Integraci´on de Inteligencia Artificial (Normalizaci´on)** 

En un comparador de supermercados transversal, la IA no es un adorno, sino una necesidad arquitect´onica para el An´alisis Sem´antico. Es imperativo que el sistema sea capaz de .<sup>en</sup> tender normalizar que los textos escrapeados _C¸oca Cola 1.5L”_ , _”Bebida Coca-Cola 1500cc”_ y _C¸ola Normal 1,5 Litros”_ de diferentes supermercados, corresponden exactamente al mismo identificador de producto para poder compararlos en la misma tabla. 

5 

### **5.1. Microservicio Cloud Primario (APIs de Terceros)** 

Dada la absoluta carencia de aceleraci´on gr´afica (GPU) en el servidor Lenovo, las cargas de Procesamiento de Lenguaje Natural (NLP) deben externalizarse prioritariamente hacia servicios Cloud empresariales (ej. OpenAI, Anthropic, Gemini). 

En este paradigma, la Inteligencia Artificial se consume como un **microservicio SaaS externo** , brindando un costo computacional nulo a nivel local y garantizando escalabilidad inmediata frente a los picos masivos de catalogaci´on de productos nuevos (Zhao y cols., 2023). El c´odigo backend implementa mecanismos de _Exponential Backoff_ para tolerar y mitigar ca´ıdas de la conexi´on hacia estas APIs (HTTP 429). 

1 <mark>`import httpx`</mark> 2 <mark>`import asyncio`</mark> 3 4 <mark>`async def normalizar_producto_cloud (texto_producto : str ):`</mark> 5 <mark>`# Enrutamiento primario a la Nube (Microservicio Externo)`</mark> 6 <mark>`cloud_api = "https :// api.openai.com/v1/chat/completions"`</mark> 7 <mark>`headers = { "Authorization" : f "Bearer {API_KEY}" }`</mark> 8 9 <mark>`prompt = f "Normaliza el nombre de este producto de supermercado extraido: { texto_producto}"`</mark> 10 <mark>`payload = {`</mark> 11 <mark>`"model" : "gpt -4o-mini" ,`</mark> 12 <mark>`"messages" : [{ "role" : "user" , "content" : prompt }],`</mark> 13 <mark>`"temperature" : 0.1 # Muy baja entropia para asegurar datos estructurados exactos`</mark> 14 <mark>`}`</mark> 15 16 <mark>`try :`</mark> 17 <mark>`async with httpx.AsyncClient(timeout =15.0) as client:`</mark> 18 <mark>`resp = await client.post(cloud_api , headers=headers , json= payload)`</mark> 19 <mark>`resp. raise_for_status ()`</mark> 20 <mark>`return resp.json ()[ ’choices ’ ][0][ ’message ’ ][ ’content ’]`</mark> 21 <mark>`except httpx.HTTPStatusError as e:`</mark> 22 <mark>`print (f "Error HTTP en Nube (Microservicio de Normalizacion): {e .response.status_code}" )`</mark> 23 <mark>`return None`</mark> 

Listing 2: API Gateway consumiendo IA Cloud para normalizar productos escrapeados 

### **5.2. Nodos Locales Dedicados como Contingencia Excepcional** 

Exclusiva y estrictamente para escenarios de contingencia (tales como ca´ıdas prolongadas de la red WAN, cortes de API o pol´ıticas transitorias), el dise˜no de microservicios contempla un camino secundario de resguardo ( _Fallback_ ). 

Ante la inaccesibilidad de la Cloud API primaria, el orquestador redirigir´a temporalmente los *prompts* de normalizaci´on de alimentos hacia un nodo en la misma LAN. **Como ejemplo demostrativo de este proyecto** , este nodo secundario de contingencia podr´ıa ser una PC de escritorio con una gr´afica dedicada comercial gen´erica (ej. AMD Radeon RX 570 de 8GB) ejecutando el motor local Ollama. Al compartir interfaces est´andar RESTful, el enrutamiento se modifica fluidamente sin refactorizar la l´ogica central, salvaguardando la catalogaci´on de precios sin forzar al hardware local dom´estico a asumir el protagonismo del flujo de negocio. 

6 

## **6. Problemas Comunes, Soluciones y Escalabilidad** 

El reto ingenieril fundamental es orquestar la ingesta paralela masiva de precios, su normalizaci´on sem´antica con IA y la subsecuente triangulaci´on de rutas espaciales de mapas, todo confinado a los estrechos l´ımites del procesador y RAM del port´atil base. 

### **6.1. Migraci´on Matricial (Scale-Out / Scale-Up)** 

El laurel t´ecnico de haber implementado esta plataforma ´ıntegramente bajo la filosof´ıa de Microservicios Dockerizados es su portabilidad total. Cuando la plataforma de supermercados gane tracci´on de usuarios y agote su etapa de PoC en el Lenovo base, toda la malla de servicios ( _Service Mesh_ ) es exportable de manera ´ıntegra e intacta (estrategia _Lift and Shift_ ). El ecosistema puede ser relocalizado en hiper-servidores en la nube (AWS, Azure) o administrado a trav´es de orquestadores profesionales (Kubernetes), lo que permitir´ıa que el comparador abarque cadenas minoristas a escala nacional. 

## **7. Conclusiones** 

La materializaci´on de una plataforma log´ıstica y comparativa de precios de alimentos de alto impacto social, alojada primariamente sobre hardware severamente restringido, se demuestra factible ´unica y exclusivamente gracias a la Arquitectura Orientada a Microservicios. 

El confinamiento estricto de cuotas en Docker evita bloqueos fatales durante el scraping masivo. El aislamiento as´ıncrono de la algoritmia espacial protege la fluidez e interactividad de la interfaz de usuario, y la adopci´on de infraestructuras SaaS externas Cloud para la unificaci´on sem´antica por IA resguarda los limitados n´ucleos de la CPU anfitriona. El producto final destila resiliencia ingenieril, trazabilidad documental y est´a intr´ınsecamente dise˜nado para escalar hacia su despliegue en entornos comerciales definitivos. 

7 

## **Referencias** 

- Celery Project. (2023). _Celery: Distributed task queue._ `https://docs.celeryq.dev/` . 

- Mitchell, R. (2018). _Web scraping with python: Collecting more data from the modern web_ . .<sup>O</sup> ’Reilly Media, Inc. 

. 

- Ramalho, L. (2022). _Fluent python: Clear, concise, and effective programming_ . .<sup>O</sup> ’Reilly Media, Inc. 

   - . 

- Turnbull, J. (2014). _The docker book: Containerization is the new virtualization_ . James Turnbull. 

- Zhao, W. X., Zhou, K., Li, J., Tang, T., Wang, X., Hou, Y., . . . others (2023). A survey of large language models. _arXiv preprint arXiv:2303.18223_ . 

8 

