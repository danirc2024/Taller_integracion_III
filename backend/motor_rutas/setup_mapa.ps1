# Setup Script para OSRM - Descarga y Procesa Mapa de Araucania/Temuco
# PowerShell version para Windows

# Configuracion de colores
function Write-Yellow {
    Write-Host $args -ForegroundColor Yellow
}

function Write-Green {
    Write-Host $args -ForegroundColor Green
}

function Write-Red {
    Write-Host $args -ForegroundColor Red
}

function Stop-OnError {
    param([string]$Message)
    Write-Red "X $Message"
    exit 1
}

Write-Yellow "=== Configuracion de OSRM para Temuco/Araucania ==="
Write-Host ""

# Obtener directorio del script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataDir = Join-Path $ScriptDir "data"

# Paso 1: Crear directorio de datos
Write-Yellow "1. Creando directorio de datos..."
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
}
Write-Green "OK Directorio creado en: $DataDir"
Write-Host ""

# Variables de descarga
$OSM_URL = "http://download.geofabrik.de/south-america/chile-latest.osm.pbf"
$OSM_File = Join-Path $DataDir "chile.osm.pbf"

# Paso 2: Descargar datos
Write-Yellow "2. Descargando datos OSM de Chile (Geofabrik)..."
Write-Host "   URL: $OSM_URL"
Write-Host "   Esto puede tomar algunos minutos (~300-500 MB)..."
Write-Host ""

if (Test-Path $OSM_File) {
    Write-Green "OK Archivo ya existe, saltando descarga"
} else {
    try {
        Write-Host "   Descargando..." -NoNewline
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $OSM_URL -OutFile $OSM_File -UseBasicParsing
        $ProgressPreference = 'Continue'
        
        $FileSize = (Get-Item $OSM_File).Length / 1MB
        Write-Green "`r`nOK Archivo descargado: $([Math]::Round($FileSize, 2)) MB"
    } catch {
        Stop-OnError "Error descargando el archivo: $_"
    }
}

$FileSize = (Get-Item $OSM_File).Length / 1MB
Write-Green "OK Tamaño: $([Math]::Round($FileSize, 2)) MB"
Write-Host ""

# Paso 3: Verificar Docker
Write-Yellow "3. Verificando Docker..."
$DockerCheck = docker --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Stop-OnError "Docker no esta corriendo o no esta instalado. Inicia Docker Desktop y vuelve a intentar."
}
Write-Green "OK Docker disponible: $DockerCheck"
Write-Host ""

# Paso 4: Procesar con OSRM
Write-Yellow "4. Procesando datos OSM con OSRM (Docker)..."
Write-Host "   Este paso puede tomar 10-30 minutos segun tu CPU..."
Write-Host ""

# Osrm-extract
Write-Yellow "   -> Extrayendo caracteristicas del mapa..."
docker run --rm -v "$DataDir`:/data" osrm/osrm-backend:latest osrm-extract -p /opt/car.lua /data/chile.osm.pbf

if ($LASTEXITCODE -ne 0) {
    Stop-OnError "Error en osrm-extract"
}
Write-Green "   OK Extraccion completada"
Write-Host ""

# Osrm-contract
Write-Yellow "   -> Contratando grafo (construccion de indices)..."
docker run --rm -v "$DataDir`:/data" osrm/osrm-backend:latest osrm-contract /data/chile.osrm

if ($LASTEXITCODE -ne 0) {
    Stop-OnError "Error en osrm-contract"
}
Write-Green "   OK Contratacion completada"
Write-Host ""

# Paso 5: Verificar archivos
Write-Yellow "5. Verificando archivos generados..."

$OsrmFile = Join-Path $DataDir "chile.osrm"
$OsrmMldFile = Join-Path $DataDir "chile.osrm.mld"

if ((Test-Path $OsrmFile) -and (Test-Path $OsrmMldFile)) {
    Write-Green "OK Archivos OSRM generados exitosamente"
    Write-Host ""
    Write-Host "   Archivos en $DataDir`:"
    Get-Item (Join-Path $DataDir "*.osrm*") | ForEach-Object {
        $Size = $_.Length / 1MB
        Write-Host "   $($_.Name) - $([Math]::Round($Size, 2)) MB"
    }
} else {
    Stop-OnError "No se generaron los archivos .osrm esperados"
}

# Paso 6: Limpieza
Write-Yellow ""
Write-Yellow "6. Limpieza..."

if (Test-Path $OSM_File) {
    Remove-Item $OSM_File -Force
    Write-Green "OK Archivo .pbf eliminado para ahorrar espacio"
}

Write-Host ""
Write-Green "================================================================"
Write-Green "OK !CONFIGURACION COMPLETADA EXITOSAMENTE!"
Write-Green "================================================================"
Write-Host ""

Write-Yellow "Proximos pasos:"
Write-Host "1. Levanta los contenedores: docker compose up -d"
Write-Host "2. OSRM estara disponible en: http://localhost:5000"
Write-Host ""

Write-Yellow "Para probar OSRM:"
Write-Host "   `$url = 'http://localhost:5000/route/v1/driving/-72.5898,-38.7369;-72.6004,-38.7456'"
Write-Host "   (Invoke-RestMethod -Uri `$url).routes[0] | Select-Object distance, duration"
Write-Host ""

Write-Green "Setup completado. Ahora ejecuta: docker compose up -d"
