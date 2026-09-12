# Dockerfile para Frontend (React + Vite) - Entorno de Desarrollo
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias automáticamente basándose en el package.json
COPY package.json package-lock.json* ./
RUN npm install -g npm@latest
RUN npm install

# Copiar el resto del código fuente del cliente React
COPY . .

# Exponer el puerto de desarrollo de Vite (3000)
EXPOSE 3000

# Iniciar servidor de desarrollo de Vite expuesto a todas las interfaces
CMD ["npm", "run", "dev", "--", "--host"]
