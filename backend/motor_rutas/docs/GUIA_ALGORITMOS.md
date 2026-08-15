# Guía Técnica: Investigación de Algoritmos para Motor de Rutas

Al estar el proyecto en un "limbo" respecto a si crear algoritmos matemáticos en Python o consumir APIs externas, esta guía compara las opciones para destrabar el avance y explica cómo evaluarlas en vivo mediante el **Patrón Estrategia**.

## 1. La Arquitectura Actual (Patrón Estrategia)
Para que no tengas que detenerte hasta que haya una decisión unánime, te he construido el servicio con un **Patrón Estrategia** (`app/core/strategy.py`). 

Esto te permite crear múltiples algoritmos (ej: una clase para `OSMnx`, otra para `OSRM`, otra para `GoogleMaps`) que heredan de la misma base. A través del Endpoint `/api/v1/calculate-route` puedes enviar la variable `strategy_name` y el código ejecutará uno u otro al vuelo. Así puedes comparar tiempos de respuesta y precisión sin borrar ni reescribir tu código.

---

## 2. Caminos Posibles para el Trazado

### A. Enfoque Matemático Puro (OSMnx + NetworkX)
Consiste en procesar el grafo de calles en la memoria del servidor de Python.
- **Librerías:** `OSMnx` descarga la malla de OpenStreetMap. `NetworkX` procesa las matemáticas discretas.
- **Algoritmos Estándar:** **A*** (A-Star) o **Dijkstra** para encontrar la ruta más corta entre el nodo de origen y destino.
- **Ventajas:** Flexibilidad total. Puedes alterar los pesos del grafo manualmente (ej. si sabes que hay una calle cortada o tráfico).
- **Desventajas:** Alto consumo de memoria RAM. Cargar el grafo de toda una región metropolitana toma mucho tiempo y puede saturar el servidor, requiriendo persistencia (guardar el grafo localmente).

### B. Enfoque API Externa (OSRM / Mapbox / Google Maps)
Consiste en enviar las coordenadas (Lat, Lon) a un servicio de terceros.
- **OSRM (Open Source Routing Machine):** Un motor escrito en C++ rapidísimo. Tiene una API pública para pruebas gratuitas (`router.project-osrm.org`), o puedes montar su propia imagen de Docker si el profesor te exige que sea local.
- **Ventajas:** No consumes memoria en tu microservicio. Respuestas en milisegundos. Te retorna incluso el polígono dibujable (Polylines) y el tiempo exacto de conducción.
- **Desventajas:** Si usas la versión pública compartida, tienes límite de peticiones. Google Maps requiere tarjeta de crédito.

### C. Evolución al "Problema del Viajante" (TSP)
Si el usuario selecciona 3 supermercados distintos y el sistema debe encontrar el "Orden óptimo de visita", entonces A* o OSRM ya no bastan por sí solos.
Para esto debes:
1. Usar OSRM o A* repetidas veces para crear una "Matriz de Distancias" entre todos los puntos (A-B, A-C, B-C).
2. Usar un solucionador heurístico como **Google OR-Tools** (Routing Model) o un Algoritmo Genético para determinar cuál es el orden ideal.

---

## Recomendación para Avanzar Inmediatamente
1. Inicia completando el código de la estrategia `OSRMApiStrategy` (ya creado en `app/algorithms/osmnx_strategy.py`). Consume su API pública gratuita (`requests.get`). Es la vía más rápida para probar que tu FastAPI devuelve las rutas correctamente al Frontend.
2. Una vez que tengas eso conectado y funcionando "End-to-End", puedes dedicarte con calma a investigar cómo cargar un grafo de `OSMnx` y aplicar la matemática, usándolo como una "Mejora Evolutiva" del software en sprints posteriores.
