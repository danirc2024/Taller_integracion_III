# Dockerfile para Frontend (React + Vite) - Entorno de Desarrollo
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero para aprovechar la caché de capas de Docker
COPY package.json package-lock.json* ./
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto configurado en Vite
EXPOSE 3000

# Iniciar el servidor de desarrollo de Vite
CMD ["npm", "run", "dev"]
