# Investigación: Optimización Extrema de Memoria (OOM) en OpenTripPlanner y Ecosistema de Microservicios

## Contexto del Servidor Real y Arquitectura Global
El servidor de despliegue cuenta con 12GB de RAM totales y un procesador de arquitectura básica (Intel Pentium). De acuerdo con las políticas de orquestación definidas en `HARDWARE_Y_OPTIMIZACION.md`, la distribución de recursos a través de *Docker Cgroups* establece límites duros para aislar procesos.

El contenedor del **Motor de Rutas (OpenTripPlanner)** posee un límite estricto de **2GB de RAM**. Si OTP intenta exceder este umbral, el daemon de Docker invocará al OOM Killer, terminando el proceso inmediatamente. En paralelo, esta estricta contención de recursos tiene un propósito estratégico: liberar memoria para la integración de un nuevo microservicio vital, el **Bot de Discord (Scrum Master y Alertas)**, al cual se le han asignado **200MB** de RAM.

Por tanto, las técnicas convencionales de optimización de OTP no sirven; se requiere optimización "a la fuerza bruta" para garantizar que el ruteo no ahogue la infraestructura ni colisione con el bot de gestión.

---

## Estrategias de Optimización Extrema para OpenTripPlanner (Límite: 2GB)

### 1. Stripping Agresivo del Mapa (Cirugía OSM)
No basta con recortar el mapa geográficamente a Temuco. Un archivo `.pbf` trae edificios, árboles, bancas y basureros, elementos topológicos que OTP procesará y guardará en la estructura de grafos en RAM inútilmente.
Se debe ejecutar una operación de filtrado estricto mediante `osmium tags-filter` para depurar toda la metadata a excepción de las aristas transitables (`highway`).

```bash
# 1. Recortar solo la región de Temuco (Bounding Box)
osmium extract -b -72.7,-38.8,-72.5,-38.7 chile-latest.osm.pbf -o temuco-raw.osm.pbf
# 2. Filtrado de aristas vehiculares/peatonales
osmium tags-filter temuco-raw.osm.pbf w/highway -o temuco-calles-solo.osm.pbf
```
*Impacto:* Esta operación reduce el footprint de memoria del grafo espacial resultante en un aproximado de 80%.

### 2. Mutilar Funciones de OTP (`router-config.json`)
OTP viene configurado por defecto como un planificador de transporte público multimodal. Dado que el alcance del proyecto requiere rutas unimodales (auto o a pie hacia los supermercados), es mandatorio deshabilitar módulos periféricos:

- **Supresión de GTFS:** Omitir la ingesta de archivos `.zip` de horarios de buses. Los grafos temporales multiplican exponencialmente la complejidad espacial y el uso de RAM.
- **Desactivación de Elevación (DEM):** Ignorar datos topográficos Raster/TIFF.
- **Cancelación de Isoíscronas:** Deshabilitar la inferencia geométrica de polígonos de accesibilidad.

### 3. Tuning de la Máquina Virtual de Java (`SerialGC`)
En arquitecturas modernas, el recolector de basura `G1GC` es el estándar; sin embargo, éste requiere RAM pre-asignada (overhead) para la gestión de sus regiones lógicas. En un entorno de extrema pobreza de memoria (2GB), el algoritmo monohilo original consume sustancialmente menos memoria estructural.

```yaml
environment:
  # Límite duro de 1.5GB para JVM, dejando 500MB para el sistema de base
  - JAVA_OPTS=-Xmx1500M -Xms1500M -XX:+UseSerialGC
```

### 4. Build Offline Obligatorio (Segregación de Ciclo)
La compilación del grafo en memoria (`--build`) es una operación de orden `O(N log N)` en CPU y con saltos masivos de memoria. Es inviable en el Pentium.
- **La regla:** El archivo binario pre-computado (`graph.obj`) debe ser construido asíncronamente en una máquina de desarrollo y luego montado vía volumen en el servidor.
- El contenedor de producción ejecutará exclusivamente la bandera `--load`, evadiendo el pico de memoria inicial.

---

## Integración Segura del Bot de Discord (Límite: 200MB)

Al confinar a OTP en 2GB, aseguramos la viabilidad del **Bot de Discord**, un microservicio escrito en Go (`discordgo`) diseñado bajo una arquitectura orientada a eventos. Sus funciones operativas son:

1. **Monitoreo de Repositorio:** Notificaciones asíncronas sobre `git push` y apertura/cierre de Pull Requests vía Webhooks.
2. **Integración Linear:** Aviso automatizado sobre asignación y resolución de incidencias en el tablero de trabajo.
3. **Gatillador de Scraper Manual:** Exposición de botones de interacción de Discord para iniciar rutinas de recolección de precios web on-demand.

### Perfilado de Recursos del Bot
- **Concurrencia Ligera:** Al utilizar *Goroutines*, el bot gestiona la conexión persistente por WebSockets con el Gateway de Discord gastando apenas kilobytes por hilo de ejecución.
- **Asignación de Memoria:** Los 200MB otorgados son extremadamente holgados, garantizando que el bot no sufra caídas por presiones de memoria y no interfiera con el límite operativo del Motor de Rutas y la Base de Datos.
