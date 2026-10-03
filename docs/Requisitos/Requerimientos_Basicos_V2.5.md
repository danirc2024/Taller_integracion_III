Requisitos No Funcionales, Restricciones Técnicas y Criterios de Calidad Plataforma de Comparación y Logística de Supermercados 

Vicente Matus Daniela Romero Renato Carrasco Fabian Sánchez Esban Vejar 

Marcelo Matamala 

7 de septiembre de 2026 

#### **Resumen** 

Este documento define las bases arquitectónicas y operativas de la plataforma. Su propósito es establecer las limitaciones técnicas del entorno del proyecto y transformarlas en restricciones y requisitos formales. Se aplica una estricta separación metodológica entre la condición exigida al sistema (el ”qué”) y la decisión técnica de dise˜no (el ¸cómo”). 

# **Índice** 

|**1. Restricciones Técnicas (RT)**|**2**|
|---|---|
|**2. Requisitos No Funcionales (RNF)**|**2**|
|2.1. Web Scraping y Actualización de Información<br>. . . . . . . . . .|. . . . .<br>2|
|2.2. Inteligencia Artificial y Servicios Externos<br>. . . . . . . . . . . .|. . . . .<br>3|
|2.3. Mapas, Rutas e Información Geográfica . . . . . . . . . . . . . .|. . . . .<br>3|
|2.4. Comparación de Precios y Visualización al Usuario<br>. . . . . . .|. . . . .<br>4|
|2.5. Seguridad y Comunicaciones . . . . . . . . . . . . . . . . . . . .|. . . . .<br>4|
|**3. Criterios de Calidad**|**4**|



1 

# **1. Restricciones Técnicas (RT)** 

Las Restricciones Técnicas explican _qué situación nos obliga a tomar ciertas decisiones de dise˜no_ , enfocándose en el problema y no en la herramienta. Las decisiones tecnológicas exactas se documentarán en la fase de Dise˜no Arquitectónico. 

### **RT-01: Hardware Disponible.** 

- _Restricción:_ El sistema está obligado a funcionar correctamente dentro de los recursos de un computador personal básico (CPU dual-core, 12GB RAM). _Motivación:_ Carencia de presupuesto para servidores en la nube, lo que obliga a que el software sea extremadamente eficiente con la memoria y el procesamiento. 

### **RT-02: Portabilidad y Aislamiento.** 

- _Restricción:_ El sistema debe estar completamente desacoplado del sistema operativo anfitrión. 

_Motivación:_ Necesitamos que cualquier profesor o miembro del equipo pueda descargar y ejecutar el proyecto en Windows, Mac o Linux sin enfrentar errores de configuración o instalación de dependencias manuales. 

### **RT-03: Tecnologías de Bajo Consumo.** 

- _Restricción:_ Los servicios centrales de enrutamiento y procesamiento deben utilizar tecnologías de muy bajo consumo de memoria (evitando entornos interpretados pesados). 

_Motivación:_ Como consecuencia de la RT-01, si el núcleo del sistema consume mucha RAM en estado de reposo, el computador anfitrión se quedará sin memoria para procesar la base de datos o las peticiones de los usuarios. 

### **RT-04: Acceso Externo Limitado.** 

_Restricción:_ El sistema debe ser expuesto a internet utilizando redes residenciales y servicios gratuitos de direccionamiento. 

_Motivación:_ La falta de infraestructura perimetral (como IP estáticas corporativas o dominios de pago) restringe las opciones a soluciones de DNS dinámico. 

### **RT-05: Restricción de Cómputo de IA Local.** 

- _Restricción:_ El procesamiento de modelos de lenguaje pesado debe delegarse a servicios externos durante el flujo de uso normal. 

_Motivación:_ El procesador local no posee la capacidad de cómputo necesaria para normalizar datos semánticos y atender tráfico web al mismo tiempo sin colapsar. 

# **2. Requisitos No Funcionales (RNF)** 

Esta sección detalla las condiciones que debe cumplir el sistema, limitándose a una sola condición por requisito y separando explícitamente la estrategia de implementación posterior, evitando mencionar tecnologías específicas cuando no sea estrictamente necesario. 

## **2.1. Web Scraping y Actualización de Información** 

- **RNF-01 (Extracción Concurrente):** 

- **Condición:** El sistema deberá realizar la extracción de datos de manera concu- 

2 

rrente, evitando que el proceso de obtención de información bloquee las demás operaciones del sistema. 

_Estrategia de implementación:_ Aislamiento del proceso en hilos de ejecución o rutinas ligeras asíncronas. 

### **RNF-02 (Integridad de la Información):** 

- **Condición:** El sistema deberá asegurar que, frente a caídas temporales de la página del supermercado o cortes de red, los precios antiguos no se eliminen hasta que la nueva información esté completamente verificada. 

_Estrategia de implementación:_ Uso de transacciones atómicas en la base de datos. 

### **RNF-03 (Frecuencia de Actualización):** 

- **Condición:** El sistema deberá realizar actualizaciones masivas de disponibilidad de productos y precios en horarios de baja demanda (ej. madrugada) sin requerir tiempos de inactividad de la plataforma web. 

_Estrategia de implementación:_ Procesos de ejecución automatizada en segundo plano (Workers/Cron jobs). 

### **RNF-04 (Incorporación de Fuentes):** 

- **Condición:** El sistema deberá permitir incorporar nuevos supermercados sin afectar el funcionamiento de los supermercados ya integrados. 

- _Estrategia de implementación:_ Dise˜no de software basado en el patrón Adaptador o interfaces comunes ( _Strategy_ ). 

## **2.2. Inteligencia Artificial y Servicios Externos** 

### **RNF-05 (Delimitación de Acción de la IA):** 

- **Condición:** La IA se limitará exclusivamente a la normalización semántica de nombres de productos. El sistema deberá impedir que la IA modifique, infiera o altere los precios numéricos y la disponibilidad. 

- _Estrategia de implementación:_ Validaciones de esquema de datos estricto que descarten cualquier valor numérico proveniente del modelo de lenguaje. 

### **RNF-06 (Resiliencia de Servicios Externos):** 

- **Condición:** El sistema deberá recuperarse automáticamente sin interrupción general si los servicios externos de IA o de mapas rechazan peticiones temporalmente. _Estrategia de implementación:_ Patrón de reintentos con retraso progresivo ( _Exponential Backoff_ ). 

## **2.3. Mapas, Rutas e Información Geográfica** 

### **RNF-07 (Cálculo Realista de Desplazamiento):** 

- **Condición:** El sistema deberá calcular el costo de desplazamiento basándose en el trazado de calles reales, tiempos de viaje y el medio de transporte seleccionado por el usuario, evitando cálculos irreales basados en distancias geográficas de línea recta. 

_Estrategia de implementación:_ Integración con servicios de enrutamiento cartográfico multimodal. 

3 

### **RNF-08 (Privacidad Geográfica):** 

- **Condición:** El sistema deberá asegurar que la ubicación exacta del usuario no se guarde de forma persistente en los registros históricos del servidor tras calcular su ruta. 

_Estrategia de implementación:_ Procesamiento de coordenadas de ubicación exclusivamente en memoria volátil (RAM) durante la sesión. 

## **2.4. Comparación de Precios y Visualización al Usuario** 

### **RNF-09 (Agrupación Visual de Precios):** 

- **Condición:** El sistema deberá presentar los resultados agrupando el mismo producto físico de distintos supermercados en una única vista comparativa. _Estrategia de implementación:_ Filtrado y consolidación en el lado del cliente apoyado por identificadores únicos normalizados. 

### **RNF-10 (Retroalimentación Visual Asíncrona):** 

**Condición:** El sistema deberá proporcionar retroalimentación visual inmediata al usuario cuando se realicen cálculos prolongados (como el cruce de distancias), evitando que parezca congelado. 

- _Estrategia de implementación:_ Uso de indicadores visuales de carga asíncrona en la interfaz. 

## **2.5. Seguridad y Comunicaciones** 

- **RNF-11 (Protección de Comunicaciones):** 

- **Condición:** El sistema deberá cifrar toda transmisión de datos entre el cliente y el servidor, especialmente para proteger el acceso a la ubicación del usuario. _Estrategia de implementación:_ Uso obligatorio de certificados de seguridad y protocolos de transferencia segura (SSL/TLS). 

### **RNF-12 (Protección de Autenticación y Acceso):** 

- **Condición:** El sistema deberá proteger los puntos de acceso críticos (como inicios de sesión o consultas masivas) contra intentos de automatización o ataques de fuerza bruta que busquen agotar los recursos del servidor local. 

- _Estrategia de implementación:_ Configuración de un limitador de frecuencia de peticiones ( _Rate Limiting_ ) y cifrado unidireccional de contrase˜nas. 

# **3. Criterios de Calidad** 

Estos criterios definen los atributos evaluables empíricamente durante la demostración y validación del proyecto. 

- **Usabilidad:** Facilidad e intuición con la que el usuario puede interpretar las comparaciones de precios, recomendaciones y decidir si el costo de desplazamiento compensa el ahorro. 

- **Rendimiento:** Tiempo de respuesta de las consultas de búsqueda, asegurando que los productos más solicitados se muestren de forma ágil sin demoras excesivas. 

4 

- **Seguridad:** Protección comprobable de la autenticación de usuarios y del cifrado de las comunicaciones sensibles (como los datos de geolocalización transmitidos al calcular las rutas). 

5 

