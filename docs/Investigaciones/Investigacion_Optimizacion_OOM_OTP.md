# Investigación: Optimización Extrema de Memoria (OOM) en OpenTripPlanner

## Contexto del Servidor Real
El servidor cuenta con 12GB de RAM totales y un procesador Intel Pentium. Según las políticas de `HARDWARE_Y_OPTIMIZACION.md`, el contenedor del **Motor de Rutas tiene un límite duro estricto de 2GB de RAM (Cgroups)**.

Si OpenTripPlanner (OTP) intenta usar más de 2GB, Docker matará el proceso inmediatamente (OOM Kill). Por lo tanto, las técnicas convencionales no sirven; se requiere optimización "a la fuerza bruta".

---

## Estrategias de Optimización Extrema (Para encajar en 2GB)

### 1. Stripping Agresivo del Mapa (Cirugía OSM)
No basta con recortar el mapa geográficamente a Temuco. Un archivo `.pbf` trae edificios, árboles, bancas y basureros, cosas que OTP procesará y guardará en RAM inútilmente.
Se debe usar `osmium tags-filter` para **arrancar** toda la metadata excepto las calles (`highway`).

```bash
# 1. Recortar solo Temuco
osmium extract -b -72.7,-38.8,-72.5,-38.7 chile-latest.osm.pbf -o temuco-raw.osm.pbf
# 2. Destruir todo lo que no sea una calle/carretera
osmium tags-filter temuco-raw.osm.pbf w/highway -o temuco-calles-solo.osm.pbf
```
*Impacto: Reduce el tamaño del grafo en memoria hasta en un 80%.*

### 2. Mutilar Funciones de OTP (`router-config.json`)
OTP viene configurado para ser un planificador de transporte público multimodal. Si el proyecto **solo necesita rutas en auto o a pie hacia los supermercados**, hay que apagar lo demás a la fuerza:

- **No cargar GTFS:** No incluir archivos `.zip` de horarios de buses. Los horarios de transporte masivo multiplican el uso de RAM masivamente.
- **Desactivar Elevación:** No cargar datos topográficos (archivos TIFF). Caminar en plano consume menos RAM.
- **Desactivar Isoíscronas:** Apagar la generación de polígonos de tiempo de viaje.

### 3. Ajuste de JVM para Pobreza de RAM (`SerialGC`)
Normalmente se recomienda el recolector de basura `G1GC` para servidores, pero este requiere RAM extra para administrar sus regiones. En un entorno de 2GB, el recolector más antiguo y simple consume menos overhead.

```yaml
# En docker-compose.yml
environment:
  # Límite de 1.5GB, usando recolector Serial para minimizar overhead de la JVM
  - JAVA_OPTS=-Xmx1500M -Xms1500M -XX:+UseSerialGC
```

### 4. Build Offline Obligatorio
Es físicamente imposible que OTP *construya* (`--build`) el grafo de rutas dentro del servidor Pentium con 2GB de RAM, incluso con los recortes. 
- **La regla:** El archivo binario `graph.obj` se debe compilar en el notebook de un desarrollador (con 8GB+ de RAM).
- Luego, ese archivo de 100-200MB se sube al servidor. 
- El contenedor de Docker del servidor **solo debe usar el comando `--load`**, el cual simplemente lee el mapa pre-masticado.

---

