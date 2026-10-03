# Dockerfile funcional para el microservicio de Scraping (Scrapy)
FROM python:3.11-slim

# Evitar la creación de archivos .pyc y volcar logs inmediatamente a la consola
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar librerías base del SO necesarias para compilar extensiones en el futuro (opcional pero recomendado)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python (Scrapy, psycopg2, etc)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente (los spiders)
COPY . .

# Scrapy se ejecuta por comandos (spiders). Mantenemos el contenedor vivo para poder entrar 
# mediante 'docker compose exec' a lanzar los spiders, o bien, se reemplazará este comando 
# por Scrapyd / Celery en un futuro si se vuelve un demonio automatizado.
CMD ["sh", "-c", "echo 'Contenedor Scrapy iniciado en modo Standby. Listo para ejecutar spiders.' && tail -f /dev/null"]
