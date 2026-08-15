# Dockerfile para el Motor de Rutas Geoespaciales
FROM python:3.11-slim

# Evitar la creación de archivos .pyc y liberar logs inmediatamente
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias geoespaciales críticas a nivel de sistema operativo
# (Librerías como OSMnx y GeoPandas suelen requerir C++ y libspatialindex)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libspatialindex-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponemos el puerto 8001 para que no choque con el API Gateway en el host
EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
