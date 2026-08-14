# Plantilla Base para Frontend (Ej. Next.js exportado a HTML estático en Nginx)

# -- Etapa de construcción --
# Descomentar al tener el código de React/Next.js o similar
# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
# RUN npm run export

# -- Etapa de producción --
FROM nginx:alpine

# COPY --from=builder /app/out /usr/share/nginx/html
# Opcional: Copiar configuración de Nginx
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
