Investigacion, Evaluacion y Seleccion de Posibles proveedores de Inteligencia Artificial Para el Proyecto 

_14 de agosto de 2026_ 

# **1. Resumen** 

En este documento se verá el diseño del módulo de Inteligencia artificial del sistema de recomendación de productos, donde su objetivo es interpretar consultas dadas por usuarios y en función de ellas seleccionar y justificar productos dentro del catálogo recolectado mediante web scraping, considerando variables de precio y distancia respecto a la ubicación del usuario. Previo a la selección definitiva, se evaluaron seis proveedores de modelos de lenguaje de gran escala (LLM): OpenAI, Anthropic, Mistral AI, Cohere, GroqCloud y Google AI Studio (Gemini), estos fueron seleccionados ya que se llegó al acuerdo de usar api en vez de de una manera local debido al uso también del servidor dejando poca Ram para su uso y aunque es algo plausible terminaría siendo una complicación más para el proyecto, al igual de que la velocidad de servicio y mantenimiento dependerá del dispositivo de un integrante (igualmente este tema se desarrollará más adelante). 

De ellos, se descartaron cuatro por restricciones de acceso gratuito incompatibles con el proyecto, quedando GroqCloud y Gemini como finalistas para la fase experimental. 

A continuación se documentará el proceso comparativo y descarte usando los criterios que sustentan la elección final, las vías arquitectónicas posibles para la integración y las estrategias de optimización específicas para cada proveedor seleccionado. 

# **2. Proveedores de Inteligencia Artificial Evaluados** 

Antes de la seleccion definitiva, se evaluaron seis proveedores de modelos LLM con potencial de integración en el sistema: OpenAI, Anthropic (Claude), Mistral AI, Cohere, GroqCloud y Google AI Studio (Gemini). El criterio de evaluación inicial fue la existencia de un nivel de acceso gratuito o de bajo costo que permitiera sostener el desarrollo y las pruebas del proyecto sin problemas de presupuestos, descartando de plano proveedores que operan exclusivamente bajo modalidad de pago desde el primer token. 

## **2.1. Cuadro Comparativo de Niveles Gratuitos** 

Aquí se eligieron en base a estos pilares que es el límite de tasa y el acceso, aunque finalmente hay mas características que tomar en cuenta estas funcionaron como colador para la selección de la mayoría de modelos 

1 

|**Proveedor**|**Acceso gratuito**|**Límite de tasa relevante**|**Resultado**|
|---|---|---|---|
|OpenAI|Solo GPT-3.5 Turbo; sin<br>créditos de prueba para<br>cuentas nuevas|3 peticiones por minuto|**Descartado**|
|Anthropic<br>(Claude)|Sin nivel gratuito sosteni-<br>do; solo créditos iniciales<br>limitados|Requiere método de pago<br>tras agotar créditos|**Descartado**|
|Mistral AI|Nivel "Experiment" gra-<br>tuito,<br>orientado<br>solo<br>a<br>evaluación|Límites exactos no publica-<br>dos; Le Chat limitado a ~25<br>mensajes/día|**Descartado**|
|Cohere|Clave de prueba ("Trial"),<br>uso no comercial|1.000 llamadas/mes en to-<br>tal; 20 peticiones/min en<br>Chat|**Descartado**|
|**GroqCloud**|Nivel gratuito permanen-<br>te, sin tarjeta de crédito|30 peticiones/min; 14.400<br>peticiones/día|**Seleccionado**|
|**Google**<br>**AI**|Nivel<br>gratuito<br>perma-|5-15 peticiones/min; hasta|**Seleccionado**|
|**Studio**<br>**(Ge-**<br>**mini)**|nente<br>para<br>modelos<br>Flash/Flash-Lite|1.000 peticiones/día||



## **2.2. Motivos de Descarte por Proveedor** 

OpenAI fue descartado principalmente por la severidad de su límite de tasa gratuito,el nivel sin costo restringe el acceso al modelo GPT-3.5 Turbo con apenas 3 peticiones por minuto (AgentDeals, 2026; ScriptByAI, 2026), y ya no ofrece créditos de prueba automáticos para cuentas nuevas. Este límite resulta insuficiente incluso para pruebas de desarrollo individuales, considerando que el flujo de trabajo propuesto (extracción de filtros + generación de la explicación) implica dos llamadas por cada consulta del usuario y obviamente las pruebas de saturación. 

Anthropic (Claude) fue descartado por no ofrecer un nivel gratuito sostenido en el tiempo, el acceso a la API se limita a créditos iniciales que una vez agotados exigen obligatoriamente la habilitación de un método de pago (Grizzly Peak Software, 2026b), lo que resulta incompatible con un proyecto sin presupuesto asignado durante toda su fase de desarrollo. 

Mistral AI pese a ofrecer un nivel gratuito de nombre "Experiment" en su plataforma La Plateforme no publica límites de tasa exactos para dicho nivel más allá de indicar que está "limitado por tasa para fines de evaluación" (Price Per Token, 2026), lo que dificulta planificar la capacidad del sistema durante las pruebas. Adicionalmente, su interfaz de consumo masivo (Le Chat) restringe el uso gratuito a aproximadamente 25 mensajes diarios (Grizzly Peak Software, 2026c), un volumen bajo para un ciclo iterativo de pruebas. 

Cohere fue descartado por el límite acumulado de su clave de prueba que seria un máximo de 1.000 llamadas mensuales combinadas entre todos los endpoints con un límite adicional de 20 peticiones por minuto para el endpoint de conversación (Cohere, 2026; PocketLantern, 2026). Bajo el flujo de dos llamadas por consulta propuesto para este proyecto, dicho límite equivale a, como máximo, 500 consultas de usuario al mes, un volumen que restringiría severamente las pruebas iterativas del equipo de desarrollo siendo lo más importante que el uso de claves de prueba está explícitamente prohibido para aplicaciones de cara al público, incluso en fase de demostración. 

GroqCloud y Google AI Studio, en cambio, fueron los únicos proveedores que combinan un nivel 

2 

gratuito permanente (no limitado a un período de prueba ni a créditos consumibles) con límites de tasa suficientes para sostener un ciclo completo de desarrollo, pruebas y hasta incluso una eventual demostración pública del proyecto. 

# **3. Justificación de la Selección Final** 

La selección definitiva de GroqCloud y Google AI Studio, por sobre los demás proveedores evaluados, se sustenta en tres criterios adicionales a la accesibilidad económica ya descrita, facilidad de implementación, adecuación al contexto de uso del proyecto (una aplicación universitaria de tráfico moderado o bajo) y compatibilidad técnica con la arquitectura ya definida. 

En cuanto al rendimiento, la infraestructura propietaria de Groq, basada en procesadores LPU (Language Processing Unit) en lugar de GPUs de propósito general lo cual permite tasas de generación de entre 300 y 800 tokens por segundo, frente a los 50-100 tokens por segundo habituales en proveedores basados en GPU, incluyendo Gemini (Dmytro Klymentiev, 2026). Esta velocidad para el proyecto se 

Finalmente, ambos proveedores exponen una interfaz Restful estándar compatible de forma nativa con FastAPI, sin dependencias adicionales. Groq, en particular, replica el formato de petición y respuesta de la API de OpenAI, lo que permite sustituir el proveedor de IA sin reescribir la lógica de integración del backend, más allá de la URL del endpoint y las credenciales — una ventaja que ninguno de los proveedores descartados ofrece de forma tan directa. 

Se opta por mantener ambos proveedores, en lugar de seleccionar uno solo, precisamente para ejecutar la comparación empírica planteada en la fase de pruebas antes de la siguiente reunión, evaluando cuál se ajusta mejor al caso de uso específico antes de definir el proveedor principal del sistema en producción. 

# **4. Uso local de IA(opcional revisar)** 

Como se adelantó en el Resumen, el equipo evaluó ejecutar el modelo de lenguaje de forma local en lugar de recurrir a proveedores en la nube. Aqui se documentará qué opciones se consideraron, cómo podrían utilizarse en la práctica, y por qué finalmente se optó por mantener esta vía como alternativa de contingencia en lugar de adoptarla como solución principal 

## **4.1. Opciones de Ejecución Local Evaluadas** 

- Ollama: motor de código abierto que gestiona la descarga y ejecución de modelos LLM (Llama, Mistral, Qwen, Phi, etc...) y expone una API REST compatible con el estándar de OpenAI en localhost:11434 por defecto. Es la opción más extendida actualmente para despliegues locales, tanto por su simplicidad de instalación como por la compatibilidad de su API con clientes ya preparados para OpenAI (Local AI Master, 2026a). 

- LM Studio: interfaz gráfica construida sobre llama.cpp. También expone un servidor local con API compatible con OpenAI, siendo una alternativa a Ollama con menor curva de aprendizaje si es que se hacen pruebas puntuales. 

- Llama.cpp:es un motor de bajo nivel en C C++ sobre el cual se apoyan tanto Ollama como LM Studio. Y da mayor control sobre la cuantización y el uso de memoria, a cambio de una configuración manual más compleja. 

3 

## **4.2. Cómo Podría Utilizarse** 

La vía de uso más práctica identificada consiste en que un integrante del equipo que cuente con una GPU dedicada aloje Ollama en su propio equipo, exponiendo el servicio dentro de la red local durante sesiones de desarrollo conjunto o mediante un túnel temporal (por ejemplo, ngrok o Cloudflare Tunnel) para pruebas fuera de esa red. Dado que Ollama replica de forma compatible el formato de la API de OpenAI, esta integración no requeriría lógica adicional más allá de cambiar la URL base del cliente HTTP, en línea con la ventaja de portabilidad ya descrita en la Sección 3 para Groq. 

## **4.3. Requisitos de Hardware y su Relación con el Proyecto** 

Para una inferencia local aceptable, las guías especializadas recomiendan un mínimo de 16 GB de RAM junto con una GPU de 8 a 12 GB de VRAM, lo que permite ejecutar modelos de 7 a 14 mil millones de parámetros a velocidades de entre 30 y 60 tokens por segundo. Sin GPU dedicada, la inferencia recae por completo sobre la CPU, reduciendo el rendimiento a un rango de apenas 2 a 8 tokens por segundo en un procesador de laptop típico, muy por debajo de lo aceptable para una interacción conversacional fluida (Local AI Master, 2026b). 

Ninguno de los equipos disponibles del grupo cumple de forma clara con el primer perfil (GPU dedicada de 8 GB o más de VRAM), y el servidor que aloja el resto del stack del proyecto no dispone de margen de RAM adicional para sostener un modelo de forma estable en paralelo a Docker, PostgreSQL y los demás servicios. 

## **4.4. Motivo del Descarte como Opción Primaria** 

Se descartó el uso local como proveedor principal por tres motivos concretos. Primero, la contención de recursos: ejecutar el modelo en la misma máquina que aloja el resto del stack competiría directamente por RAM con los contenedores de Docker y la base de datos, un riesgo ya advertido de forma general para hardware limitado en el informe de arquitectura del servidor (Sección 5.1, "Inviabilidad del Procesamiento Local Aislado"). Segundo, la dependencia de disponibilidad: si el modelo se aloja en el equipo personal de un integrante, la disponibilidad del servicio de IA queda atada a que ese dispositivo esté encendido y conectado, lo que introduce un punto único de falla poco práctico para el desarrollo distribuido del equipo. Tercero, dado que Groq y Gemini ya cubren las necesidades del proyecto sin costo alguno, la complejidad adicional de mantener una vía local no se justifica en esta etapa. 

Por estas razones, el uso local se mantiene documentado como una vía de contingencia y de aprendizaje —útil, por ejemplo, para pruebas puntuales sin conexión a internet—, pero no se adopta como proveedor principal ni secundario del sistema en esta fase del proyecto. 

# **5. Posibles Vías de Implementación** 

Se identifican las siguientes estrategias arquitectónicas para integrar el módulo de IA dentro del sistema, no necesariamente excluyentes entre sí 

## **5.1. Patrón de extracción de filtros mediante function calling** 

La vía principal propuesta consiste en un flujo de dos etapas. En la primera, el mensaje del usuario se envía al LLM junto con la definición de una función (function calling / structured output) que especifica los parámetros esperados: precio máximo, categoría del producto y radio de distancia. El 

4 

modelo no genera texto libre en esta etapa, sino un objeto estructurado (JSON) con dichos parámetros en la segunda etapa, el backend utiliza esos parámetros para filtrar y ordenar los productos ya almacenados en la base de datos, y solicita al modelo una segunda respuesta esta vez en un lenguaje mas natural que explique la selección, restringida exclusivamente a los productos reales devueltos por el filtro evitando que el modelo genere referencias a productos inexistentes, dado que la elección final del producto la realiza la lógica determinística del backend, no el LLM. 

Ejemplo simplificado de la llamada asíncrona hacia la API del proveedor: 

```
asyncdefextraer_filtros(mensaje_usuario:str)->dict:
payload={
"model":"llama-3.1-8b-instant",
"messages":[{"role":"user","content":mensaje_usuario}],
"tools":[definicion_funcion_filtros],
"tool_choice":"auto"
}
asyncwithhttpx.AsyncClient(timeout=15.0)asclient:
r=awaitclient.post(GROQ_ENDPOINT,headers=headers,json=payload)
returnr.json()
```

## **5.2. Microservicio de IA independiente** 

En línea con la arquitectura de microservicios adoptada para el proyecto, la lógica de interacción con los proveedores de IA se aísla en un servicio propio, es de decir que es independiente del servicio de scraping y de la API principal que sirve los datos filtrados. 

Si se llega a querer hasta permite intercambiar el proveedor activo (Groq, Gemini, o eventualmente otro compatible) sin afectar al resto del sistema y facilita implementar un mecanismo de conmutación por error (fallback): si el proveedor primario responde con un código HTTP 429 (límite de tasa excedido) o supera un tiempo de espera definido, el orquestador reintenta automáticamente contra el proveedor secundario(aunque lo veo complicado). 

## **5.3. Manejo diferenciado de tráfico síncrono y asíncrono** 

Las consultas del usuario (chat) se atienden de forma síncrona, priorizando la latencia mínima. En cambio, las tareas de análisis masivo derivadas del scraping (por ejemplo, clasificación o extracción de entidades sobre grandes volúmenes de productos) se derivan a un patrón asíncrono mediante colas de tareas (Celery/Redis), evitando que estas operaciones de fondo compitan por cuota de peticiones por minuto con las consultas en tiempo real del usuario. 

# **6. Formas de Optimización por Proveedor** 

Dado que ambos proveedores se utilizarán bajo su nivel gratuito durante la fase de pruebas, tambien pondré formas de optimización encontradas que podrían ser aplicadas para ambas partes 

5 

## **6.1. Optimización en GroqCloud** 

- **Selección de modelo por tarea:** usar un modelo liviano y de mayor cuota diaria (llama3.1-8b-instant) para la etapa de extracción de filtros, reservando un modelo de mayor calidad (llama-3.3-70b-versatile) únicamente para la etapa de explicación final, reduciendo el consumo total de tokens por minuto (TPM) (Grizzly Peak Software, 2026a). 

- **Prompt caching:** mantener estable el system prompt entre peticiones permite que Groq reutilice el prefijo cacheado, lo que reduce en un 50 % el costo de esos tokens y, adicionalmente, dichos tokens cacheados no se contabilizan contra el límite de peticiones por minuto (Groq, 2026a). 

- **Batch API:** para tareas no interactivas derivadas del scraping (por ejemplo, clasificar o etiquetar productos en lote), utilizar el Batch API de Groq, que ofrece un descuento del 50 % y una ventana de procesamiento de hasta 24 horas, evitando competir con el tráfico en tiempo real del chatbot (Groq, 2026b). 

- **Monitoreo de cabeceras de respuesta:** Groq expone las cabeceras x-ratelimit-remainingrequests y x-ratelimit-remaining-tokens en cada respuesta, lo que permite implementar un control proactivo de cuota (reducir frecuencia de peticiones antes de recibir un error 429) en lugar de un manejo puramente reactivo. 

## **6.2. Optimización en Google AI Studio (Gemini)** 

- **Selección de modelo por tarea:** emplear Gemini Flash-Lite para tareas simples y de alto volumen (extracción de filtros), y reservar Gemini Flash para la generación de la explicación final, que requiere mayor calidad conversacional (AI Prompt Generator Hub, 2026). 

- **Context caching:** Gemini permite cachear de forma implícita los prefijos estables de un prompt (como el system prompt o instrucciones repetidas), lo que puede reducir hasta en un 90 % el costo de los tokens de entrada repetidos y disminuir el consumo efectivo contra el límite de tokens por minuto (AI Free API, 2026). 

- **Uso de system instructions:** definir el contexto y las instrucciones del asistente mediante el parámetro de instrucciones de sistema, en lugar de repetirlas en cada mensaje del usuario, reduce el tamaño de cada petición individual (Harboratory Labs, 2026). 

- **Caché de respuestas en el backend:** para consultas que se repiten con frecuencia (por ejemplo, filtros comunes como "el más barato cerca"), almacenar la respuesta generada en el propio servidor evita una nueva llamada a la API y ahorra cuota, sin depender de las funciones de caché propias del proveedor. 

- **Monitoreo de cuota:** revisar periódicamente el uso a través de Google AI Studio o Google Cloud Console permite anticipar el momento en que el volumen de pruebas se acerque al límite diario de peticiones (Harboratory Labs, 2026). 

6 

# **7. Conclusión** 

De los seis proveedores de IA evaluados, GroqCloud y Google AI Studio fueron los únicos que satisficieron simultáneamente los criterios de accesibilidad económica, límites de tasa sostenibles para un ciclo de desarrollo iterativo, facilidad de implementación y compatibilidad técnica con la arquitectura del proyecto. OpenAI, Anthropic, Mistral AI y Cohere fueron descartados por restricciones específicas de cada proveedor —ya sea un límite de tasa demasiado bajo, la ausencia de un nivel gratuito sostenido en el tiempo, o una cuota mensual insuficiente para el volumen de pruebas planificado—, tal como se detalla en la Sección 2. La separación del módulo de IA como microservicio independiente, junto con las técnicas de optimización específicas de Groq y Gemini (selección de modelo por tarea, prompt/context caching y procesamiento por lotes para tareas no interactivas), permite extender el alcance práctico de ambos niveles gratuitos antes de que sea necesario evaluar una migración a un plan de pago. 

# **Referencias** 

AgentDeals. (2026.) _OpenAI Free Tier 2026: Limits, Pricing & What Changed._ `https://agentdea ls.dev/vendor/openai` 

AI Free API. (2026.) _Gemini API Context Caching: Complete Guide to Reducing Costs by Up to 90 %._ `https://www.aifreeapi.com/en/posts/gemini-api-context-caching-reduce-cost` 

AI Prompt Generator Hub. (2026.) _Gemini API Free Tier Rate Limits 2026: RPM, TPM & RPD by Model._ `https://aipromptshub.co/blog/gemini-api-free-tier-rate-limits` 

CloudZero. (2026.) _Gemini pricing in 2026: every model, every plan, and the thinking tokens nobody budgeted for._ `https://www.cloudzero.com/blog/gemini-pricing/` 

Cohere. (2026.) _Different Types of API Keys and Rate Limits._ `https://docs.cohere.com/docs/r ate-limits` 

Dmytro Klymentiev. (2026.) _Groq API Pricing & Free Tier Rate Limits 2026._ `https://klymenti ev.com/blog/groq-pricing` 

Groq. (2026a.) _Prompt Caching — GroqDocs._ `https://console.groq.com/docs/prompt-caching` 

Groq. (2026b.) _Batch API — GroqDocs._ `https://console.groq.com/docs/batch` 

Grizzly Peak Software. (2026a.) _Groq API Free Tier Limits in 2026: What You Actually Get._ `https: //www.grizzlypeaksoftware.com/articles/p/groq-api-free-tier-limits-in-2026-what-y ou-actually-get-uwysd6mb` 

Grizzly Peak Software. (2026b.) _Every AI API with a Free Tier in 2026: The Developer’s Cheat Sheet._ `https://www.grizzlypeaksoftware.com/articles/p/every-ai-api-with-a-free-tie r-in-2026-the-developers-cheat-sheet-jl33ach0` 

Grizzly Peak Software. (2026c.) _Mistral AI Pricing in 2026: Pro Costs, Free Tier Limits, and API Rates._ `https://www.grizzlypeaksoftware.com/articles/p/mistral-ai-pricing-in-2026-pro -costs-free-tier-limits-and-api-rates-lx4o2n2v` 

7 

Harboratory Labs. (2026.) _Gemini API Free Tier Limits in 2026, Explained._ `https://harborator y.com/gemini-api-free-tier-limits-in-2026-explained/` 

PocketLantern. (2026.) _Cohere Trial vs Production Keys: Rate-Limit Upgrade Need in 2026._ `https: //pocketlantern.dev/briefs/cohere-trial-vs-production-rate-limits-2026` 

Price Per Token. (2026.) _Mistral AI Free Tier 2026 — Free Models, Credits & Limits._ `https: //pricepertoken.com/endpoints/mistral/free` 

ScriptByAI. (2026.) _OpenAI API Rate Limits: RPM, TPM, Tiers, and 429 Errors (2026)._ `https: //www.scriptbyai.com/rate-limits-openai-api/` 

TokenMix Research Lab. (2026.) _Groq API Pricing 2026: Free Tier, 315 TPS, $0.05/M Paid Models._ `https://tokenmix.ai/blog/groq-api-pricing` 

8 

