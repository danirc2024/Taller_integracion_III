# =========================================================
# Etapa 1: Desarrollo (Development)
# =========================================================
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm@latest
RUN npm install
COPY . .
# Exponer el puerto de Vite y arrancar el dev server (Hot Reloading)
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]

# =========================================================
# Etapa 2: Construcción (Build)
# =========================================================
FROM development AS build
# Transpilar el código de React/Vite a estáticos minificados
RUN npm run build

# =========================================================
# Etapa 3: Producción (Nginx)
# =========================================================
FROM nginx:alpine AS production
# Copiar el build compilado desde la etapa anterior al root de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copiar configuración personalizada de Nginx (para soporte SPA/React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# Arrancar Nginx en modo foreground
CMD ["nginx", "-g", "daemon off;"]
