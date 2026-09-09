Informe Técnico: Investigación de Herramientas de Grafos, Mapeo y Algoritmos de Optimización de Rutas 

Daniela Romero 

# **1 Introducción** 

En el marco del proyecto para el Taller de Integración III, se desarrolla una plataforma web desacoplada en microservicios orientada a resolver el problema del encarecimiento de la canasta básica familiar. La solución integra web scraping automatizado de catálogos, normalización semántica de productos mediante IA Cloud y un motor de optimización logístico-didáctico. 

El objetivo fundamental del microservicio de grafos y rutas es determinar el recorrido óptimo que debe realizar un usuario para adquirir un conjunto de productos distribuidos en diferentes supermercados de la ciudad. El sistema analiza no solo el precio bruto de las mercaderías, sino también el costo real asociado al desplazamiento (combustible consumido o tarifa de transporte público) y el tiempo total invertido. 

El alcance del módulo está acotado por las restricciones operativas de la infraestructura base del proyecto: despliegue mediante contenedores Docker (proximamente a migrar en un clúster universitario) con recursos computacionales acotados (gestión vía cgroups con un límite estricto de 0.8 CPUs y 2 GB de RAM para este contenedor), costo nulo de licencias (prioridad open-source) e integración nativa con el backend en Python (FastAPI). 

# **2 Análisis y Comparación de Herramientas de Mapas y Rutas** 

## **2.1 OSRM (Open Source Routing Machine)** 

Motor de enrutamiento C++ de alto rendimiento dise˜nado para ejecutarse sobre datos geográficos de OpenStreetMap (OSM). 

**Ventajas:** Extremadamente rápido (consultas de matrices de distancia en milisegundos), ejecutable localmente mediante imágenes de Docker, sin límites de peticiones ni costos recurrentes. 

**Desventajas:** Requiere la preprocesación de archivos de mapas (.osm.pbf) del territorio geográfico de interés. 

**Costo:** Completamente gratuito y Open Source. 

**Facilidad de Integración:** Alta mediante cliente HTTP en Python (httpx / requests) consumiendo su API REST local (/table/v1/driving/). 

**Precisión:** Alta para redes viales urbanas actualizadas por la comunidad OSM. 

1 

**Recomendación:** La mejor alternativa para el backend de producción desplegado en el clúster universitario. 

## **2.2 OSMnx + NetworkX** 

Librería de Python que permite descargar, modelar y analizar redes viales de OpenStreetMap directamente como grafos orientados de NetworkX. 

**Ventajas:** Integración 100 % nativa con Python, alta flexibilidad para modificar pesos de las aristas (ej. aplicar penalizaciones por tráfico o estado de vías). 

**Desventajas:** Alto consumo de memoria RAM al cargar el grafo completo de una ciudad en memoria; tiempos de respuesta más lentos que OSRM en cálculo de rutas complejas. 

**Costo:** Gratuito y Open Source. 

**Facilidad de Integración:** Excelente (librería pura de Python). 

**Precisión:** Muy alta análisis topológico y de geometría vial. 

**Recomendación:** Ideal para entornos de desarrollo local, experimentación de algoritmos y cálculo de métricas complejas en la etapa de prototipado. 

## **2.3 Google Maps API (Distance Matrix & Directions API)** 

- Servicio en la nube comercial con la mayor cobertura y precisión del mercado. **Ventajas:** Información de tráfico vehicular en tiempo real impecable y cálculo exacto 

- de tiempos de viaje. 

**Desventajas:** Modelo de pago por uso (Pay-as-you-go). Riesgo de sobrecostos no planificados si el scraping o los usuarios aumentan las peticiones. 

**Costo:** Crédito gratuito mensual limitado ($200 USD), posteriormente cobro por cada 1.000 peticiones. 

**Facilidad de Integración:** Muy alta vía SDK oficial de Python (googlemaps). **Precisión:** Máxima nivel comercial. 

**Recomendación:** No recomendada como motor primario por restricciones presupuestarias del proyecto universitario. 

## **2.4 GraphHopper** 

Motor de enrutamiento basado en Java que ofrece soporte para datos de OpenStreetMap. **Ventajas:** Gran flexibilidad en la personalización de perfiles de vehículos y API de optimización VRP integrada. 

**Desventajas:** La versión desplegable localmente requiere consumo moderado de recursos JVM (RAM). 

**Costo:** Open Source en servidor local; API Cloud con capa gratuita muy acotada. **Facilidad de Integración:** Alta mediante API REST JSON. **Precisión:** Alta. 

**Recomendación:** Buena opción alternativa a OSRM si se requiriese resolver VRP avanzado en servidor propio. 

2 

## **2.5 Leaflet / Folium** 

Herramientas de renderizado cartográfico para interfaz de usuario. Folium permite generar mapas interactivos en HTML desde Python, mientras que Leaflet es la librería JavaScript estándar para React/Next.js. 

**Ventajas:** Muy ligeras, no requieren API Keys de pago y consumen teselas (tiles) de OpenStreetMap. 

**Desventajas:** No ejecutan algoritmos de optimización ni cálculo de rutas (solo visualización de capas geográficas y trazados GeoJSON). 

**Costo:** Gratuito y Open Source. 

**Facilidad de Integración:** Nativa en el Frontend (Next.js). 

**Recomendación:** Estándar obligatorio para la capa de presentación/Frontend. 

## **2.6 Tabla Comparativa** 

|**Herramienta**|**Costo**|**Facilidad**<br>**(Python)**|**Precisión**|**Integración**<br>**Backend**|**Escalabilidad**|
|---|---|---|---|---|---|
|OSRM<br>(Docker<br>Local)|Gratuito|Alta|Alta|Excelente<br>(REST)|Alta (Con-<br>tenedor)|
|OSMnx +|Gratuito|Muy Alta|Alta|Nativa|Media|
|NetworkX||||(Python)|(RAM)|
|Google Maps<br>API|Pago (Capa<br>limit.)|Muy Alta|Excelente|Excelente|Alta<br>(Cloud)|
|GraphHopper|Gratuito|Media-|Alta|Buena|Media-Alta|
|(Local)||Alta||(REST)||
|Mapbox<br>Matrix API|Pago (Capa<br>limit.)|Alta|Muy Alta|Excelente|Alta<br>(Cloud)|



Table 1: Comparativa de herramientas de mapas y rutas 

# **3 Análisis de Algoritmos de Optimización de Rutas** 

El problema de optimizar las compras en múltiples supermercados exige resolver dos niveles algorítmicos: 

- **Ruta punto a punto:** Calcular la distancia y tiempo mínimo entre cada par de puntos (origen del usuario y supermercados). 

- **Secuenciación de visitas (TSP/VRP):** Determinar el orden óptimo de parada en los _N_ supermercados seleccionados para minimizar la función de costo total. 

## **3.1 Evaluación de Algoritmos** 

### **3.1.1 Dijkstra / A*** 

**Uso:** Empleados por los motores viales (como OSRM) para calcular la ruta más corta sobre el grafo vial entre dos coordenadas. _A_<sup>_∗_</sup> acelera la búsqueda mediante heurísticas euclidianas. 

3 

**Limitación:** Solo resuelven el trayecto entre 2 puntos (1 _→_ 1). No determinan el orden entre múltiples destinos. 

### **3.1.2 Problema del Viajante (TSP - Travelling Salesman Problem)** 

**Uso:** Dado un conjunto de nodos (Supermercados _S_ 1 _, S_ 2 _, . . . , SN_ ) y una matriz de distancias _Cij_ , encuentra el circuito de menor costo que visita cada nodo exactamente una vez. 

### **3.1.3 Vehicle Routing Problem (VRP)** 

**Uso:** Extensión del TSP con restricciones adicionales (tiempos de apertura de tiendas, capacidad del maletero del auto, múltiples vehículos). 

### **3.1.4 Algoritmos Exactos vs. Heurísticas** 

Para _N ≤_ 10 supermercados (caso real donde un usuario raramente visitará más de 3 a 5 tiendas en un mismo viaje), la cantidad de permutaciones _N_ ! es sumamente reducida (ej. 5! = 120 combinaciones). Los algoritmos exactos basados en Programación Dinámica (Held-Karp) o la suite Google OR-Tools resuelven la ruta globalmente óptima en _<_ 5 ms. 

## **3.2 Algoritmo Recomendado** 

Se recomienda utilizar Google OR-Tools (Módulo Routing) en Python impulsado por una Matriz de Distancias y Tiempos calculada vía OSRM. 

### **Justificación:** 

- **Tama˜no acotado del problema:** En la práctica, el número de supermercados a visitar oscila entre _N_ = 2 y _N_ = 6. OR-Tools ejecuta solucionadores TSP exactos o de recocido simulado (Simulated Annealing) de forma instantánea. 

- **Integración:** OR-Tools es una librería madura de Python que toma como entrada directamente la matriz cuadrada devuelta por OSRM. 

# **4 Recomendación Final** 

## **4.1 Stack Tecnológico Recomendado** 

- **Servidor de Rutas:** OSRM (Open Source Routing Machine) alojado en un contenedor Docker con la extracción del mapa local preprocesado. Garantiza costo cero y respuestas ultrarrápidas. 

- **Visualización Frontend:** Leaflet en la aplicación web para pintar las capas de mapas de OpenStreetMap y la línea de la ruta óptima (GeoJSON). 

4 

# **Referencias** 

1. Luxen, D., & Vetter, C. (2011). Real-time routing with OpenStreetMap data. In _Proceedings of the 19th ACM SIGSPATIAL International Conference on Advances in Geographic Information Systems_ (pp. 513-516). 

2. Boeing, G. (2017). OSMnx: New met hods for acquiring, constructing, analyzing, and visualizing complex street networks. _Computers, Environment and Urban Systems_ , 65, 126-139. 

3. Google Developers. (2024). OR-Tools: Routing Suite for Python. https://developers.google.com/optimization/routing 4. Project OSRM. (2024). Open Source Routing Machine API Documentation. http://projectosrm.org/docs/v5.5.1/api/ 

5 

