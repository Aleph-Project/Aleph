# Fase de construcción
FROM node:20-alpine AS builder

# Instalar dependencias necesarias para Electron
RUN apk add --no-cache python3 make g++ git bash libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Copia de archivos de dependencias
COPY package*.json ./

# Instalación de dependencias
RUN npm install

# Ejecutar el script postinstall para electron-builder
RUN npm run postinstall

# Copia del código fuente
COPY . .

# Construcción de la aplicación
RUN npm run build:linux

# Fase de producción
FROM node:20-alpine AS runner
WORKDIR /app

# Configuración de environment
ENV NODE_ENV=production

# Instalar dependencias necesarias para ejecutar la aplicación
RUN apk add --no-cache libstdc++ libgcc

# Añadir usuario no root para producción
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar los archivos necesarios de la fase de construcción
# Copiamos la carpeta de distribución que contiene la aplicación compilada
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
# Copiamos los binarios de la aplicación compilada
COPY --from=builder --chown=nextjs:nodejs /app/app ./app

# Cambiar al usuario no root
USER nextjs

# Exponer puerto (aunque en realidad la aplicación Electron no usa el puerto directamente)
EXPOSE 3001

# Comando para ejecutar la aplicación
# Nota: esto es solo para el servicio web incorporado; la aplicación Electron real
# necesitaría ser ejecutada en un entorno con interfaz gráfica
CMD ["npm", "start"]