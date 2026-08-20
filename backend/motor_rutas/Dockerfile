# Dockerfile para el Motor de Rutas Geoespaciales
FROM python:3.11-slim

# Evitar la creación de archivos .pyc y liberar logs inmediatamente
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Al migrar de OSMnx a OSRM/OR-Tools, ya no necesitamos instalar compiladores 
# pesados de C++ (gcc, g++, libspatialindex) en la imagen de Python.
# Esto hace que el contenedor levante mucho mas rapido y ligero.

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponemos el puerto 8001 para que no choque con el API Gateway en el host
EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
