# Dockerfile para Backend API Gateway (Golang) - Entorno de Desarrollo
FROM golang:1.22-alpine

# Instalar git y utilidades de compilación necesarias para Go y Air
RUN apk add --no-cache git gcc musl-dev

# Instalar Air para Live-Reloading / Hot-Reload automático en desarrollo
RUN go install github.com/air-verse/air@latest

WORKDIR /app

# Copiar archivos de definición de módulos e instalar dependencias (aprovechando la caché de capas)
COPY go.mod go.sum* ./
RUN go mod download

# Copiar el resto del código fuente del backend en Go
COPY . .

# Exponer el puerto configurado para el backend en Go (8080)
EXPOSE 8080

# Iniciar el servidor con Air para recarga automática en desarrollo
CMD ["air"]
