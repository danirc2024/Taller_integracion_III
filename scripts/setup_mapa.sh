#!/bin/bash
# Script para descargar y compilar un mapa local para OTP

# Si el usuario pasa coordenadas como argumentos, las usamos. 
# Si no, usamos Temuco (Chile) por defecto.
BBOX=${1:-"-38.8020,-72.7121,-38.6756,-72.4851"}
CIUDAD=${2:-"Temuco"}

DATA_DIR="backend/motor_rutas/data"
MAP_FILE="$DATA_DIR/mapa.osm"

mkdir -p $DATA_DIR

echo "=========================================================="
echo "🗺️  Preparando Motor Geográfico (OTP) para: $CIUDAD"
echo "=========================================================="
echo "Descargando geometría vial desde OpenStreetMap..."
echo "Bounding Box (Sur,Oeste,Norte,Este): $BBOX"
echo "Dependiendo del tamaño de la ciudad, esto puede tomar unos segundos..."

# Usamos Overpass API para descargar solo la caja que nos importa y no saturar el PC
curl -o $MAP_FILE "http://overpass-api.de/api/map?bbox=$BBOX"

if [ $? -ne 0 ] || [ ! -s $MAP_FILE ]; then
    echo "❌ Error descargando el mapa. Verifica las coordenadas o tu internet."
    exit 1
fi

echo "✅ Mapa XML descargado. Tamaño: $(du -sh $MAP_FILE | cut -f1)"
echo "⚙️  Compilando el grafo matemático en C++ usando OTP..."
echo "(Esto se hace en un contenedor temporal, no ensuciará tu PC local)"

# 1. Extracción (Crea el grafo desde el XML aplicando el perfil de 'auto')
docker run -t -v "${PWD}/$DATA_DIR:/data" otp/otp-backend otp-extract -p /opt/car.lua /data/mapa.osm

# 2. Partición (Prepara el grafo para MLD - Multi-Level Dijkstra)
docker run -t -v "${PWD}/$DATA_DIR:/data" otp/otp-backend otp-partition /data/mapa.otp

# 3. Customización (Calcula los pesos de ruta finales)
docker run -t -v "${PWD}/$DATA_DIR:/data" otp/otp-backend otp-customize /data/mapa.otp

echo "=========================================================="
echo "🚀 ¡Mapa compilado exitosamente!"
echo "Puedes iniciar tu red Docker normalmente: docker compose up -d"
echo "Si quieres otra ciudad, ejecuta: ./scripts/setup_mapa.sh 'sur,oeste,norte,este' 'NombreCiudad'"
echo "=========================================================="
