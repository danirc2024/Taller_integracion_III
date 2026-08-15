# Plantilla Base para API Gateway (FastAPI)
FROM python:3.11-slim

# Evitar que Python escriba archivos .pyc y forzar el volcado de stdout/stderr para ver logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY . .

EXPOSE 8000

# Comando para Desarrollo (con recarga automática)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
