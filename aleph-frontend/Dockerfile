# Fase de construcción
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copia de archivos de dependencias
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Instalación de pnpm y dependencias
RUN npm install -g pnpm && pnpm install

# Copia del código fuente
COPY . .

# Construcción de la aplicación
RUN pnpm build

# Fase de producción
FROM node:20-alpine AS runner
WORKDIR /app

# Instalación de pnpm
RUN npm install -g pnpm

# Configuración de environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Añadir usuario no root para producción
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos necesarios de la fase de construcción
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Cambiar al usuario no root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]