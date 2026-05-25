# Etapa 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Copia archivos de configuración
COPY package.json package-lock.json* ./

# Instala dependencias
RUN npm ci

# Copia el código fuente
COPY . .

# Ejecutamos el build
RUN npm run build -- --configuration=production

# Etapa 2: Run (SSR)
FROM node:22-alpine
WORKDIR /app

# Copiamos el resultado del build
COPY --from=builder /app/dist/*/ ./dist/

EXPOSE 4000

CMD ["node", "dist/server/server.mjs"]