Análisis Arquitectónico en Profundidad: Migración a Go (Golang) para Ecosistema de Microservicios en Entornos Restringidos 

Vicente Matus Daniela Romero Renato Carrasco Fabian Sánchez Esban Vejar 

Marcelo Matamala 

23 de agosto de 2026 

### **Resumen** 

A raíz de la reestructuración tecnológica del proyecto y la directriz académica de prescindir de frameworks como FastAPI, el presente documento técnico realiza una evaluación exhaustiva sobre la adopción de **Go (Golang)** como pilar para el backend del comparador de supermercados. El análisis profundiza empíricamente en las ventajas termodinámicas y computacionales que Go aporta al servidor físico anfitrión (procesador Intel Pentium, 12GB de RAM), detallando el impacto en la latencia del web scraping masivo, el tama˜no de los contenedores Docker y la ejecución de la algoritmia espacial de enrutamiento. 

# **Índice** 

|**1. Introducción: El Paradigma de Go en la Nube**|**2**|
|---|---|
|**2. Análisis de Ventajas y Eficiencia en el Hardware**|**2**|
|2.1. Eficiencia Energética y Consumo de RAM en el Servidor Pentium . . .|.<br>2|
|2.2. El Problema del Web Scraping Masivo: Goroutines vs GIL . . . . . . .|.<br>2|
|2.3. Velocidad Algorítmica (CPU Bound) para Optimización de Rutas . . .|.<br>3|
|**3. Efectos sobre la Arquitectura Docker y NO-IP**<br>|**3**<br>|
|3.1. Construcción Multi-Etapa (Multi-stage Builds) . . . . . . . . . . . . . .|.<br>3|
|**4. Desventajas y Retos de Transición**|**3**|
|4.1. Ausencia del Ecosistema Nativo de Data Science e IA . . . . . . . . . . <br>4.2. Verbosidad y Control Explícito de Errores<br>. . . . . . . . . . . . . . . .|.<br>3<br> .<br>4|
|**5. Conclusiones: Viabilidad Definitiva**|**4**|



1 

# **1. Introducción: El Paradigma de Go en la Nube** 

Desarrollado en los laboratorios de Google, Go nació con un objetivo pragmático: resolver los problemas de escalabilidad masiva en servidores multinúcleo y redes concurrentes. A diferencia de lenguajes interpretados (Python, Ruby) o lenguajes que dependen de pesadas máquinas virtuales (Java/JVM), Go es un lenguaje compilado de tipado estático que genera binarios ejecutables nativos, autónomos y de altísimo rendimiento. 

Su filosofía subyacente lo posiciona no solo como una alternativa a FastAPI, sino como un cambio de paradigma total para la orquestación. Gran parte de las herramientas modernas de infraestructura ( _Docker, Kubernetes, Prometheus, Terraform_ ) están escritas nativamente en Go debido a su imbatible relación entre consumo de recursos y paralelismo. 

# **2. Análisis de Ventajas y Eficiencia en el Hardware 2.1. Eficiencia Energética y Consumo de RAM en el Servidor Pentium** 

El proyecto se aloja sobre un equipo Lenovo IdeaPad con un procesador dual-core de gama baja (Pentium) y recursos compartidos. Ejecutar una red de microservicios en Python implica inicializar el intérprete en cada contenedor, acarreando una penalización base ( _overhead_ ) de al menos 100-200 MB de RAM y fluctuaciones térmicas ( _Thermal Throttling_ ) durante el pre-calentamiento. 

Al migrar a Go, el impacto sobre el servidor se minimiza drásticamente: 

- **Huella de Memoria (Memory Footprint):** Un _API Gateway_ escrito en Go, en estado de reposo, suele estabilizarse entre 10MB y 15MB de RAM. Esto permite que el servidor Lenovo mantenga un porcentaje altísimo de memoria libre para el sistema operativo o para un sistema de caché en memoria (ej. Redis). 

- **Tiempo de Arranque (Cold Start):** Dado que Go ejecuta código máquina directamente y sin dependencias externas, los contenedores arrancan en milisegundos. Si un microservicio falla, el orquestador de Docker puede reiniciarlo instantáneamente sin que el usuario final perciba la interrupción. 

## **2.2. El Problema del Web Scraping Masivo: Goroutines vs GIL** 

El corazón de la plataforma requiere descargar y analizar (escrapear) cientos de páginas web de supermercados (ej. Jumbo, Lider) frecuentemente para mantener los precios al día. 

**El problema en Python:** El raspado web es intensivo en red ( _I/O Bound_ ). En Python, implementar concurrencia real se ve obstaculizado por el _Global Interpreter Lock_ (GIL). Lanzar hilos tradicionales del sistema operativo (OS Threads) consume de 1MB a 2MB por hilo; lanzar 1.000 hilos saturaría la memoria del portátil. 

**La solución en Go:** Go implementa _Goroutines_ , hilos virtuales gestionados por el _runtime_ del propio lenguaje que pesan aproximadamente **2KB** . El servidor Pentium podrá despachar decenas de miles de peticiones HTTP concurrentes hacia las APIs de los 

2 

supermercados. El planificador interno ( _scheduler_ ) de Go multiplexa estas goroutines sobre los únicos dos núcleos físicos del procesador con una eficiencia asombrosa, extrayendo el 100 % del ancho de banda de red sin colapsar la CPU. 

## **2.3. Velocidad Algorítmica (CPU Bound) para Optimización de Rutas** 

La aplicación promete calcular si el ahorro justifica el costo del desplazamiento físico (”bencina”), utilizando algoritmos de optimización de rutas espaciales (como Dijkstra o A* adaptados). Estas operaciones matemáticas sobre grafos cartográficos son altamente intensivas para la CPU. Mientras que lenguajes dinámicos tardan sustancialmente en evaluar tipos y procesar bucles matriciales, Go se ejecuta casi a la velocidad de C o C++. El motor de rutas en Go resolverá los cálculos en fracciones de milisegundo, previniendo que peticiones complejas encolen y saturen el servidor principal. 

# **3. Efectos sobre la Arquitectura Docker y NO-IP** 

## **3.1. Construcción Multi-Etapa (Multi-stage Builds)** 

Adoptar Go revoluciona el almacenamiento y distribución de la plataforma. A través del uso de _Docker multi-stage builds_ , el código de Go se compila en un contenedor y el binario resultante se inyecta en una imagen vacía (ej. `scratch` o `alpine` ). 

El resultado es un contenedor final que contiene única y exclusivamente un archivo binario de _∼_ 15MB. Frente a imágenes de Python que superan los 400MB, el despliegue del proyecto hacia otros entornos será inmediato. Además, dado que la aplicación está expuesta por **NO-IP** (sin protección de una CDN como Cloudflare), tener binarios ultra reducidos reduce enormemente la superficie de ataque y vulnerabilidades (menor cantidad de librerías del sistema operativo que puedan ser explotadas). 

# **4. Desventajas y Retos de Transición** 

A pesar de sus formidables ventajas en infraestructura, Go presenta compromisos que el equipo deberá asumir: 

## **4.1. Ausencia del Ecosistema Nativo de Data Science e IA** 

Si el objetivo del proyecto fuera entrenar Modelos de Lenguaje, crear redes neuronales locales o limpiar matrices de datos (DataFrames), descartar Python (y librerías como Pandas, Scikit-learn o PyTorch) sería un error fatal. **Justificación Arquitectónica:** Este riesgo queda completamente anulado porque el proyecto utiliza una Arquitectura de Microservicios; la Inteligencia Artificial (Normalización de nombres de productos) se externaliza a APIs Cloud de terceros (ej. OpenAI REST API). Go es excepcional consumiendo servicios REST, por lo que la carencia de librerías matemáticas locales no impacta la viabilidad. 

3 

## **4.2. Verbosidad y Control Explícito de Errores** 

Go no utiliza bloques `try/catch` para el manejo de excepciones. Cada error debe capturarse y evaluarse explícitamente ( `if err != nil` ). Asimismo, su tipado es extremadamente estricto, lo que requiere declarar _Structs_ para cada respuesta JSON de las APIs de los supermercados. **Impacto:** El equipo experimentará un ciclo de desarrollo ligeramente más lento y verboso inicialmente. Sin embargo, en el contexto de microservicios, esta ”desventaja”se convierte en una bendición: el código resultante es inmensamente más seguro, predecible y libre de fallos en tiempo de ejecución. 

# **5. Conclusiones: Viabilidad Definitiva** 

La imposición de migrar el backend hacia un lenguaje más robusto como Go, lejos de ser un obstáculo académico, representa el camino idóneo para materializar la plataforma de supermercados. 

El servidor Lenovo IdeaPad 320 carece de los ciclos de CPU e hilos lógicos para soportar el abuso del web scraping masivo y algoritmos de ruteo bajo entornos interpretados. Go soluciona los cuellos de botella termodinámicos de manera inherente mediante sus _Goroutines_ , comprime radicalmente la infraestructura Docker y garantiza que el _API Gateway_ expuesto a través de NO-IP sea capaz de manejar altos volúmenes de tráfico concurrente con una estabilidad de grado empresarial. En definitiva, Go alinea perfectamente las ambiciones de software con las restricciones del hardware del proyecto. 

4 

