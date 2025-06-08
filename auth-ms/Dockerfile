# Dockerfile para auth-ms
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm globalmente (opcional, si usas pnpm)
# RUN npm install -g pnpm

# Copiar archivos de dependencias primero
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto (usa el mismo que en .env, 4000)
EXPOSE 4000

# Comando para desarrollo (puedes cambiar a "npm start" para producción)
CMD ["npm", "run", "dev"]
