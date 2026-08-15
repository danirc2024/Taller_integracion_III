# Plantilla Base para Frontend (React + Vite)
# Multi-stage build optimizado para producción

# -- Etapa de Construcción --
# Descomentar al iniciar el proyecto
# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci
# COPY . .
# RUN npm run build

# -- Etapa de Producción --
FROM nginx:alpine

# Vite exporta los archivos estáticos a la carpeta 'dist' por defecto
# COPY --from=builder /app/dist /usr/share/nginx/html

# Opcional: Copiar configuración de Nginx (necesario si se usa React Router)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["sh", "-c", "echo 'Frontend React+Vite no implementado aún. Añadir código y descomentar nginx.' && tail -f /dev/null"]
# CMD ["nginx", "-g", "daemon off;"]

# ---
# NOTA PARA DESARROLLO (Hot Module Replacement):
# En desarrollo, en lugar de usar Nginx, es común usar el servidor dev de Vite.
# Puedes sobreescribir el comando en docker-compose.yml así:
# command: npm run dev -- --host 0.0.0.0
# Y mapear el puerto 5173:5173.
