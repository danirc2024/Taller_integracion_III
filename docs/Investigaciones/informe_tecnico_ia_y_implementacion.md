# Sistema de Recomendación de Productos con IA 

Módulo de Asistente Conversacional — Informe Técnico 

Taller de Integración III 

Integrantes: Daniela Romero - Fabian Sanchez - Renato Carrasco - Marcelo Matamala - Vicente Matus - Esban Vejar 

_Documento en construcción: contiene las Partes 1 a 8 (de 9). Se actualizará a medida que se completen las partes restantes._ 

## **Índice** 

|**1. Introduccion y contexto**|**3**|
|---|---|
|1.1 Que es el proyecto . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . .<br>3|
|1.2 Problema que resuelve . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . .<br>3|
|1.3 Restricciones del curso y decisiones de stack derivadas . . . . . . . . . . . . .|. . .<br>3|
|1.4 Alcance y enfoque de este documento<br>. . . . . . . . . . . . . . . . . . . . . .|. . .<br>3|
|**2. Arquitectura general del sistema**|**4**|
|2.1 Panorama general: arquitectura de microservicios . . . . . . . . . . . . . . . .|. . .<br>4|
|2.2 Donde encaja el modulo de IA de este informe<br>. . . . . . . . . . . . . . . . .|. . .<br>4|
|2.3 Estado actual del prototipo vs. la arquitectura completa planeada<br>. . . . . .|. . .<br>5|
|**3. Seleccion de proveedor de IA**|**5**|
|3.1 Criterio de evaluacion en dos etapas . . . . . . . . . . . . . . . . . . . . . . .|. . .<br>5|
|3.2 Evaluacion teorica: 6 proveedores considerados<br>. . . . . . . . . . . . . . . . .|. . .<br>5|
|3.3 Evaluacion empirica y proveedor elegido: Gemini . . . . . . . . . . . . . . . .|. . .<br>6|
|3.4 Nota sobre el codigo actual . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . .<br>6|
|**4. Patron de arquitectura anti-alucinacion**|**6**|
|4.1 El problema que resuelve<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . .<br>6|
|4.2 El flujo de tres etapas . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . .<br>7|
|4.3 Las tres etapas en detalle . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . .<br>7|
|4.4 Por que esta separacion es la pieza central del proyecto<br>. . . . . . . . . . . .|. . .<br>8|
|4.5 Contrato de datos entre etapas (para replicar el patron) . . . . . . . . . . . .|. . .<br>8|
|**5. Implementacion tecnica y estructura del codigo**|**8**|
|5.1 Organizacion del proyecto en modulos . . . . . . . . . . . . . . . . . . . . . .|. . .<br>8|
|5.2 Modulos de configuracion y datos . . . . . . . . . . . . . . . . . . . . . . . . .|. . .<br>9|
|5.3 ia_definiciones.py — la funcion que evita alucinaciones desde el diseno. . . .|. . .<br>9|
|5.4 filtros.py — Etapa 2: filtrado deterministico . . . . . . . . . . . . . . . . . . .|. . .<br>9|
|5.5 explicacion.py — Etapa 3: prompt compartido<br>. . . . . . . . . . . . . . . . .|. . .<br>9|
|5.6 utils.py — utilidades transversales de encoding . . . . . . . . . . . . . . . . .|. . .<br>9|
|5.7 La interfaz ProveedorIA (app/proveedores/base.py)<br>. . . . . . . . . . . . . .|. . .<br>10|
|5.8 Las tres implementaciones concretas . . . . . . . . . . . . . . . . . . . . . . .|. . .<br>10|



1 

|5.9 routers/ — endpoints delgados sobre logica comun . . . . . . . . . . . . . . . . . .<br>5.10 main.py — el punto de ensamblaje<br>. . . . . . . . . . . . . . . . . . . . . . . . . .|11<br>11|
|---|---|
|**6. Compatibilidad entre proveedores**|**11**|
|6.1 Dos dialectos de function calling bajo una interfaz comun . . . . . . . . . . . . . .|11|
|6.2 Construccion de la peticion: mismo proposito, forma distinta<br>. . . . . . . . . . . .|11|
|6.3 Lectura de la respuesta: dos formas distintas de decir “aqui esta el JSON” . . . . .|12|
|6.4 Autenticacion y endpoint<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|13|
|6.5 Configuracion de generacion . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|13|
|6.6 Timeouts distintos por proveedor . . . . . . . . . . . . . . . . . . . . . . . . . . . .|13|
|6.7 Que queda del lado del router gracias a esta capa . . . . . . . . . . . . . . . . . . .|13|
|**7. Problemas reales encontrados durante el desarrollo, con causa raiz y solucion **|**14**|
|7.2 Function calling no forzado en Gemini: el bug con mas impacto real<br>. . . . . . . .|14|
|7.3 Groq rechaza la tool call por validacion de schema (400 tool_use_failed)<br>. . . . .|15|
|7.4 El matching de categoria por igualdad exacta no servia en la practica<br>. . . . . . .|15|
|7.5 distancia_max: 0 no es lo mismo que “no especificado”<br>. . . . . . . . . . . . . . .|16|
|7.6 Encoding: texto en espanol corrupto en pruebas con Groq — el bug no estaba en<br>el backend . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|16|
|7.7 Respuestas de Gemini truncadas o vacias (“Brief response in Spanish.”)<br>. . . . . .|16|
|7.8 Falso positivo de matching por substring: “bajo consumo” calzaba con “Ajo”<br>. . .|17|
|7.9 De “ingredientes de receta” a “palabras clave de cualquier producto” . . . . . . . .|17|
|7.10 Intento no adoptado: aviso de “no disponible en la tienda” . . . . . . . . . . . . .|17|
|7.11 Limites de tasa (429) en los niveles gratuitos . . . . . . . . . . . . . . . . . . . . .|18|
|7.12 Sintesis . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|18|
|**8. Instructivo de inicializacion y estructura de despliegue**|**18**|
|8.1 Alcance de esta parte y una referencia que queda desactualizada<br>. . . . . . . . . .|18|
|8.2 Estado actual vs. estructura objetivo . . . . . . . . . . . . . . . . . . . . . . . . . .|18|
|8.3 Ubicacion del modulo dentro del monorepo . . . . . . . . . . . . . . . . . . . . . .|20|
|8.4 Dockerfile del servicio api_gateway . . . . . . . . . . . . . . . . . . . . . . . . . . .|20|
|8.5 Variables de entorno: lo que el modulo necesita vs. lo que declara el docker-<br>compose.yml actual. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|21|
|8.6 Pasos de inicializacion . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|22|
|8.7 Nota para usar esta parte con un asistente de IA . . . . . . . . . . . . . . . . . . .|22|
|8.8 Sintesis<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|23|



2 

## **1. Introduccion y contexto** 

### **1.1 Que es el proyecto** 

Este proyecto es una aplicacion web que resuelve un problema concreto: encontrar los productos mas baratos dentro de una zona geografica definida por el usuario, combinando precio y distancia real. El catalogo de productos se obtiene mediante web scraping, y sobre esa base de datos se agrega un modulo de inteligencia artificial conversacional: el usuario escribe una consulta en lenguaje natural — por ejemplo, "puedes darme recetas para hacer con tomates.<sup>o</sup> "quiero hacer pebre– y el sistema interpreta esa consulta, selecciona productos reales del catalogo que calzan con lo pedido, y redacta una explicacion de por que esos productos son la respuesta. 

Este documento cubre especificamente el modulo de IA conversacional: un backend funcional en el que se implemento, probo y depuro en vivo la integracion con distintos proveedores de modelos de lenguaje, con el objetivo de compararlos en condiciones reales — no solo en documentacion de sus fabricantes — y elegir cual usar en la aplicacion final. El proveedor elegido para produccion es Google Gemini (ver Parte 3). 

### **1.2 Problema que resuelve** 

El desafio tecnico central no es “conectar un LLM a un catalogo” — eso es trivial. El desafio real es que un modelo de lenguaje, dejado libre, inventa: precios que no existen, productos que la tienda no vende, nombres de marcas al azar. Para un sistema de compras reales, eso es inaceptable. Todo el diseno de este modulo gira en torno a resolver ese problema de forma estructural (ver Parte 4), y buena parte del trabajo documentado en este informe consistio en descubrir, en la practica, todas las formas en que un modelo puede saltarse esa estructura si no se lo obliga explicitamente a respetarla (ver Parte 7). 

### **1.3 Restricciones del curso y decisiones de stack derivadas** 

El profesor impuso una restriccion explicita: no se permite PHP ni JavaScript “plano” (sin tipos). Esto definio directamente el stack: 

|**Restriccion**|**Decision tomada**|
|---|---|
|Nada de PHP|Backend 100 % en Python (FastAPI)|
|Nada de JS sin tipar|Frontend en Vue 3 + TypeScript, no JS suelto|



El resto del stack (PostgreSQL + PostGIS, Docker + Redis + Celery) se decidio por necesidad funcional real, no por la restriccion del curso — se detalla en la Parte 2. 

### **1.4 Alcance y enfoque de este documento** 

Este informe esta escrito para que una persona externa al equipo — sin haber visto el desarrollo — pueda: (1) entender por que se tomo cada decision de arquitectura, no solo cual se tomo; (2) leer el codigo y entender su estructura sin tener que ejecutarlo primero; y (3) replicarlo y modificarlo — incluyendo levantarlo con un stack de despliegue distinto al usado en desarrollo (por ejemplo, contenerizado con Docker en vez de correrlo directo con uvicorn). 

Por eso el informe no se queda en “que se construyo”, sino que documenta tambien los problemas reales que aparecieron al conectar APIs de IA distintas contra el mismo sistema — con su causa raiz y la solucion aplicada — porque ese proceso de depuracion es, en la practica, la parte mas representativa del trabajo tecnico real hecho en este prototipo. 

3 

## **2. Arquitectura general del sistema** 

### **2.1 Panorama general: arquitectura de microservicios** 

El proyecto completo (mas alla del modulo de IA que cubre este informe) esta disenado como una malla de microservicios independientes, containerizados con Docker, pensados para correr sobre hardware de consumo con recursos acotados. Cada microservicio corre aislado con limites estrictos de CPU/RAM via cgroups en docker-compose.yml, de forma que una falla o pico de consumo en uno (ej. scraping masivo nocturno) no comprometa a los demas. 

|**Microservicio**|**Responsabilidad**|**Tecnologia propuesta**|
|---|---|---|
|Scraper de catalogos|Extraccion de precios/productos<br>desde supermercados|Scrapy (Python) o<br>Crawlee (Node), segun<br>homogeneidad de stack|
|Normalizacion semantica|Unificar nombres de productos|API Cloud (Ope-|
|(IA #1)|equivalentes entre distintos<br>supermercados|nAI/Anthropic/Gemini),<br>con Ollama local como<br>contingencia LAN|
|Motor de rutas y grafos|Optimizar el recorrido entre<br>supermercados cruzando ahorro vs.<br>costo de desplazamiento<br>(TSP/VRP)|OSRM + Google<br>OR-Tools|
|API Gateway / Backend<br>central|Enrutamiento de peticiones,<br>orquestacion entre microservicios|FastAPI|
|Frontend|Interfaz de usuario, mapas y<br>comparativas|Vue 3 + TS (documentado<br>originalmente) / Next.js<br>(segun informe de<br>arquitectura de<br>microservicios del equipo<br>— a reconciliar)|
|Asistente conversacional<br>(IA #2)|Interpretar consultas en lenguaje<br>natural y recomendar productos<br>reales del catalogo — objeto de este<br>informe|FastAPI + Gemini|



La exposicion a internet en la etapa de PoC se resuelve con DNS dinamico (NO-IP) y port forwarding hacia el servidor local, con el API Gateway como punto unico de entrada — decision que no afecta al modulo de IA en si, pero si define que, en produccion, este modulo se consume como un servicio interno de la red, no expuesto directamente. 

### **2.2 Donde encaja el modulo de IA de este informe** 

Dentro de esa malla, el prototipo documentado aqui corresponde al microservicio “Asistente conversacional”. Su rol es distinto y no debe confundirse con el de normalizacion: 

- **Normalizacion (IA #1, fuera de este informe):** corre en el pipeline de ingesta de datos, antes de que los productos lleguen a la base de datos. Su input son textos crudos scrapeados; su output es un identificador unificado de producto. 

- **Asistente conversacional (IA #2, este informe):** corre en tiempo de consulta del usuario final. Su input es lenguaje natural (“quiero hacer pebre”); su output es una seleccion real de productos ya normalizados en catalogo, mas una explicacion en texto. Nunca 

4 

toca el proceso de scraping ni de normalizacion — asume que el catalogo que recibe ya es correcto y confiable. 

Ambos son “microservicios de IA” en sentido amplio, pero no comparten codigo, prompts, ni necesariamente el mismo proveedor de modelo — son decisiones independientes que cada responsable de modulo toma segun su propio caso de uso. 

### **2.3 Estado actual del prototipo vs. la arquitectura completa planeada** 

Es importante ser preciso sobre que tan avanzado esta esto: el prototipo probado y documentado en este informe corre de forma standalone, fuera de Docker todavia, contra un archivo productos.json de 18 productos de prueba — no contra el catalogo real scrapeado ni contenerizado junto al resto de la malla. Esto fue deliberado: aislar el modulo de IA le permitio iterar rapido (probar distintos proveedores, encontrar y corregir bugs reales) sin depender de que el resto de los microservicios (scraping, DB con PostGIS, motor de rutas) estuvieran terminados primero. 

La compatibilidad con la arquitectura de microservicios ya esta resuelta a nivel de diseno, no de despliegue: como se detalla en la Parte 5, el modulo esta estructurado de forma que empaquetarlo en un contenedor Docker propio (con su propio limite de cpus/memory en docker-compose.yml, igual que el resto de los servicios del equipo) es un paso de infraestructura, no un rediseno de codigo — es el mismo patron de aislamiento que ya usa el resto del equipo para scraping y rutas. 

## **3. Seleccion de proveedor de IA** 

### **3.1 Criterio de evaluacion en dos etapas** 

La seleccion del proveedor de IA para el asistente conversacional se hizo en dos etapas: primero una evaluacion teorica de 6 proveedores comerciales segun documentacion publica (limites de free tier, facilidad de integracion), y despues una evaluacion empirica — construyendo el mismo flujo funcional contra tres de ellos y comparando comportamiento real (velocidad, calidad de respuesta, estabilidad) — que es donde efectivamente se tomo la decision final. 

### **3.2 Evaluacion teorica: 6 proveedores considerados** 

|**Proveedor**|**Resultado**|**Motivo**|
|---|---|---|
|OpenAI|Descartado|Free tier limitado a GPT-3.5 Turbo, solo 3<br>peticiones/minuto|
|Anthropic (Claude)|Descartado|Sin nivel gratuito sostenido, requiere pago<br>tras creditos iniciales|
|Mistral AI|Descartado|Limites no publicados con claridad; Le<br>Chat limitado a ~25 mensajes/dia|
|Cohere|Descartado|Clave de prueba tope de 1.000<br>llamadas/mes, prohibida para apps<br>publicas|
|Groq|Paso a evaluacion empirica|Nivel gratuito permanente, ~14.400<br>peticiones/dia, API compatible con<br>OpenAI|
|Gemini|Paso a evaluacion empirica<br>— elegido|Nivel gratuito permanente, hasta ~1.000<br>peticiones/dia, buena calidad<br>conversacional reportada|



Un septimo proveedor, NVIDIA NIM (build.nvidia.com), se incorporo mas adelante — no estaba 

5 

en la evaluacion teorica original, pero al ser compatible con el mismo formato de API que Groq (OpenAI-style) y ofrecer un free tier equivalente, se sumo directamente a la fase empirica sin necesidad de una evaluacion teorica previa. 

### **3.3 Evaluacion empirica y proveedor elegido: Gemini** 

Los tres proveedores candidatos se probaron implementando el mismo flujo completo (extraccion de filtros -> filtrado real del catalogo -> explicacion en lenguaje natural), bajo la misma interfaz de codigo — es decir, no se compararon en abstracto sino corriendo literalmente la misma tarea. El detalle tecnico de cada problema encontrado durante esta evaluacion, con su causa raiz y solucion, esta documentado en la Parte 7 con fines de trazabilidad; aqui solo el veredicto de cada uno. 

**Gemini — elegido, proveedor de produccion.** Mostro el mejor equilibrio entre conocimiento cultural/regional (reconocio y asocio correctamente ingredientes para platos chilenos sin necesidad de refuerzo adicional en el prompt), calidad de redaccion en la etapa de explicacion, y — una vez corregido el problema de function calling no forzado (ver Parte 7) — comportamiento estable y predecible. Es el proveedor usado en el codigo de produccion descrito en el resto de este informe. 

**Groq — descartado.** El modelo liviano usado para la etapa de extraccion mostro conocimiento insuficiente de vocabulario y cultura culinaria regional: no reconocia consistentemente platos tipicos chilenos (ej. “pebre”) ni podia asociarlos a ingredientes reales. Es un modelo entrenado mayoritariamente en ingles — util por su velocidad de inferencia, pero insuficiente en profundidad de conocimiento cultural para este caso de uso especifico. 

**NVIDIA NIM — descartado.** Tecnicamente compatible y con buen catalogo de modelos, pero los modelos evaluados mostraron comportamiento de latencia menos predecible (tiempos de respuesta variables, casos de loops de repeticion durante la extraccion) y requirieron ajuste manual de presupuestos de tokens y timeouts. La complejidad operativa adicional no se justifico frente a Gemini. 

### **3.4 Nota sobre el codigo actual** 

El codigo conserva una interfaz comun de proveedor de IA que permite a Groq y NVIDIA seguir funcionando como respaldo o para benchmarking futuro (ver Parte 9), pero la configuracion de produccion usa Gemini como unico proveedor activo. El resto de este informe, salvo la Parte 7, describe el sistema asumiendo Gemini como el proveedor en uso. 

## **4. Patron de arquitectura anti-alucinacion** 

### **4.1 El problema que resuelve** 

Un modelo de lenguaje conversacional, usado sin restricciones, inventa. Si a Gemini se le pregunta “¿que productos tienes para hacer pebre?” y se le deja responder libremente, va a redactar una respuesta plausible y bien escrita — con nombres de productos, precios y marcas que pueden no existir en el catalogo real de la tienda. Para un sistema de recomendacion de compras reales, eso es inaceptable: el usuario terminaria buscando un producto que nunca estuvo en stock. 

La solucion de este proyecto no es “pedirle a Gemini que no invente” — eso es una instruccion de prompt, no una garantia. La solucion es estructural: el modelo nunca tiene la oportunidad de elegir un producto de su propia respuesta, porque la seleccion de productos ocurre en una etapa intermedia de codigo deterministico que el modelo no controla. 

6 

### **4.2 El flujo de tres etapas** 



<!-- Start of picture text -->
Usuario<br>Consulta en lenguaje natural<br>Extraccion de filtros<br>Gemini - function calling forzado,<br>Filtrado real<br>Coigo deterministico- sin 1A<br>Explicacion<br>Gernini - acotada a productos reales<br>Respuesta al usuario<br>Solo productos reales del catalogo<br>B® Con IA (Gemini Sin 1A (codigo deterministico)<br><!-- End of picture text -->

Figura 1: Flujo de tres etapas. Las etapas moradas son las únicas donde Gemini participa; la etapa central (verde azulado) es código Python puro, sin llamadas a ningún modelo. Esa etapa del medio garantiza que nunca se le muestre al usuario un producto inventado. 

### **4.3 Las tres etapas en detalle** 

**Etapa 1 — Extraccion de filtros.** El mensaje del usuario se envia a Gemini junto con la declaracion de una funcion (extraer_filtros_busqueda, ver Parte 5) que describe que parametros estructurados debe devolver: precio_max, categoria, distancia_max, palabras_clave. Gemini no genera texto libre en esta etapa — el modelo llama a esa funcion con argumentos, y el backend recibe un JSON estructurado, no una redaccion. 

El detalle critico, y el que causo mas problemas reales durante el desarrollo (ver Parte 7): esto solo funciona si se fuerza a Gemini a usar la funcion. Por defecto, Gemini decide libremente si llamar a la funcion o responder en texto libre (modo AUTO de toolConfig.functionCallingConfig). Para consultas del tipo “quiero hacer pebre”, Gemini interpretaba esto como una pregunta de cocina normal y respondia con su propio conocimiento culinario, saltandose por completo el resto del flujo. La solucion fue forzar el modo ANY, que obliga a Gemini a llamar siempre a la funcion — nunca a responder en texto libre. 

**Etapa 2 — Filtrado real.** Los filtros extraidos en la etapa anterior se aplican sobre el catalogo real de productos usando logica Python pura (filtrar_productos()), sin ninguna llamada a IA. Esta funcion filtra por precio maximo, categoria (con matching tolerante a variaciones de texto), distancia maxima, y palabras clave — devolviendo unicamente productos que existen de verdad en la base de datos, ordenados por precio. Gemini nunca ve el catalogo completo, y nunca decide que productos aparecen: solo recibe, en la siguiente etapa, el resultado ya filtrado. 

**Etapa 3 — Explicacion.** Los productos ya filtrados (los primeros 8, ordenados por precio, para mantener el prompt acotado) se envian de vuelta a Gemini con una instruccion explicita: 

7 

redactar una explicacion breve de por que esos productos calzan con lo pedido, sin inventar productos, precios ni caracteristicas que no esten en la lista recibida. Como Gemini solo ve esa lista corta — nunca el catalogo completo — no tiene de donde “elegir” algo que no sea real, incluso si quisiera. 

### **4.4 Por que esta separacion es la pieza central del proyecto** 

La garantia de “no alucinacion” no depende de que tan bien este redactado el prompt de la Etapa 3 — depende de que la Etapa 2 sea codigo deterministico que un modelo de lenguaje no puede sortear. Un prompt puede ignorarse; una funcion de Python que filtra una lista no. Esto es lo que hace que el patron sea robusto frente a cambios de modelo o proveedor: aunque cambiara el modelo de IA usado, la garantia de productos reales seguiria intacta porque no depende del modelo, depende del codigo entre las etapas 1 y 3. 

### **4.5 Contrato de datos entre etapas (para replicar el patron)** 

Para quien quiera reimplementar este patron con otro proveedor o en otro lenguaje, el contrato entre etapas es: 

|**De -> A**|**Formato**|**Ejemplo**|
|---|---|---|
|Usuario -> Etapa 1|Texto plano|"quiero hacer pebre"<br>|
|Etapa 1 -> Etapa 2|JSON estructurado<br>(schema fijo)|{"palabras_clave": ["tomate", çebolla",<br>çilantro", ...]}|
|Etapa 2 -> Etapa 3|Lista de objetos del<br>catalogo real (max. 8)|[{"nombre": "Tomate", "precio": 990, ...},<br>...]|
|Etapa 3 -> Usuario|Texto en lenguaje natural|Explicacion acotada a la lista recibida|



**El punto no negociable de este contrato:** la Etapa 2 nunca recibe ni produce texto libre, solo estructuras de datos. Es lo que hace verificable, en codigo, que ningun producto inventado pueda colarse. 

## **5. Implementacion tecnica y estructura del codigo** 

### **5.1 Organizacion del proyecto en modulos** 

El backend se organiza como un paquete app/ con una separacion clara entre configuracion, logica de dominio, proveedores de IA y capa HTTP: 

#### `app/` 

- `|-- config.py # credenciales, endpoints y modelos por proveedor` 

- `|-- productos.py` 

- `|-- schemas.py` 

- `|-- ia_definiciones.py` 

- `|-- filtros.py` 

- `|-- explicacion.py` 

- `|-- utils.py` 

   - `# acceso al catalogo (patron repositorio)` 

   - `# contrato de entrada (Pydantic)` 

   - `# schema de la funcion que el LLM debe llamar # Etapa 2: filtrado deterministico + saneamiento # Etapa 3: prompt compartido + medicion de tiempo # utilidades de encoding` 

- `|-- proveedores/` 

- `| |-- base.py` 

   - `# interfaz ProveedorIA (el nucleo de esta parte)` 

- `| |-- groq_proveedor.py` 

- `| |-- gemini_proveedor.py` 

- `| ‘-- nvidia_proveedor.py` 

- `‘-- routers/` 

8 

```
|--chat.py#endpoints/chat/{proveedor}
‘--productos.py#endpoints/y/productos
main.py#compositionroot
```

Esta separacion es la que permite lo senalado en la Parte 2.3: empaquetar el modulo en un contenedor Docker propio es trabajo de infraestructura, no de rediseno — cada pieza ya vive en su propio archivo con una responsabilidad acotada. 

### **5.2 Modulos de configuracion y datos** 

config.py centraliza credenciales, endpoints y modelos de los tres proveedores (dos modelos por proveedor en Groq y NVIDIA — extraccion liviana / explicacion grande —, uno solo en Gemini). productos.py define ProductoRepositorio, que envuelve el catalogo detras de obtener_todos(); ningun otro modulo lee el JSON directamente, asi que conectar el catalogo real de scraping es cuestion de reemplazar este archivo. schemas.py define ChatRequest, el unico dato que la API espera del usuario. 

### **5.3 ia_definiciones.py — la funcion que evita alucinaciones desde el diseno** 

Declara extraer_filtros_busqueda en los dos formatos que exigen los proveedores compatibles con tools estilo OpenAI (Groq y NVIDIA comparten esta misma definicion, reutilizada tal cual en main.py) y el formato nativo de Gemini. El campo palabras_clave es el que hace el trabajo pesado: no pide repetir literalmente palabras del mensaje, sino que instruye al modelo a usar conocimiento general para asociar el pedido con productos reales — el propio schema da el ejemplo de “comida salada con platano” _→_ ['platano', 'tostones', 'chicharron de platano']. Esto reemplazo un diseno anterior con campos separados categoria/ingredientes. 

### **5.4 filtros.py — Etapa 2: filtrado deterministico** 

Aqui vive el corazon del patron anti-alucinacion (Parte 4): filtrar_productos() no llama a ningun modelo, solo aplica logica Python sobre la lista real. Incluye sanitizar_filtros_crudos() y rescatar_filtros_de_error_groq() — el mecanismo de rescate cuando Groq rechaza una tool call por validacion de schema (400 tool_use_failed) —, y _coincide_por_texto() para matching tolerante a variaciones de texto. Un detalle de robustez concreto: _texto_contiene() exige igualdad exacta para strings de menos de 4 caracteres, corrigiendo un falso positivo real encontrado en pruebas (el token “bajo” matcheaba “Ajo” por pura coincidencia de substring). El detalle de causa raiz de estos bugs se documenta con mas profundidad en la Parte 7; aqui se describe solo el mecanismo de defensa. 

### **5.5 explicacion.py — Etapa 3: prompt compartido** 

construir_prompt_explicacion() arma el prompt de explicacion una sola vez, reutilizado por las tres implementaciones de proveedor (ver 5.8) — evita triplicar el mismo texto de instrucciones. generar_explicacion_con_tiempo() mide latencia y degrada con gracia: si la llamada de explicacion falla, la respuesta principal (productos ya filtrados) no se pierde. 

### **5.6 utils.py — utilidades transversales de encoding** 

fix_encoding_consola() reconfigura stdout/stderr a UTF-8 (invocado al inicio de main.py), y RespuestaUTF8 es una subclase de JSONResponse que fuerza charset=utf-8 en las respuestas salientes del backend — se instala como default_response_class de la app en main.py (ver 5.10). Es el complemento, del lado de salida, de un problema de encoding distinto encontrado del lado de entrada (decodificacion de las respuestas de Groq), documentado en la Parte 7. 

9 

### **5.7 La interfaz ProveedorIA (app/proveedores/base.py)** 

Esta es la pieza que le da nombre a la Parte 5. ProveedorIA es una clase abstracta (ABC) con exactamente dos metodos, ambos asincronos: 

```
classProveedorIA(ABC):
```

```
nombre:str
api_key:str|None
```

```
@abstractmethod
```

```
asyncdefextraer_filtros(self,mensaje:str)->ResultadoExtraccion:...
@abstractmethod
```

```
asyncdefgenerar_explicacion(
```

```
self,mensaje_usuario:str,productos_filtrados:list
)->str:...
```

El contrato de retorno de extraer_filtros() es ResultadoExtraccion, un dataclass que unifica en una sola forma los distintos resultados posibles (filtros extraidos, texto libre si el modelo no uso function calling, error de red o de API, nota informativa, tiempo de extraccion). Esto es lo que permite que el router (5.9) este escrito **una sola vez** para los tres proveedores: no necesita saber si esta hablando con Groq, Gemini o NVIDIA, solo consume el mismo objeto ResultadoExtraccion sin importar cual lo produjo. 

|Campo de ResultadoExtraccion|Uso|
|---|---|
|filtros|Dict de filtros extraidos, listo para filtrar_productos()|
|texto_libre|El modelo respondio en prosa en vez de llamar la funcion|
|error / error_estado|Falla de red o de la API, con el codigo de estado si aplica|
|nota|Contexto adicional (ej. rescate de Groq, sugerencia de rate<br>limit)|
|tiempo_extraccion_ms|Latencia medida de esta etapa|



### **5.8 Las tres implementaciones concretas** 

Las tres viven en app/proveedores/ e implementan la misma interfaz, pero difieren en un punto tecnico central: como se fuerza (o no) el function calling, el mismo problema que la Parte 4.3 identifico como el que mas bugs reales causo. 

|Proveedor|Mecanismo de forzado|Estado en el codigo|
|---|---|---|
|Gemini|toolConfig.functionCallingConfig.mode =<br>.<sup>A</sup>NY"|Forzado|
|NVIDIA|tool_choice: {"type": "function", "function":|Forzado|
||{"name": ...}}||
|Groq|tool_choice: .<sup>a</sup>uto"|No forzado|



Vale la pena dejarlo explicito porque es una inconsistencia real entre el comentario y el codigo: nvidia_proveedor.py justifica su tool_choice forzado diciendo que replica “el mismo criterio ya aplicado en groq_proveedor.py”, pero groq_proveedor.py efectivamente usa .<sup>a</sup> uto". Como Groq termino descartado por otras razones (Parte 3.3), esto no cambio la decision final, pero es una pieza de deuda tecnica real que el equipo deberia reconciliar — o forzando la funcion en Groq tambien, o corrigiendo el comentario para que no describa un comportamiento que el codigo no tiene. 

Dos patrones de diseno se repiten de forma consistente entre implementaciones: 

10 

- **Filtrado de contenido de razonamiento interno.** Gemini descarta partes marcadas como "thought.<sup>a</sup> ntes de construir el texto final; NVIDIA hace el equivalente con una expresion regular que remueve bloques <think>...</think> (presentes en modelos de razonamiento del catalogo NVIDIA, como la familia Nemotron). Mismo problema — un modelo “piensa en voz alta” y ese razonamiento no debe llegar al usuario como si fuera la respuesta —, resuelto con la misma estrategia en ambos proveedores. 

- **Rescate especifico de errores.** Solo Groq tiene rescatar_filtros_de_error_groq() porque es el unico de los tres cuya API rechaza la tool call completa (400) cuando un campo no calza con el schema; Gemini y NVIDIA no exhiben ese comportamiento en las pruebas realizadas. NVIDIA si anade notas contextuales por codigo de estado (429, 401/403, 404) para acelerar el diagnostico, un nivel de detalle que no estaba en las primeras versiones del prototipo. 

### **5.9 routers/ — endpoints delgados sobre logica comun** 

routers/chat.py concentra el flujo completo de tres etapas en una unica funcion interna, _procesar_chat(proveedor, mensaje), que recibe cualquier ProveedorIA y ejecuta: extraccion _→_ (si hay filtros) filtrado real via filtrar_productos() _→_ explicacion con medicion de tiempo. Los tres endpoints (/chat/groq, /chat/gemini, /chat/nvidia) quedan reducidos a una validacion de API key y una llamada a esa funcion comun — es la prueba concreta de que la interfaz ProveedorIA cumple su proposito: no hay logica de negocio duplicada por proveedor. routers/productos.py es mas simple: expone / (health check con conteo de productos) y /productos (catalogo completo sin filtrar), ambos leyendo del repositorio. 

### **5.10 main.py — el punto de ensamblaje** 

main.py no contiene logica de negocio: crea la app FastAPI con RespuestaUTF8 como clase de respuesta por defecto (cierra el ciclo del punto 5.6), agrega CORSMiddleware con origenes abiertos — necesario porque el frontend de prueba del Paso 8 (prueba.html) corre desde un origen distinto al backend, y sin CORS el navegador bloquea la respuesta antes de que el JS del cliente la vea —, instancia el repositorio de productos y los tres proveedores con su configuracion respectiva, y registra los routers. Es, literalmente, la pieza que arma todas las demas descritas en esta parte. 

## **6. Compatibilidad entre proveedores** 

### **6.1 Dos dialectos de function calling bajo una interfaz comun** 

El punto de partida de esta parte es una decision de las dos APIs mismas, no del proyecto: Groq y NVIDIA NIM implementan el formato de tool calling de OpenAI casi al pie de la letra (mismo POST /chat/completions, mismos campos messages/tools/tool_choice), mientras que Gemini expone su propio formato nativo (contents/parts/functionCall/toolConfig) sin compatibilidad con el de OpenAI. Son dos protocolos HTTP distintos para resolver exactamente el mismo problema. 

La interfaz ProveedorIA (Parte 5.7) existe especificamente para que esa diferencia no se filtre hacia arriba: cada clase de proveedor traduce su propio dialecto hacia el mismo objeto de salida (ResultadoExtraccion), y todo lo que esta por encima — filtrar_productos(), el router, el frontend — nunca necesita saber cual de los dos dialectos hablo el proveedor que respondio. 

### **6.2 Construccion de la peticion: mismo proposito, forma distinta** 

**Formato del mensaje del usuario** 

11 

||Groq / NVIDIA (estilo OpenAI)|Gemini (formato nativo)|
|---|---|---|
|Campo|messages|contents|
|Estructura|[{role": üser", çontent": mensaje}]|[{role": üser", "parts": [{"text":<br>mensaje}]}]|



Groq y NVIDIA reciben la funcion ya envuelta en el wrapper de OpenAI ({"type": "function", "function": {...}}) y la pasan tal cual en tools: [self.definicion_funcion]. Gemini exige una envoltura distinta — sin el nivel "function– que se arma en el momento de la llamada: tools: [{"function_declarations": [self.definicion_funcion]}]. Esta es la razon concreta por la que ia_definiciones.py (Parte 5.3) mantiene dos versiones del mismo schema en vez de una: no es redundancia, es que cada API literalmente exige una forma distinta del mismo contenido. 

**Forzar el uso de la funcion (el problema documentado en la Parte 4.3)** 

|Proveedor|Mecanismo|¿Forzado?|
|---|---|---|
|Gemini|"toolConfig": {"functionCallingConfig": {"mode":<br>.<sup>A</sup>NY"}}|Si|
|NVIDIA|"tool_choice": {"type": "function", "function": {"name":<br>...}}|Si|
|Groq|"tool_choice": .<sup>a</sup>uto"|No|



Cada API resuelve “obligar al modelo a llamar la funcion” con su propio vocabulario — mode en Gemini, tool_choice como objeto especifico en NVIDIA. Groq soporta el mismo mecanismo que NVIDIA (ambos hablan el dialecto OpenAI), pero el codigo actual no lo usa; queda senalado como deuda tecnica en la Parte 5.8. 

### **6.3 Lectura de la respuesta: dos formas distintas de decir “aqui esta el JSON”** 

Esta es la asimetria mas importante para quien vaya a depurar el codigo, porque un mismo tipo de error (el modelo no llamo la funcion) se detecta leyendo una ruta completamente distinta segun el proveedor: 

||Groq / NVIDIA|Gemini|
|---|---|---|
|Ruta hasta la tool call<br>Formato de los<br>argumentos|data[çhoices"][0]["message"]["tool_<br>String JSON — requiere<br>json.loads(...)|calls"]<br>data[çandidates"][0][çontent"]["parts"],<br>iterando por "functionCall"<br>Dict ya parseado —<br>part["functionCall"].get(.<sup>a</sup>rgs",<br>{})|
|Senal de “no uso la<br>funcion”|tool_calls es None/vacio|Ningun part trae "functionCall"|



El detalle de que Groq/NVIDIA entregan los argumentos como string y Gemini como dict ya listo es, en la practica, la clase de diferencia que si no se maneja explicitamente en cada implementacion, genera un TypeError silencioso dificil de rastrear — cada clase de proveedor lo resuelve en su propio metodo, y ResultadoExtraccion.filtros sale siempre como dict ya parseado sin importar de cual vino. 

12 

### **6.4 Autenticacion y endpoint** 

||Groq / NVIDIA|Gemini|
|---|---|---|
|Header de autenticacion|Authorization: Bearer<br>{api_key}|x-goog-api-key: {api_key}|
|Donde vive el modelo|En el body: "model":<br>self.modelo_extraccion|.../models/{GEMINI_MODEL}:generateConte|
|Endpoint|Mismo para todos los modelos<br>del proveedor|Uno distinto por modelo (se<br>arma en config.py)|



Que Gemini incruste el modelo en la URL en vez de en el body es la razon por la que, en config.py, GEMINI_ENDPOINT se construye con un f-string a partir de GEMINI_MODEL, mientras que GROQ_ENDPOINT y NVIDIA_ENDPOINT son constantes fijas — cambiar de modelo en Groq o NVIDIA es cambiar un string en el body de la peticion; en Gemini implica cambiar el endpoint mismo. 

### **6.5 Configuracion de generacion** 

Groq y NVIDIA limitan la respuesta con max_tokens, un unico numero. Gemini agrupa esto dentro de generationConfig junto con thinkingConfig.thinkingLevel, un control que no tiene equivalente directo en las otras dos APIs — Gemini reserva parte del presupuesto de tokens para “pensar” antes de responder, y bajarlo a "low.<sup>es</sup> lo que mantiene la latencia competitiva con Groq/NVIDIA (ver metricas reales en la Parte 8). 

Este mismo concepto de “razonamiento interno que no debe llegar al usuario” aparece tambien en NVIDIA, pero resuelto de forma distinta: como parte del catalogo NVIDIA incluye modelos razonadores (familia Nemotron, distillados de DeepSeek-R1), su salida de texto puede traer el razonamiento envuelto en literal <think>...</think>, que nvidia_proveedor.py remueve con una expresion regular despues de recibir la respuesta — no hay, en el caso de NVIDIA, un parametro de la API que lo desactive de antemano como el thinkingLevel de Gemini. Groq no necesita ninguno de los dos mecanismos porque el modelo elegido no expone razonamiento visible. 

### **6.6 Timeouts distintos por proveedor** 

gemini_proveedor.py y groq_proveedor.py usan timeout=25.0; nvidia_proveedor.py usa timeout=60.0. No es un descuido — es consecuencia directa de lo reportado en la Parte 3.3: NVIDIA mostro en las pruebas una latencia menos predecible, asi que su timeout se dejo con mas margen para no cortar peticiones que, aunque lentas, iban a completarse igual. 

### **6.7 Que queda del lado del router gracias a esta capa** 

routers/chat.py (Parte 5.9) no contiene ni un if proveedor == "gemini". Todo lo descrito en esta parte — formato de mensajes, forzado de function calling, parseo de la respuesta, autenticacion, timeouts — vive exclusivamente dentro de las tres clases en app/proveedores/. El router solo conoce el contrato abstracto de ProveedorIA: le entrega un mensaje de texto a extraer_filtros() y recibe de vuelta un ResultadoExtraccion, sin que le importe si detras hubo un POST a generateContent o a chat/completions. Esa es, en terminos concretos, la compatibilidad que promete el titulo de esta parte: no que las tres APIs sean iguales — no lo son, como muestra el resto de la seccion —, sino que esa desigualdad queda absorbida en un solo lugar del codigo. 

13 

## **7. Problemas reales encontrados durante el desarrollo, con causa raiz y solucion** 

Las Partes 4 a 6 describen el sistema tal como quedo, ya resuelto. Esta parte documenta el camino real para llegar ahi: los problemas concretos que aparecieron al conectar Groq, Gemini y NVIDIA contra el mismo flujo, en el orden aproximado en que se encontraron durante el desarrollo, cada uno con su sintoma, su causa raiz y la solucion aplicada en el codigo actual. Se incluyen tambien dos casos donde la solucion no fue perfecta o se dejo sin activar (7.10), a proposito: el objetivo de este informe, planteado en 1.4, es documentar el proceso real de depuracion, no una version mas prolija de lo que efectivamente ocurrio. 

|**Problema**|**Causa raiz**|**Modulo / solucion**|
|---|---|---|
|Function calling no<br>forzado (Gemini)|toolConfig en modo AUTO deja<br>al modelo responder en texto<br>libre|toolConfig.mode:<br>.<sup>A</sup>NY"(gemini_proveedor.py)|
|Groq rechaza la tool call<br>(400)|Campo opcional con texto en<br>vez de numero; Groq valida el<br>schema en su servidor|Prevencion en el schema +<br>resca-<br>tar_filtros_de_error_groq()<br>(filtros.py)|
|Matching de categoria por<br>igualdad exacta|Producto puntual o categorias<br>combinadas en un solo string|Substring + tokenizacion,<br>_coincide_por_texto()<br>(filtros.py)|
|distancia_max: 0 filtraba|0 es un valor numerico valido|Se ignora si es <= 0|
|todo|segun el schema|(filtrar_productos())|
|Encoding corrupto en<br>pruebas con Groq|Content-Type sin charset<br>explicito (bug del lado del cliente<br>de prueba, no del backend)|RespuestaUTF8 (utils.py)|
|Respuestas de Gemini|maxOutputTokens es un|thinkingLevel: "low-|
|truncadas o vacias|presupuesto compartido con el<br>thinking interno|maxOutputTokens: 1024|
|Falso positivo “bajo|Substring sin largo minimo|_texto_contiene() con|
|consumo” _→_“Ajo”|(“ajo” dentro de “bajo”)|umbral de 4 caracteres|
|ingredientes no<br>generalizaba a cualquier<br>pedido|Campo pensado solo para listas<br>literales de receta|Generalizado a<br>palabras_clave<br>(ia_definiciones.py)|
|Aviso de “no disponible”<br>con falsos negativos|Sin correccion ortografica,<br>“mansana” no calza con<br>“Manzana”|Implementado pero no<br>activado — deuda tecnica<br>(ver 7.10)|
|429 en Gemini / NVIDIA|Limite real del free tier de cada<br>proveedor|Notas contextuales por codigo<br>de estado en<br>ResultadoExtraccion|



### **7.2 Function calling no forzado en Gemini: el bug con mas impacto real** 

**Sintoma.** Ante consultas del tipo “quiero hacer pebre”, Gemini respondia directamente con su propio conocimiento culinario en vez de llamar a extraer_filtros_busqueda, saltandose por completo las etapas 2 y 3 del flujo descrito en la Parte 4. El endpoint devolvia texto libre en vez de productos filtrados reales. 

**Causa raiz.** El valor por defecto de toolConfig.functionCallingConfig.mode es AUTO: el modelo decide libremente si llama a la funcion o responde en texto. Gemini interpretaba una pregunta 

14 

de cocina como algo que puede responder solo, sin necesidad de “buscar” nada en un catalogo. 

**Solucion.** Forzar mode: .<sup>A</sup> NY.<sup>en</sup> toolConfig.functionCallingConfig (ver 6.2), que obliga a Gemini a llamar siempre a la funcion. NVIDIA se configuro igual desde un inicio con un tool_choice de tipo funcion especifica; Groq quedo con tool_choice: .<sup>a</sup> uto"sin forzar — inconsistencia real de codigo ya senalada como deuda tecnica en 5.8, que no afecto la decision final porque Groq fue descartado por otras razones (3.3). 

**Por que importa.** Este no es un detalle menor de configuracion: es el unico punto donde, sin corregirlo, el patron anti-alucinacion completo de la Parte 4 deja de aplicarse por completo — el modelo recupera la libertad de “elegir” una respuesta sin pasar nunca por el filtrado deterministico. 

### **7.3 Groq rechaza la tool call por validacion de schema (400 tool_use_failed)** 

**Sintoma.** Cuando un parametro opcional no aplicaba claramente —por ejemplo, el usuario dice “cerca” sin dar un numero para distancia_max—, Groq a veces no omitia el campo: escribia texto literal ahi (.<sup>o</sup> mision", çerca"), y el servidor de Groq respondia 400 tool_use_failed en vez de dejar pasar la llamada con ese campo mal tipado. 

**Causa raiz.** Groq valida el schema de la function call en su propio servidor antes de devolver la respuesta —a diferencia de Gemini, que entrega el dict tal cual el modelo lo genero, sin rechazar tipos que no calzan. 

**Solucion, en dos partes.** Prevencion: se endurecieron las descripciones de cada campo del schema (ia_definiciones.py, Parte 5.3), indicando explicitamente que si un campo no aplica no debe incluirse la clave, y que nunca debe escribirse texto como “omision” o null. Respaldo: el body del error 400 igual trae el JSON que el modelo genero, en error.failed_generation —a veces JSON puro, a veces envuelto en texto tipo <function=nombre>{...}</function>. rescatar_filtros_de_error_groq() (filtros.py, Parte 5.4) extrae ese substring entre la primera { y la ultima }, y descarta solo el campo con el tipo incorrecto conservando el resto — la llamada que antes fallaba con 400 ahora devuelve 200 con los filtros validos, sin que el usuario tenga que reintentar. 

### **7.4 El matching de categoria por igualdad exacta no servia en la practica** 

Dos variantes reales del mismo problema aparecieron en pruebas con datos reales: 

- **Producto puntual en vez de categoria.** El modelo a veces devuelve el nombre de un producto especifico en categoria (“tomates”) en vez de la categoria amplia (“verduras”). 

- **Categorias combinadas.** Para pedidos con mas de un tipo de producto, el modelo a veces junta dos categorias en una sola frase (“verduras y frutas”) en vez de elegir una. 

**Causa raiz.** En ambos casos, comparar categoria contra el catalogo por igualdad exacta de string no encuentra nada: “tomates” no es igual a “verduras”, y “verduras y frutas” no es igual a ninguna categoria real del catalogo. 

**Solucion.** Matching por contencion de substring en ambas direcciones (cubre el primer caso), con tokenizacion por palabra como respaldo cuando la frase completa no matchea con nada (cubre el segundo). No es perfecto para frases compuestas —trae ambas categorias completas en vez de solo la mas relevante—, pero es un comportamiento razonable para el alcance de este prototipo. 

15 

### **7.5 distancia_max: 0 no es lo mismo que “no especificado”** 

**Sintoma.** Cuando el usuario decia “cerca” sin dar un numero, el modelo a veces inventaba distancia_max: 0 en vez de omitir el campo. 

**Causa raiz.** 0 es un valor numerico valido segun el schema, asi que ni Gemini ni Groq lo rechazan —pero filtrar por distancia _≤_ 0 km deja el resultado vacio casi siempre, aunque exista un producto real cerca. 

**Solucion.** filtrar_productos() ignora explicitamente distancia_max cuando es 0 o negativo, tratandolo igual que si la clave no existiera. 

### **7.6 Encoding: texto en espanol corrupto en pruebas con Groq — el bug no estaba en el backend** 

**Sintoma.** Al probar los endpoints con Invoke-RestMethod de PowerShell, el texto con tildes o enies se veia como bÃºsqueda en vez de busqueda. 

**Causa raiz.** El cuerpo JSON que el backend envia ya es UTF-8 valido —Starlette lo serializa asi por defecto. El problema es que Starlette solo agrega charset=utf-8 automaticamente al header Content-Type para media types que empiezan con text/, nunca para application/json. Sin un charset explicito, Invoke-RestMethod decodifica la respuesta asumiendo ISO-8859-1 por defecto —comportamiento documentado de HttpWebResponse en PowerShell, no un bug de httpx ni de la API. 

**Solucion.** RespuestaUTF8 (utils.py, Parte 5.6), una subclase de JSONResponse que declara application/json; charset=utf-8 explicitamente, instalada como default_response_class de toda la app (main.py, Parte 5.10). 

**Nota metodologica.** Este caso ilustra por que vale la pena documentar la causa raiz y no solo el sintoma: la hipotesis inicial fue que httpx estaba “autodetectando mal” el encoding de la respuesta de Groq; investigar mas a fondo mostro que el problema estaba enteramente del lado del cliente de prueba, no en ninguna libreria del backend. 

### **7.7 Respuestas de Gemini truncadas o vacias (“Brief response in Spanish.”)** 

**Sintoma.** Con maxOutputTokens: 200, la etapa de explicacion de Gemini a veces devolvia un texto sin relacion con lo pedido —literalmente "Brief response in Spanish..<sup>en</sup> vez de una redaccion real, u otras veces una frase cortada a mitad de camino. 

**Causa raiz.** En gemini-3.6-flash el parametro correcto es generationConfig.thinkingConfig.thinkingLevel (no thinkingBudget, que es de la serie 2.5), y este modelo Flash no permite desactivar el thinking por completo, solo bajarlo al minimo ("low"). Mas relevante aun: maxOutputTokens es un presupuesto compartido entre el thinking interno y la respuesta visible, no dos cupos separados. Con 200 tokens, el razonamiento interno —incluso en “low”— consumia la mayor parte del presupuesto antes de llegar a redactar la respuesta real. 

**Solucion.** thinkingConfig.thinkingLevel: "low.<sup>en</sup> ambas llamadas a Gemini (extraccion y explicacion, ver 6.5), combinado con subir maxOutputTokens a 1024 para dejarle presupuesto real a la respuesta despues del thinking. Como medida defensiva adicional, se filtran las partes marcadas "thought": true antes de construir el texto final, por si en algun momento se activa includeThoughts. 

16 

### **7.8 Falso positivo de matching por substring: “bajo consumo” calzaba con “Ajo”** 

**Sintoma.** Al extender el matching de categoria a palabras_clave (ver 7.9), la busqueda “lavadora barata con bajo consumo” devolvia el producto “Ajo” del catalogo de prueba, sin ninguna relacion real con el pedido. 

**Causa raiz.** El token “bajo” contiene literalmente la palabra “ajo” como substring —el mismo mecanismo de matching tolerante que resuelve el problema de 7.4 se vuelve un falso positivo cuando las palabras involucradas son cortas. 

**Solucion.** _texto_contiene() (filtros.py, Parte 5.4) exige igualdad exacta en vez de contencion para strings de menos de 4 caracteres, y contencion en ambas direcciones solo para strings mas largos —el umbral se eligio empiricamente despues de encontrar este caso concreto. 

### **7.9 De “ingredientes de receta” a “palabras clave de cualquier producto”** 

**Contexto.** El diseno original de la etapa de extraccion tenia un campo ingredientes pensado especificamente para recetas (“tomate y ajo” _→_ [“tomate”, “ajo”]). Funcionaba bien para ese caso, pero no generalizaba. 

**Limitacion encontrada.** Pedidos que requieren asociacion indirecta en vez de una lista literal —“comida salada que tenga platano” (el usuario no dice “tostones” ni “chicharron de platano”, pero esas son preparaciones saladas reales con platano)—, o pedidos completamente fuera del dominio de comida —“lavadora barata con bajo consumo”—, no calzaban con un campo pensado solo para ingredientes. 

**Alternativas descartadas.** Se consideraron dos vias antes de la solucion final: (1) una API externa de recetas (ej. TheMealDB) —resuelve recetas pero no generaliza a otras categorias de producto—, y (2) el grounding de busqueda nativo de Gemini (Google Search) —generaliza mejor, pero es exclusivo de un proveedor, lo que rompe la comparacion pareja entre Groq, Gemini y NVIDIA que es el objetivo central de este prototipo (3.1). 

**Solucion.** Se reemplazo ingredientes por palabras_clave (ia_definiciones.py, Parte 5.3), instruyendo al modelo a proponer terminos de busqueda basados en su propio conocimiento general —no solo repetir palabras textuales del mensaje—, funcionando igual con los tres proveedores. El matching contra el catalogo sigue siendo 100 % deterministico (Parte 4): el modelo solo propone que buscar, nunca que mostrar. 

### **7.10 Intento no adoptado: aviso de “no disponible en la tienda”** 

**Motivacion.** Como complemento honesto a 7.9, se implemento _terminos_sin_match_en_catalogo(): para cada palabra clave propuesta por el modelo, revisa si existe al menos un producto real que le calce en todo el catalogo, para poder avisarle al usuario cuando algo que pidio simplemente no se vende —en vez de que la respuesta lo ignore en silencio. 

**Problema encontrado.** El modelo trata errores ortograficos como productos distintos. Con “recetas que tengan mansana o frutas en general” (con la falta de ortografia “mansana”), palabras_clave incluia “mansana” tal cual, sin corregir —y como el matching por substring de _coincide_por_texto() no hace correccion ortografica, “mansana” nunca calzaba contra el producto real “Manzana” del catalogo. El resultado: el sistema reportaba como “no disponible” un producto que si estaba en el catalogo —peor que no decir nada. 

**Estado actual.** La funcion se dejo fuera del flujo de respuesta hasta resolver la correccion ortografica de forma confiable: se prefirio no exponer una funcionalidad activamente enganosa antes que dejarla a medias. Queda como candidato de trabajo futuro (Parte 9): correccion por 

17 

distancia de edicion (ej. Levenshtein) contra los nombres reales del catalogo, o pedirle al propio modelo que normalice la ortografia como parte de la etapa de extraccion. 

### **7.11 Limites de tasa (429) en los niveles gratuitos** 

**Sintoma.** Tanto Gemini como NVIDIA devuelven 429 durante sesiones de prueba seguidas en un lapso corto. 

**Causa raiz.** Son limites reales del free tier de cada proveedor (3.2), no un bug del codigo —pero si algo que el manejo de errores necesitaba distinguir de una falla real. 

**Solucion.** gemini_proveedor.py y nvidia_proveedor.py capturan httpx.HTTPStatusError y agregan una nota contextual por codigo de estado (estado RESOURCE_EXHAUSTED en el caso de Gemini, con link a la pagina de limites de AI Studio) en vez de propagar solo un error generico — el objetivo es que quien este probando entienda de inmediato que no es un bug, sino que hay que esperar y reintentar. 

### **7.12 Sintesis** 

Ninguno de estos problemas comprometio la garantia central de la Parte 4: en ningun momento un producto inventado llego a mostrarse como si fuera real, porque la Etapa 2 —codigo deterministico— nunca dejo de ser la unica fuente de verdad. Lo que si exigieron estos bugs fue endurecer las etapas 1 y 3 —extraccion y explicacion— contra el comportamiento real e impredecible de cada proveedor. Ese endurecimiento, y no el diseno teorico inicial, es la mayor parte del trabajo tecnico documentado en este informe. 

## **8. Instructivo de inicializacion y estructura de despliegue** 

### **8.1 Alcance de esta parte y una referencia que queda desactualizada** 

Esta parte reemplaza el contenido originalmente planeado para el numero 8 de este informe. La Parte 6.5 anuncia **“ver metricas reales en la Parte 8”** en referencia a una comparacion de latencia entre proveedores — esa comparacion no se incluye aqui, y esa referencia debe leerse como desactualizada. Queda pendiente, si el equipo decide retomarla, como trabajo futuro (Parte 9), igual que la correccion ortografica senalada en 7.10. Se prioriza en su lugar un contenido con mas valor practico inmediato: un instructivo concreto para inicializar el modulo y, sobre todo, para encajarlo dentro del docker-compose.yml que el equipo ya definio para el resto de la plataforma (scraper, motor de rutas, base de datos, frontend) — algo que hasta ahora solo estaba descrito en abstracto (Parte 2.3). 

Esta parte tiene tres objetivos: (1) documentar como levantar el modulo, tanto de forma aislada como dentro de la malla completa de microservicios; (2) mapear la estructura de codigo ya descrita en la Parte 5.1 sobre la configuracion real de infraestructura (Dockerfile, dockercompose.yml, variables de entorno) que el equipo esta usando; y (3) dejar esta informacion en un formato lo bastante autocontenido como para que, junto al codigo real, pueda entregarse directamente a un asistente de IA y pedirle una propuesta concreta de reestructuracion (ver 8.7). 

### **8.2 Estado actual vs. estructura objetivo** 

La Parte 2.3 ya adelanto que el prototipo corre hoy de forma standalone, fuera de Docker. La siguiente tabla precisa que cambia, y que no, al encajarlo en el docker-compose.yml real del equipo: 

18 

|**Aspecto**|**Actual (standalone) -> Objetivo (docker-compose.yml)**|
|---|---|
|Ejecucion|uvicorn directo en el equipo de desarrollo (2.3) -> contenedor<br>api_gateway, build context ./backend/api|
|Origen de datos|productos.json en disco, via ProductoRepositorio (5.2) -> mismo<br>mecanismo hoy; sin conexion a Postgres desde este modulo todavia|
|Aislamiento de recursos|Ninguno (corre en el equipo de desarrollo) -> sin<br>deploy.resources.limits definido para api_gateway en el<br>docker-compose.yml actual|
|Variables de entorno|.env local leido por python-dotenv (5.2) -> bloque environment: del<br>servicio; hoy no coincide con lo que el modulo necesita (ver 8.5)|
|Exposicion|Puerto elegido manualmente al correr uvicorn -> puerto 8000<br>mapeado en docker-compose.yml, el mismo que usa main.py|



La fila de aislamiento de recursos merece una aclaracion: scraper_supermercados y motor_rutas_gasolina si tienen deploy.resources.limits definidos (1.0 cpu / 3G y 0.8 cpu / 2G respectivamente), pero api_gateway, db, redis y frontend no. Eso no es necesariamente un error — este modulo no tiene, hasta ahora, un patron de consumo pesado conocido, a diferencia del scraping masivo o el calculo de rutas —, pero vale la pena dejarlo escrito junto al resto de la deuda tecnica de este informe (5.8, 6.2): el criterio de “cada microservicio con su cuota” planteado en la Parte 2.1 hoy no se aplica de forma pareja a los seis servicios definidos. 

19 

### **8.3 Ubicacion del modulo dentro del monorepo** 

El docker-compose.yml del equipo referencia el modulo de este informe a traves del servicio api_gateway, con build.context: ./backend/api. Ese contexto de build es, literalmente, donde debe vivir el paquete app/ ya documentado en la Parte 5.1. Situado dentro del arbol completo del monorepo (los otros build contexts del mismo docker-compose.yml), queda asi: 

```
proyecto-supermercados/
```

- `|-- docker-compose.yml` 

- `|-- .env # variables reales, no versionado` 

- `|-- .env.example` 

- `|-- infrastructure/ | ‘-- db/` 

- `| ‘-- init.sql` 

```
#creaapi_db,scraper_db,rutas_db
```

- `|-- backend/` 

```
||--api/#buildcontextdeapi_gateway--esteinforme
|||--Dockerfile
|||--requirements.txt
|||--productos.json#siblingdeapp/,vernotaabajo
||‘--app/
|||--config.py
|||--productos.py
|||--schemas.py
|||--ia_definiciones.py
|||--filtros.py
|||--explicacion.py
|||--utils.py
|||--proveedores/
||||--base.py
||||--groq_proveedor.py
||||--gemini_proveedor.py
|||‘--nvidia_proveedor.py
|||--routers/
||||--chat.py
|||‘--productos.py
||‘--main.py
```

- `| |-- scraper/ | ‘-- motor_rutas/ ‘-- frontend/` 

```
|--scraper/#buildcontextdescraper_supermercados
‘--motor_rutas/#buildcontextdemotor_rutas_gasolina
frontend/
‘--web/#buildcontextdefrontend
```

La ubicacion de productos.json no es arbitraria. config.py calcula BASE_DIR como el padre del padre del propio archivo (Path(__file__).resolve().parent.parent): si config.py vive en app/config.py, BASE_DIR apunta un nivel por encima de app/ — es decir, a backend/api/ directamente. PRODUCTOS_PATH se arma como BASE_DIR / "productos.json", asi que el archivo debe copiarse junto a app/, no dentro de el. Como el Dockerfile actual usa COPY . . desde ./backend/api (8.4), basta con que productos.json exista en esa carpeta para que la ruta calculada en tiempo de ejecucion siga siendo valida dentro del contenedor, sin tocar config.py. 

### **8.4 Dockerfile del servicio api_gateway** 

La plantilla de Dockerfile ya escrita por el equipo para api_gateway es directamente compatible con la estructura de la Parte 8.3 — el CMD invoca uvicorn app.main:app, lo que asume 

20 

exactamente el paquete app/ documentado en la Parte 5.1: 

```
FROMpython:3.11-slim
ENVPYTHONDONTWRITEBYTECODE=1
ENVPYTHONUNBUFFERED=1
WORKDIR/app
COPYrequirements.txt.
RUNpipinstall--no-cache-dir-rrequirements.txt
COPY..
EXPOSE8000
CMD["uvicorn","app.main:app","--host","0.0.0.0","--port","8000","--reload"]
```

Dos detalles operativos a dejar anotados antes de darlo por definitivo: 

**--reload** activa recarga en caliente cuando cambia un archivo — util en desarrollo, coherente con el estado standalone descrito en 2.3 —, pero agrega overhead de vigilancia de archivos que no aporta nada en un contenedor pensado para quedar arriba con restart: unless-stopped. No es incorrecto dejarlo mientras el equipo sigue iterando, pero conviene registrarlo como pendiente: quitarlo (o moverlo a un docker-compose.override.yml exclusivo de desarrollo) antes de cualquier despliegue que no sea de prueba. 

- **requirements.txt** es referenciado por el Dockerfile pero no forma parte de los archivos compartidos hasta ahora. A partir de los imports reales usados en los modulos de la Parte 5, el minimo necesario es: 

```
fastapi
uvicorn[standard]
httpx
pydantic
python-dotenv
```

### **8.5 Variables de entorno: lo que el modulo necesita vs. lo que declara el dockercompose.yml actual** 

config.py (5.2) lee tres credenciales via os.getenv() despues de load_dotenv(): GROQ_API_KEY, GEMINI_API_KEY y NVIDIA_API_KEY. El bloque environment: del servicio api_gateway en el docker-compose.yml del equipo, sin embargo, declara algo distinto: 

```
environment:
```

- `DB_URL=postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@db:5432/api_db` 

- `- REDIS_URL=redis://redis:6379/0` 

- `OPENAI_API_KEY=${OPENAI_API_KEY}` 

Ninguna de las tres variables que el modulo realmente usa esta en esa lista, y la que si esta — OPENAI_API_KEY — no la usa ningun archivo de este informe: OpenAI fue el primer proveedor descartado (3.2) y nunca llego a implementarse una clase proveedora para el. .env.example, compartido junto al codigo, si tiene las tres variables correctas, asi que el desajuste esta puntualmente en el docker-compose.yml, no en la configuracion del modulo en si. 

La consecuencia practica de dejarlo asi: dentro del contenedor, os.getenv("GROQ_API_KEY") (y las otras dos) devuelve None sin importar que exista un .env correcto en la raiz del repositorio. Docker Compose usa ese .env para resolver los ${...} dentro del propio docker-compose.yml (ej. ${DB_USER:-postgres}), pero eso no inyecta automaticamente esas variables al entorno del contenedor: solo las que aparecen explicitamente en el bloque environment: de un servicio llegan a el. Con las tres keys ausentes, proveedor_groq.api_key, proveedor_gemini.api_key y proveedor_nvidia.api_key quedan en None dentro del contenedor, y los tres endpoints (5.9 / 

21 

chat.py) responden de inmediato “Falta GROQ_API_KEY en el archivo .env” (o el equivalente por proveedor) — incluso si el .env local del desarrollador tiene las tres claves reales. 

Bloque environment: propuesto para reconciliar esto — una propuesta a validar por el equipo, no un cambio ya aplicado sobre el archivo real: 

- `environment:` 

   - `GROQ_API_KEY=${GROQ_API_KEY}` 

   - `GEMINI_API_KEY=${GEMINI_API_KEY}` 

   - `NVIDIA_API_KEY=${NVIDIA_API_KEY}` 

   - `DB_URL=postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@db:5432/api_db` 

   - `- REDIS_URL=redis://redis:6379/0` 

DB_URL y REDIS_URL se mantienen en la propuesta porque no estorban — son variables que el resto de la plataforma ya usa (2.1) y que este modulo va a necesitar el dia que productos.py deje de leer productos.json y pase a consultar api_db directamente (2.3) —, pero hoy ningun archivo de este informe las lee: ProductoRepositorio (5.2) solo conoce la ruta de un archivo JSON. Se documentan aqui como preparacion, no como algo ya conectado. 

### **8.6 Pasos de inicializacion** 

- **Modo local — aislado, tal como se ha probado hasta ahora (2.3).** 

   - Crear un entorno virtual dentro de backend/api/ e instalar pip install -r requirements.txt (8.4). 

   - Copiar .env.example a .env dentro de esa misma carpeta y completar las tres API keys reales. 

   - Levantar el servidor con uvicorn app.main:app --reload desde backend/api/. 

   - Probar / (health check con el conteo de productos, 5.9) y /productos, y luego un POST a /chat/gemini con {"mensaje": "..."} para confirmar el flujo de tres etapas completo (4.2). 

- **Modo integrado — dentro del docker-compose.yml completo de la plataforma.** 

   - Completar un .env en la raiz del monorepo (no en backend/api/) con las variables que docker-compose.yml resuelve via ${...}, incluyendo las tres keys de IA una vez aplicado el ajuste de 8.5. 

   - Ejecutar docker compose up --build desde la raiz (o agregar -d para dejarlo corriendo en segundo plano). 

   - Revisar docker compose logs -f api_gateway para confirmar que arranco sin errores de configuracion (ej. keys ausentes, 8.5). 

   - Los mismos endpoints probados en modo local quedan disponibles en localhost:8000, ahora resueltos por el mapeo de puertos del servicio api_gateway. 

Un detalle a tener en cuenta cuando el modulo empiece a depender de db (hoy no lo hace, ver 8.2): depends_on en docker-compose.yml solo controla el orden de arranque de los contenedores, no si Postgres ya esta listo para aceptar conexiones. No es un problema hoy porque este modulo no abre ninguna conexion a base de datos, pero es relevante dejarlo anotado para cuando productos.py se conecte a api_db. 

### **8.7 Nota para usar esta parte con un asistente de IA** 

Si esta parte se entrega junto con el codigo real (Partes 4 a 7 mas los archivos fuente) a un asistente de IA para pedirle una propuesta concreta de reestructuracion, conviene dejarle explicito, 

22 

en el mismo mensaje, que de esto ya esta decidido y que sigue abierto — para que la propuesta no reabra discusiones ya cerradas en partes anteriores del informe ni ignore la deuda tecnica ya identificada. 

#### **Ya decidido — no reabrir sin una razon nueva:** 

- El patron anti-alucinacion de tres etapas y el contrato de datos entre ellas (Parte 4). 

- La interfaz ProveedorIA y el uso de Gemini como proveedor de produccion, con Groq y NVIDIA disponibles para benchmarking futuro (Partes 3 y 5.7). 

- El docker-compose.yml y la malla de seis microservicios ya definida por el resto del equipo (2.1) — este modulo se adapta a esa estructura, no al reves. 

#### **Abierto — candidatos reales para una propuesta de reestructuracion:** 

- Variables de entorno del servicio api_gateway (8.5). 

- Si conviene o no forzar tool_choice en Groq, para dejar de ser una inconsistencia frente al comentario de nvidia_proveedor.py (5.8). 

- Limites de cpus/memory para api_gateway, hoy ausentes a diferencia de scraper y motor_rutas (8.2). 

- Momento y forma de migrar productos.py de productos.json a una conexion real contra api_db (2.3). 

### **8.8 Sintesis** 

Nada de lo descrito en esta parte cambia el diseno documentado en las Partes 4 a 7 — el patron de tres etapas, la interfaz ProveedorIA y el proveedor elegido siguen intactos. Lo que aporta esta parte es la traduccion de ese diseno a la infraestructura real que el resto del equipo ya construyo: confirma que empaquetar el modulo es, como se adelanto en la Parte 2.3, trabajo de infraestructura y no de rediseno, y deja documentados — no corregidos en silencio — los puntos concretos donde esa infraestructura todavia no coincide con lo que el codigo necesita (8.2, 8.5). 

23 

