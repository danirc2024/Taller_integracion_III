Informe T´ecnico: Investigaci´on de Herramientas de Grafos, Mapeo y Algoritmos de Optimizaci´on de Rutas 

## Daniela Romero 

# **1 Introducci´on** 

En el marco del proyecto para el Taller de Integraci´on III, se desarrolla una plataforma web desacoplada en microservicios orientada a resolver el problema del encarecimiento de la canasta b´asica familiar. La soluci´on integra web scraping automatizado de cat´alogos, normalizaci´on sem´antica de productos mediante IA Cloud y un motor de optimizaci´on log´ıstico-did´actico. 

El objetivo fundamental del microservicio de grafos y rutas es determinar el recorrido ´optimo que debe realizar un usuario para adquirir un conjunto de productos distribuidos en diferentes supermercados de la ciudad. El sistema analiza no solo el precio bruto de las mercader´ıas, sino tambi´en el costo real asociado al desplazamiento (combustible consumido o tarifa de transporte p´ublico) y el tiempo total invertido. 

El alcance del m´odulo est´a acotado por las restricciones operativas de la infraestructura base del proyecto: despliegue mediante contenedores Docker (proximamente a migrar en un cl´uster universitario) con recursos computacionales acotados (gesti´on v´ıa cgroups con un l´ımite estricto de 0.8 CPUs y 2 GB de RAM para este contenedor), costo nulo de licencias (prioridad open-source) e integraci´on nativa con el backend en Python (FastAPI). 

# **2 An´alisis y Comparaci´on de Herramientas de MaRutas pas y** 

## **2.1 OSRM (Open Source Routing Machine)** 

Motor de enrutamiento C++ de alto rendimiento dise˜nado para ejecutarse sobre datos geogr´aficos de OpenStreetMap (OSM). 

**Ventajas:** Extremadamente r´apido (consultas de matrices de distancia en milisegundos), ejecutable localmente mediante im´agenes de Docker, sin l´ımites de peticiones ni costos recurrentes. 

**Desventajas:** Requiere la preprocesaci´on de archivos de mapas (.osm.pbf) del territorio geogr´afico de inter´es. 

**Costo:** Completamente gratuito y Open Source. 

- **Facilidad de Integraci´on:** Alta mediante cliente HTTP en Python (httpx / re- 

- quests) consumiendo su API REST local (/table/v1/driving/). 

   - **Precisi´on:** Alta para redes viales urbanas actualizadas por la comunidad OSM. 

1 

**Recomendaci´on:** La mejor alternativa para el backend de producci´on desplegado en el cl´uster universitario. 

## **2.2 OSMnx + NetworkX** 

Librer´ıa de Python que permite descargar, modelar y analizar redes viales de OpenStreetMap directamente como grafos orientados de NetworkX. 

**Ventajas:** Integraci´on 100 % nativa con Python, alta flexibilidad para modificar pesos de las aristas (ej. aplicar penalizaciones por tr´afico o estado de v´ıas). 

**Desventajas:** Alto consumo de memoria RAM al cargar el grafo completo de una ciudad en memoria; tiempos de respuesta m´as lentos que OSRM en c´alculo de rutas complejas. 

**Costo:** Gratuito y Open Source. 

**Facilidad de Integraci´on:** Excelente (librer´ıa pura de Python). 

**Precisi´on:** Muy alta an´alisis topol´ogico y de geometr´ıa vial. 

**Recomendaci´on:** Ideal para entornos de desarrollo local, experimentaci´on de algoritmos y c´alculo de m´etricas complejas en la etapa de prototipado. 

## **2.3 Google Maps API (Distance Matrix & Directions API)** 

Servicio en la nube comercial con la mayor cobertura y precisi´on del mercado. 

- **Ventajas:** Informaci´on de tr´afico vehicular en tiempo real impecable y c´alculo exacto 

- de tiempos de viaje. 

- **Desventajas:** Modelo de pago por uso (Pay-as-you-go). Riesgo de sobrecostos no 

- planificados si el scraping o los usuarios aumentan las peticiones. 

- **Costo:** Cr´edito gratuito mensual limitado ($200 USD), posteriormente cobro por 

- cada 1.000 peticiones. 

   - **Facilidad de Integraci´on:** Muy alta v´ıa SDK oficial de Python (googlemaps). **Precisi´on:** M´axima nivel comercial. 

**Recomendaci´on:** No recomendada como motor primario por restricciones presupuestarias del proyecto universitario. 

## **2.4 GraphHopper** 

Motor de enrutamiento basado en Java que ofrece soporte para datos de OpenStreetMap. **Ventajas:** Gran flexibilidad en la personalizaci´on de perfiles de veh´ıculos y API de optimizaci´on VRP integrada. 

- **Desventajas:** La versi´on desplegable localmente requiere consumo moderado de re- 

- cursos JVM (RAM). 

   - **Costo:** Open Source en servidor local; API Cloud con capa gratuita muy acotada. **Facilidad de Integraci´on:** Alta mediante API REST JSON. **Precisi´on:** Alta. 

**Recomendaci´on:** Buena opci´on alternativa a OSRM si se requiriese resolver VRP avanzado en servidor propio. 

2 

## **2.5 Leaflet / Folium** 

Herramientas de renderizado cartogr´afico para interfaz de usuario. Folium permite generar mapas interactivos en HTML desde Python, mientras que Leaflet es la librer´ıa JavaScript est´andar para React/Next.js. 

**Ventajas:** Muy ligeras, no requieren API Keys de pago y consumen teselas (tiles) de OpenStreetMap. 

**Desventajas:** No ejecutan algoritmos de optimizaci´on ni c´alculo de rutas (solo visualizaci´on de capas geogr´aficas y trazados GeoJSON). 

- **Costo:** Gratuito y Open Source. 

**Facilidad de Integraci´on:** Nativa en el Frontend (Next.js). 

- **Recomendaci´on:** Est´andar obligatorio para la capa de presentaci´on/Frontend. 

## **2.6 Tabla Comparativa** 

|**Herramienta**|**Costo**|**Facilidad**<br>**(Python)**|**Precisi´on**|**Integraci´on**<br>**Backend**|**Escalabilidad**|
|---|---|---|---|---|---|
|OSRM<br>(Docker<br>Local)|Gratuito|Alta|Alta|Excelente<br>(REST)|Alta (Con-<br>tenedor)|
|OSMnx +|Gratuito|Muy Alta|Alta|Nativa|Media|
|NetworkX||||(Python)|(RAM)|
|Google Maps<br>API|Pago (Capa<br>limit.)|Muy Alta|Excelente|Excelente|Alta<br>(Cloud)|
|GraphHopper|Gratuito|Media-|Alta|Buena|Media-Alta|
|(Local)||Alta||(REST)||
|Mapbox|Pago (Capa|Alta|Muy Alta|Excelente|Alta|
|Matrix API|limit.)||||(Cloud)|



Table 1: Comparativa de herramientas de mapas y rutas 

# **3 An´alisis de Algoritmos de Optimizaci´on de Rutas** 

El problema de optimizar las compras en m´ultiples supermercados exige resolver dos niveles algor´ıtmicos: 

- **Ruta punto a punto:** Calcular la distancia y tiempo m´ınimo entre cada par de puntos (origen del usuario y supermercados). 

- **Secuenciaci´on de visitas (TSP/VRP):** Determinar el orden ´optimo de parada en los _N_ supermercados seleccionados para minimizar la funci´on de costo total. 

## **3.1 Evaluaci´on de Algoritmos** 

### **3.1.1 Dijkstra / A*** 

**Uso:** Empleados por los motores viales (como OSRM) para calcular la ruta m´as corta sobre el grafo vial entre dos coordenadas. _A_<sup>_∗_</sup> acelera la b´usqueda mediante heur´ısticas euclidianas. 

3 

**Limitaci´on:** Solo resuelven el trayecto entre 2 puntos (1 _→_ 1). No determinan el orden entre m´ultiples destinos. 

### **3.1.2 Problema del Viajante (TSP - Travelling Salesman Problem)** 

**Uso:** Dado un conjunto de nodos (Supermercados _S_ 1 _, S_ 2 _, . . . , SN_ ) y una matriz de distancias _Cij_ , encuentra el circuito de menor costo que visita cada nodo exactamente una vez. 

### **3.1.3 Vehicle Routing Problem (VRP)** 

**Uso:** Extensi´on del TSP con restricciones adicionales (tiempos de apertura de tiendas, capacidad del maletero del auto, m´ultiples veh´ıculos). 

### **3.1.4 Algoritmos Exactos vs. Heur´ısticas** 

Para _N ≤_ 10 supermercados (caso real donde un usuario raramente visitar´a m´as de 3 a 5 tiendas en un mismo viaje), la cantidad de permutaciones _N_ ! es sumamente reducida (ej. 5! = 120 combinaciones). Los algoritmos exactos basados en Programaci´on Din´amica (Held-Karp) o la suite Google OR-Tools resuelven la ruta globalmente ´optima en _<_ 5 ms. 

## **3.2 Algoritmo Recomendado** 

Se recomienda utilizar Google OR-Tools (M´odulo Routing) en Python impulsado por una Matriz de Distancias y Tiempos calculada v´ıa OSRM. 

### **Justificaci´on:** 

- **Tama˜no acotado del problema:** En la pr´actica, el n´umero de supermercados a visitar oscila entre _N_ = 2 y _N_ = 6. OR-Tools ejecuta solucionadores TSP exactos o de recocido simulado (Simulated Annealing) de forma instant´anea. 

- **Integraci´on:** OR-Tools es una librer´ıa madura de Python que toma como entrada directamente la matriz cuadrada devuelta por OSRM. 

# **4 Recomendaci´on Final** 

## **4.1 Stack Tecnol´ogico Recomendado** 

- **Servidor de Rutas:** OSRM (Open Source Routing Machine) alojado en un contenedor Docker con la extracci´on del mapa local preprocesado. Garantiza costo cero y respuestas ultrarr´apidas. 

- **Visualizaci´on Frontend:** Leaflet en la aplicaci´on web para pintar las capas de mapas de OpenStreetMap y la l´ınea de la ruta ´optima (GeoJSON). 

4 

# **Referencias** 

1. Luxen, D., & Vetter, C. (2011). Real-time routing with OpenStreetMap data. In _Proceedings of the 19th ACM SIGSPATIAL International Conference on Advances in Geographic Information Systems_ (pp. 513-516). 

2. Boeing, G. (2017). OSMnx: New met hods for acquiring, constructing, analyzing, and visualizing complex street networks. _Computers, Environment and Urban Systems_ , 65, 126-139. 

4. Project OSRM. (2024). Open Source Routing Machine API Documentation. http://projectosrm.org/docs/v5.5.1/api/ 

5 

