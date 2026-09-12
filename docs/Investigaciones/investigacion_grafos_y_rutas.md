Informe Técnico: Investigación de Herramientas de Grafos, Mapeo y Algoritmos de Optimización de Rutas 

Daniela Romero Renato Carrasco Vicente Matus Esban Vejar Fabian Sanchez Marcelo Matamala 

8 de septiembre, 2026 

# **1 Introducción** 

En el marco del proyecto para el Taller de Integración III, se desarrolla una plataforma web orientada a apoyar la toma de decisiones de compra entre diferentes supermercados. La solución integra información obtenida desde distintas fuentes, procesos de normalización y validación de productos, además de mecanismos de optimización que permiten considerar tanto el costo de los productos como el desplazamiento necesario para adquirirlos. 

El objetivo del módulo de rutas y grafos es determinar una alternativa de compra conveniente para un usuario que posee una lista de productos, considerando los establecimientos donde estos se encuentran disponibles y los costos asociados al desplazamiento entre ellos. 

El sistema debe permitir considerar diferentes medios de transporte, incluyendo transporte público, vehículo particular, bicicleta y desplazamiento a pie, siempre que estos se encuentren contemplados dentro del alcance funcional del proyecto. 

Debido a que el proyecto debe soportar transporte público, se modificó la propuesta tecnológica inicial basada en OSRM. La solución actual considera principalmente la integración de **OpenTripPlanner (OTP)** , datos **GTFS de la DTPR para Temuco** , **OpenStreetMap (OSM)** y **Google OR-Tools** . 

Esta arquitectura permite separar claramente las responsabilidades: OTP se encarga de calcular los desplazamientos e itinerarios, mientras que OR-Tools se utiliza para optimizar la alternativa de compra considerando los costos obtenidos. 

# **2 Requisitos del cálculo de rutas** 

El módulo de rutas debe responder a las necesidades funcionales del proyecto y a sus reglas de negocio. Entre las principales condiciones se encuentran: 

1 

- El usuario debe poder definir su ubicación de origen. 

- El usuario debe poder seleccionar el medio de transporte que utilizará. 

- El sistema debe considerar los establecimientos donde se encuentran disponibles los productos de la lista de compra. 

- El sistema debe considerar el costo asociado al desplazamiento. 

- La solución debe ser compatible con transporte público. 

- El resultado debe poder representarse visualmente mediante un mapa. 

# **3 Análisis de Herramientas** 

## **3.1 OpenTripPlanner (OTP)** 

**OpenTripPlanner (OTP)** es una plataforma de código abierto orientada al cálculo de itinerarios de transporte y planificación de viajes. Su principal característica para este proyecto es la capacidad de combinar información geográfica proveniente de OpenStreetMap con información de transporte público proporcionada mediante formatos como GTFS. 

OTP permite calcular desplazamientos entre un origen y un destino considerando diferentes modos de transporte y combinaciones entre ellos. Esto resulta especialmente relevante para el proyecto, ya que un usuario puede necesitar caminar desde su ubicación hasta una parada, utilizar transporte público y posteriormente caminar desde la parada de destino hasta un supermercado. 

- **Ventajas:** 

- Soporte para transporte público mediante datos GTFS. 

- Integración con OpenStreetMap para la red vial y desplazamientos. 

- Permite calcular itinerarios multimodales. 

- Es de código abierto. 

- Puede ejecutarse localmente mediante contenedores. 

- Permite trabajar con información de paradas, recorridos y horarios. 

- Se adapta mejor que un motor exclusivamente vial a un proyecto que requiere transporte público. 

### **Desventajas:** 

- Requiere disponer de datos de transporte público adecuados y actualizados. 

- La configuración inicial puede ser más compleja que utilizar una API sencilla de rutas. 

- El cálculo de tarifas depende de la información disponible en las fuentes utilizadas. 

2 

## **3.2 GTFS de la DTPR** 

El sistema utilizará como fuente de información del transporte público el conjunto de datos **GTFS disponible para Temuco a través de la DTPR** . GTFS (General Transit Feed Specification) es un formato utilizado para representar información estructurada de sistemas de transporte público. 

Entre los datos que pueden ser proporcionados mediante GTFS se encuentran: 

- Paradas de transporte. 

- Rutas y recorridos. 

- Servicios y horarios. 

- Calendarios de operación. 

- Relaciones entre viajes, recorridos y paradas. 

Estos datos serán utilizados por OpenTripPlanner para construir la red de transporte público y calcular itinerarios. 

Es importante no asumir que el GTFS contiene necesariamente información tarifaria completa. La disponibilidad de tarifas deberá verificarse en el conjunto de datos concreto utilizado por el proyecto. En caso de que la tarifa no se encuentre disponible, deberá definirse una fuente adicional o un mecanismo de parametrización para determinar el costo del transporte público. 

### **Ventajas:** 

- Permite utilizar información real del transporte público de Temuco. 

- Es un estándar ampliamente utilizado para representar redes de transporte. 

- Puede ser procesado por OpenTripPlanner. 

- Permite obtener información estructurada de recorridos, paradas y horarios. 

**Desventajas:** 

- La calidad de los resultados depende de la actualización y completitud del feed. 

- No necesariamente contiene toda la información necesaria para calcular tarifas. 

## **3.3 OpenStreetMap (OSM)** 

**OpenStreetMap (OSM)** es una base de datos geográfica colaborativa que proporciona información sobre calles, caminos, ubicaciones y otros elementos geográficos. 

En la arquitectura propuesta, OpenStreetMap no será utilizado directamente como algoritmo de optimización. Su función será proporcionar información geográfica que pueda ser utilizada por OpenTripPlanner para construir la red vial y calcular desplazamientos. Esto permite representar, por ejemplo, el desplazamiento a pie entre: 

- La ubicación del usuario y una parada de transporte. 

- Una parada y un supermercado. 

3 

- Dos ubicaciones que puedan ser conectadas mediante la red vial. 

### **Ventajas:** 

- Datos abiertos. 

- Sin costo de licenciamiento para el uso de los datos bajo sus condiciones correspondientes. 

- Cobertura geográfica amplia. 

- Integración directa con OpenTripPlanner. 

### **Desventajas:** 

- La precisión depende de la calidad y actualización de los datos disponibles. 

- No proporciona por sí mismo información de horarios o recorridos del transporte público. 

## **3.4 Google OR-Tools** 

**Google OR-Tools** es una suite de optimización que permite resolver diferentes problemas de planificación y asignación. Dentro del proyecto será utilizada como componente de optimización y no como motor cartográfico. 

Su función será recibir información procesada sobre los establecimientos y los desplazamientos calculados por OpenTripPlanner, para determinar una alternativa de compra conveniente. 

Por ejemplo, para una lista de compra, el sistema puede determinar: 

- Qué productos están disponibles en cada establecimiento. 

- Qué establecimientos son candidatos para la compra. 

- Qué combinación de establecimientos permite cubrir la lista. 

- En qué orden conviene visitar los establecimientos. 

- Qué alternativa presenta un menor costo total bajo las restricciones definidas. 

OR-Tools puede utilizar matrices de costos y tiempos como entrada para los modelos de optimización. 

**Ventajas:** 

- Código abierto. 

- Integración disponible con Python. 

- Permite modelar problemas de rutas y optimización. 

- Permite incorporar restricciones al proceso de optimización. 

- Puede trabajar con matrices de distancias y tiempos obtenidas desde otros motores. 

4 

**Desventajas:** 

- No calcula por sí mismo los itinerarios de transporte público. 

- Requiere que la información de desplazamiento sea obtenida previamente mediante otro componente. 

- La formulación del problema debe dise˜narse de acuerdo con las reglas de negocio del proyecto. 

## **3.5 Leaflet** 

**Leaflet** es una biblioteca JavaScript para la creación de mapas interactivos en aplicaciones web. Su función dentro del proyecto será exclusivamente la visualización de los resultados calculados por el backend. 

Leaflet puede utilizarse para mostrar: 

- Ubicación del usuario. 

- Ubicación de los supermercados. 

- Paradas de transporte público. 

- Recorrido seleccionado. 

- Diferentes segmentos del trayecto. 

- Información asociada a cada establecimiento. 

Leaflet no realiza la optimización de rutas. El frontend recibirá desde el backend la información necesaria para representar el resultado. **Ventajas:** 

- Código abierto. 

- Ligero. 

- Integración sencilla con aplicaciones web. 

- Permite representar geometrías y recorridos. 

- Compatible con datos geográficos y trazados obtenidos desde el backend. 

A partir de la comparación, se selecciona **OpenTripPlanner + GTFS DTPR + OpenStreetMap + Google OR-Tools + Leaflet** como la combinación principal para el proyecto. 

La principal razón es que esta arquitectura permite cubrir el requisito de transporte público sin depender de un motor de ruteo exclusivamente vial. 

5 

# **4 Opciones de transporte para el usuario** 

El sistema debe permitir que el usuario seleccione el medio de transporte que utilizará para desplazarse. 

Entre las alternativas consideradas se encuentran: 

- **Transporte público:** el sistema utiliza la red de transporte definida mediante GTFS y procesada por OpenTripPlanner. 

- **Vehículo particular:** el desplazamiento puede considerar la distancia recorrida y los parámetros definidos por el usuario, como rendimiento del vehículo y costo del combustible, cuando estos sean requeridos por las reglas de negocio. 

- **Bicicleta:** se considera el desplazamiento mediante la red vial compatible con este medio. 

- **A pie:** se considera el desplazamiento peatonal entre las ubicaciones correspondientes. 

La disponibilidad exacta de cada medio debe mantenerse alineada con los requisitos funcionales y reglas de negocio definitivos del proyecto. 

La selección del medio de transporte es importante porque modifica tanto el tiempo estimado de desplazamiento como el costo asociado. Por ejemplo: 

_C_ transporte público = _C_ tarifa 

Mientras que para un vehículo particular puede utilizarse conceptualmente: 

_C_ vehículo =<sup>_D_</sup> _R_<sup>_× P_combustible</sup> 

donde: 

- _D_ corresponde a la distancia recorrida. 

- _R_ corresponde al rendimiento del vehículo. 

- _P_ combustible corresponde al precio del combustible. 

Para desplazamientos a pie o en bicicleta, el costo monetario directo del transporte puede considerarse cero. 

# **5 Integración de las herramientas** 

La arquitectura propuesta separa las responsabilidades de cálculo, optimización y visualización. 

El flujo general puede representarse de la siguiente manera: 

6 

```
OpenStreetMap
|
v
+-------------+
|OTP|
|OpenTrip|
|Planner|
+------+------+
^
|
GTFSDTPR
|
v
Informacióndedesplazamiento
(tiempo,distancia,itinerario,
segmentos,etc.)
|
v
+-------------+
|OR-Tools|
|Optimización|
+------+------+
|
v
Alternativadecompra
|
v
Backend/API
|
v
Frontend
|
v
Leaflet
|
v
Mapainteractivo
```

El proceso puede describirse mediante las siguientes etapas: 

## **5.1 Etapa 1: Definición del origen** 

El usuario define su ubicación de origen. Esta ubicación puede corresponder, por ejemplo, a una dirección proporcionada por el usuario o a una coordenada geográfica obtenida mediante los mecanismos contemplados en el sistema. 

## **5.2 Etapa 2: Selección del medio de transporte** 

El usuario selecciona el medio mediante el cual desea realizar el desplazamiento. 

7 

El sistema debe utilizar esta selección para determinar qué información debe considerar durante el cálculo. 

## **5.3 Etapa 3: Identificación de establecimientos** 

A partir de la lista de compra, el sistema identifica los establecimientos donde se encuentran disponibles los productos requeridos. 

En esta etapa se consideran los datos previamente obtenidos, normalizados y validados por el sistema. 

## **5.4 Etapa 4: Cálculo de desplazamientos mediante OTP** 

Para los establecimientos candidatos, el backend solicita a OpenTripPlanner información de desplazamiento. 

OTP utiliza: 

- OpenStreetMap para la información geográfica y vial. 

- GTFS DTPR para la información del transporte público. 

- El origen y destino proporcionados por el sistema. 

- El medio de transporte seleccionado. 

Como resultado se pueden obtener datos como: 

- Tiempo estimado. 

- Distancia. 

- Itinerario. 

- Paradas utilizadas. 

- Segmentos del recorrido. 

- Información de transporte público cuando corresponda. 

## **5.5 Etapa 5: Construcción de información para la optimización** 

El backend transforma los resultados obtenidos desde OTP en información que pueda ser utilizada por OR-Tools. 

Por ejemplo, se puede construir una matriz de costos donde cada _Cij_ representa el costo asociado al desplazamiento entre los puntos _i_ y _j_ . 

8 

## **5.6 Etapa 6: Optimización mediante OR-Tools** 

OR-Tools utiliza la información de establecimientos, productos y desplazamientos para determinar una alternativa conveniente. 

La optimización puede considerar: 

- Productos disponibles. 

- Precio de productos. 

- Descuentos. 

- Cantidad de establecimientos. 

- Costo de desplazamiento. 

- Orden de las visitas. 

- Restricciones establecidas por las reglas de negocio. 

La función conceptual de costo puede representarse como: 

min ( _C_ productos + _C_ transporte) 

sujeta a las restricciones definidas por el proyecto. 

Por esta razón, el problema no debe considerarse exclusivamente como un TSP tradicional, ya que además del orden de visita es necesario determinar qué establecimientos participan y qué productos serán adquiridos en cada uno. 

## **5.7 Etapa 7: Entrega del resultado al frontend** 

Una vez obtenida la alternativa, el backend entrega al frontend información estructurada sobre: 

- Establecimientos seleccionados. 

- Productos asignados a cada establecimiento. 

- Orden de visita. 

- Costo estimado de productos. 

- Descuentos considerados. 

- Costo estimado de transporte. 

- Costo total estimado. 

- Información necesaria para representar el recorrido. 

9 

## **5.8 Etapa 8: Visualización mediante Leaflet** 

- El frontend utiliza Leaflet para representar los resultados sobre un mapa. La interfaz puede mostrar: 

   - La ubicación inicial del usuario. 

   - Los supermercados seleccionados. 

   - El orden de visita. 

   - El trazado del recorrido. 

   - Las paradas de transporte público. 

   - Información resumida de cada establecimiento. 

   - El costo total estimado de la alternativa. 

Leaflet se limita a la presentación visual. La selección y optimización de la alternativa ya fue realizada por el backend. 

# **6 Ventajas de la arquitectura seleccionada** 

La utilización de OTP + GTFS + OpenStreetMap + OR-Tools presenta las siguientes ventajas para el proyecto: 

- **Soporte para transporte público:** permite incorporar la red real de transporte de Temuco mediante GTFS. 

- **Separación de responsabilidades:** el cálculo de desplazamientos y la optimización son realizados por componentes diferentes. 

- **Flexibilidad:** permite trabajar con diferentes medios de transporte. 

- **Uso de tecnologías Open Source:** reduce la dependencia de servicios comerciales y costos por uso. 

- **Integración con Python:** permite que el backend del proyecto coordine el cálculo y la optimización. 

- **Escalabilidad conceptual:** la incorporación de nuevas fuentes de transporte puede realizarse sin modificar la lógica principal de optimización. 

- **Representación visual:** Leaflet permite entregar al usuario un resultado comprensible mediante un mapa interactivo. 

10 

# **7 Recomendación Final** 

La arquitectura recomendada para el módulo de rutas y optimización es: 

- **OpenStreetMap:** fuente de información geográfica y vial. 

- **GTFS DTPR:** fuente de información del transporte público de Temuco. 

- **OpenTripPlanner (OTP):** motor principal para calcular itinerarios y desplazamientos. 

- **Google OR-Tools:** motor de optimización para determinar la alternativa de compra. 

- **Leaflet:** herramienta de visualización cartográfica en el frontend. 

Con esta arquitectura se evita depender de OSRM como motor independiente y se prioriza una solución capaz de incorporar transporte público de manera nativa mediante GTFS. 

Además, se mantiene una separación clara entre el cálculo de itinerarios y la optimización de la decisión de compra, permitiendo que el sistema considere diferentes medios de transporte y que la alternativa final sea determinada según el costo total y las restricciones establecidas por las reglas de negocio. 

# **Referencias** 

1. OpenTripPlanner. _OpenTripPlanner Documentation_ . Documentación oficial sobre fuentes de datos, modos de transporte y planificación de viajes. 

2. General Transit Feed Specification. _GTFS Reference_ . Especificación del formato utilizado para representar información de transporte público. 

3. Dirección de Transporte Público Regional (DTPR). _Datos GTFS del transporte público_ . Fuente de datos utilizada para representar el transporte público de Temuco. 

4. OpenStreetMap Foundation. _OpenStreetMap_ . Base de datos geográfica colaborativa utilizada como fuente de información vial. 

5. Google Developers. _OR-Tools: Vehicle Routing_ . Documentación oficial sobre optimización y problemas de rutas. 

6. Leaflet. _Leaflet Documentation_ . Documentación oficial de la biblioteca para mapas interactivos. 

7. Boeing, G. (2017). OSMnx: New methods for acquiring, constructing, analyzing, and visualizing complex street networks. _Computers, Environment and Urban Systems_ , 65, 126–139. 

11 

