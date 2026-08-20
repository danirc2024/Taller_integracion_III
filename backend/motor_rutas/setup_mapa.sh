#!/bin/bash
# setup_mapa.sh - Configuración de OSRM para Temuco (Araucanía)

set -e

echo "=== Configuración de OSRM para Temuco/Araucanía ==="

# Directorio de datos
DATA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/data"
mkdir -p "$DATA_DIR"
cd "$DATA_DIR"

# Descargar mapa de Araucanía (más pequeño que Chile completo)
OSM_URL="http://download.geofabrik.de/south-america/chile-latest.osm.pbf"
OSM_FILE="$DATA_DIR/chile.osm.pbf"

echo "1. Descargando mapa de Araucanía..."
if [ ! -f "$OSM_FILE" ]; then
    wget -q --show-progress "$OSM_URL" -O "$OSM_FILE"
else
    echo "   Archivo ya existe, omitiendo descarga."
fi

echo "2. Procesando con OSRM (Docker)..."
docker run --rm -v "$DATA_DIR:/data" osrm/osrm-backend:latest \
    osrm-extract -p /opt/car.lua /data/chile.osm.pbf

docker run --rm -v "$DATA_DIR:/data" osrm/osrm-backend:latest \
    osrm-contract /data/chile.osrm

echo "3. Limpiando archivo original..."
# El archivo chile.osm.pbf será usado, no se necesita renombrar
# Los archivos chile.osrm* se generarán correctamente
rm -f "$OSM_FILE"

echo "Listo! OSRM configurado en $DATA_DIR"
echo "   Archivos generados: chile.osrm*"
echo "   Para iniciar OSRM: docker compose up -d"