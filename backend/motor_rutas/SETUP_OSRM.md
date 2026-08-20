# Configuración OSRM para Temuco/Araucanía

Este documento explica cómo configurar y ejecutar OSRM (Open Source Routing Machine) para la optimización de rutas en Temuco y la región de Araucanía.

## Requisitos Previos

- **Docker** instalado y corriendo
- **Docker Compose** (incluido en Docker Desktop)
- **~2-3 GB de espacio libre** en disco (temporal durante procesamiento)
- **Conexión a Internet** para descargar datos OSM
- **Permisos de ejecución** en el directorio `backend/motor_rutas`

## Instalación Rápida (3 Pasos)

### Paso 1: Ejecutar el Script de Setup

#### **En Linux/Mac:**
```bash
cd backend/motor_rutas
chmod +x setup_mapa.sh
bash setup_mapa.sh
```

#### **En Windows - PowerShell (RECOMENDADO):**
```powershell
cd backend\motor_rutas
.\setup_mapa.ps1
```

**Si obtienes error de permisos en PowerShell:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Luego ejecuta nuevamente:
```powershell
.\setup_mapa.ps1
```

#### **En Windows - Git Bash (SI funciona con Docker):**
```bash
cd backend/motor_rutas
bash setup_mapa.sh
```

**Nota:** Si Git Bash falla con error `docker: error during connect`, usa PowerShell en su lugar.

---

Este script:

1. Crea el directorio `/data`
2. Descarga datos OpenStreetMap de Chile (~300-500 MB)
3. Extrae características del mapa con `osrm-extract`
4. Contrata el grafo con `osrm-contract` (~10-30 min)
5.  Genera los archivos `.osrm` necesarios

**Ejemplo de salida:**

```
=== Configuración de OSRM para Temuco/Araucanía ===

1. Creando directorio de datos...
✓ Directorio creado en: .../backend/motor_rutas/data

2. Descargando datos OSM de Chile (Geofabrik)...
   URL: http://download.geofabrik.de/south-america/chile-latest.osm.pbf
   Esto puede tomar algunos minutos (~300-500 MB)...
100%[======================================>] 420M  1.5MB/s    in 5m 12s
✓ Archivo descargado: 420M

...

✓ ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!
```

### Paso 2: Levantar los Contenedores

Desde el raíz del proyecto:

```bash
docker compose up -d
```

Verifica que OSRM esté corriendo:

```bash
docker ps | grep osrm
```

Deberías ver algo como:

```
CONTAINER ID   IMAGE                        STATUS          PORTS
abc123def456   osrm/osrm-backend:latest    Up 2 minutes    0.0.0.0:5000->5000/tcp
```

### Paso 3: Verificar que Funciona

Prueba una ruta de ejemplo en Temuco:

```bash
# Consulta OSRM (ruta de ejemplo entre dos puntos en Temuco)
curl "http://localhost:5000/route/v1/driving/-72.5898,-38.7369;-72.6004,-38.7456?overview=full"
```

Respuesta esperada:

```json
{
  "code": "Ok",
  "routes": [
    {
      "distance": 2143.5,
      "duration": 167.4,
      "geometry": "..."
    }
  ]
}
```

## Coordenadas de Referencia (Temuco)

Para probar rutas, puedes usar estas coordenadas de Temuco:

| Lugar             | Lat/Lon            |
| ----------------- | ------------------ |
| Centro Temuco     | -38.7369, -72.5898 |
| Costanera         | -38.7456, -72.6004 |
| Mall Paseo Temuco | -38.7498, -72.5823 |
| Terminal de Buses | -38.7489, -72.6020 |
| Mercado Central   | -38.7414, -72.6024 |

## 🔧 Solución de Problemas

### Error: "No space left on device"

El procesamiento temporal requiere ~2-3 GB. Libera espacio y reinicia.

### Error: "docker: command not found"

Docker no está instalado. Instala [Docker Desktop](https://www.docker.com/products/docker-desktop).

### Error en Windows Git Bash: "docker: error during connect"

**Causa:** Git Bash no puede acceder al socket de Docker Desktop en Windows.

**Solución:** Usa PowerShell en su lugar:

```powershell
cd backend\motor_rutas
.\setup_mapa.ps1
```

Si obtienes error de permisos:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup_mapa.ps1
```

### Error en PowerShell: "cannot be loaded because running scripts is disabled"

**Solución:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Luego intenta nuevamente:
```powershell
.\setup_mapa.ps1
```

### Error en PowerShell: "Token '}' inesperado"

Asegúrate de tener la versión correcta del script `setup_mapa.ps1`. Descárgalo nuevamente o verifica que no tenga caracteres extraños.

### El contenedor OSRM no inicia

Verifica que `data/mapa.osrm*` exista:

```bash
ls -la backend/motor_rutas/data/
```

Deberías ver:

```
-rw-r--r--  mapa.osrm
-rw-r--r--  mapa.osrm.mld
```

Si faltan, ejecuta nuevamente `setup_mapa.sh`.

### Lentitud en el procesamiento (>30 min)

Es normal en CPUs antiguas. OSRM necesita procesar ~300 mil km² de vías. Paciencia.

## 📡 API OSRM Disponible

Desde cualquier servicio Docker o tu máquina local:

### Endpoint: Route

```
GET /route/v1/driving/{lon1},{lat1};{lon2},{lat2}
```

**Ejemplo:**

```bash
curl "http://localhost:5000/route/v1/driving/-72.5898,-38.7369;-72.6004,-38.7456?steps=true&geometries=geojson"
```

### Endpoint: Table (Matriz de Distancias)

```
GET /table/v1/driving/{lon1},{lat1};{lon2},{lat2};...
```

**Ejemplo:**

```bash
curl "http://localhost:5000/table/v1/driving/-72.5898,-38.7369;-72.6004,-38.7456;-72.5823,-38.7498"
```

## 📚 Documentación Adicional

- [OSRM API Documentation](http://project-osrm.org/docs/v5.24.0/api-docs/)
- [OpenStreetMap Wiki](https://wiki.openstreetmap.org/)
- [Geofabrik Downloads](http://download.geofabrik.de/)
