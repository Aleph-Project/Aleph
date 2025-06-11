# Usar una imagen base con Node.js y herramientas gráficas
FROM node:18-bullseye

# Instalar dependencias del sistema para Electron y X11
RUN apt-get update && apt-get install -y \
    libnss3-dev \
    libatk-bridge2.0-dev \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2 \
    libgtk-3-0 \
    libgconf-2-4 \
    xvfb \
    x11-apps \
    libxshmfence1 \
    # Agregar D-Bus y módulos GTK
    dbus \
    dbus-x11 \
    libcanberra-gtk-module \
    libcanberra-gtk3-module \
    # Mesa para gráficos
    mesa-utils \
    libgl1-mesa-glx \
    libgl1-mesa-dri \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json del proyecto principal
COPY package*.json ./

# Instalar dependencias del proyecto principal
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Construir la aplicación Next.js
# En Nextron sin package.json separado, Next.js busca en renderer/ automáticamente
RUN npm run build

# Verificar que los archivos CSS se generaron correctamente
RUN echo "=== VERIFICANDO ARCHIVOS GENERADOS ===" && \
    find . -name "*.css" -o -name "_next" | head -10 && \
    ls -la renderer/ || true && \
    ls -la app/ || true

# Crear usuario no-root para ejecutar Electron
RUN groupadd -r electronuser && useradd -r -g electronuser -G audio,video electronuser \
    && mkdir -p /home/electronuser/Downloads \
    && chown -R electronuser:electronuser /home/electronuser \
    && chown -R electronuser:electronuser /app

# Cambiar a usuario no-root
USER electronuser

# Variables de entorno para X11 y Electron
ENV DISPLAY=:0
ENV ELECTRON_DISABLE_SECURITY_WARNINGS=1

# # Comando por defecto para ejecutar la aplicación con flags para Docker
CMD ["npx", "electron", ".", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--disable-software-rasterizer", "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding"]



# # Usar imagen base más específica y ligera
# FROM node:18-slim

# # Instalar solo dependencias esenciales para Electron
# # Unir comandos para reducir capas y usar --no-install-recommends para reducir tamaño
# RUN apt-get update && apt-get install --no-install-recommends -y \
#     libnss3-dev \
#     libatk-bridge2.0-0 \
#     libdrm2 \
#     libxcomposite1 \
#     libxdamage1 \
#     libxrandr2 \
#     libgbm1 \
#     libxss1 \
#     libasound2 \
#     libgtk-3-0 \
#     xvfb \
#     libxshmfence1 \
#     dbus \
#     dbus-x11 \
#     libcanberra-gtk3-module \
#     libgl1-mesa-glx \
#     && rm -rf /var/lib/apt/lists/*

# # Crear directorio de trabajo
# WORKDIR /app

# # Copiar package.json y package-lock.json para aprovechar la caché de capas
# COPY package*.json ./

# # Usar npm ci con flags específicos para optimizar la instalación
# RUN npm ci --only=production --no-audit --no-optional

# # Copiar solo los archivos necesarios para construir (no .git, node_modules, etc.)
# COPY main ./main
# COPY renderer ./renderer
# COPY resources ./resources
# COPY electron-builder.yml ./
# COPY tsconfig.json ./ 
# COPY renderer/next.config.js ./
# COPY renderer/postcss.config.js ./
# COPY renderer/tailwind.config.js ./
# COPY .env* ./

# # Construir la aplicación con flags para optimizar
# RUN NODE_ENV=production npm run build

# # Crear usuario no-root (combinando comandos para reducir capas)
# RUN groupadd -r electronuser && \
#     useradd -r -g electronuser -G audio,video electronuser && \
#     mkdir -p /home/electronuser/Downloads && \
#     chown -R electronuser:electronuser /home/electronuser && \
#     chown -R electronuser:electronuser /app

# # Cambiar a usuario no-root
# USER electronuser

# # Variables de entorno para X11 y Electron
# ENV DISPLAY=:0 \
#     ELECTRON_DISABLE_SECURITY_WARNINGS=1

# # Comando para ejecutar la aplicación con flags optimizados
# CMD ["npx", "electron", ".", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]