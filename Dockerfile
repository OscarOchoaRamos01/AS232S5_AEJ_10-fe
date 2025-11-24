# Etapa 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir con nginx
FROM nginx:alpine

# Instalar gettext para envsubst
RUN apk add --no-cache gettext

# Copiar archivos build
COPY --from=build /app/dist /usr/share/nginx/html

# Script de inicio personalizado
COPY <<'EOF' /docker-entrypoint.sh
#!/bin/sh

# Reemplazar placeholder con variable de entorno real si está definida
if [ ! -z "$VITE_API_BASE_URL" ]; then
  sed -i "s|__API_BASE_URL_PLACEHOLDER__|$VITE_API_BASE_URL|g" /usr/share/nginx/html/env.js
fi

# Iniciar nginx
nginx -g "daemon off;"
EOF

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
CMD ["/docker-entrypoint.sh"]