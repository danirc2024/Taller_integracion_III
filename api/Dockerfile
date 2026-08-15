# Plantilla Base para API Gateway (FastAPI)
FROM python:3.11-slim

# Evitar que Python escriba archivos .pyc y forzar el volcado de stdout/stderr para ver logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Descomentar e instalar dependencias (asegúrate de incluir 'fastapi' y 'uvicorn' en el txt)
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# COPY . .

EXPOSE 8000

CMD ["sh", "-c", "echo 'API Gateway (FastAPI) no implementado aún. Añade código y descomentar uvicorn.' && tail -f /dev/null"]

# Comando sugerido para Producción:
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Comando sugerido para Desarrollo (con recarga automática):
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
