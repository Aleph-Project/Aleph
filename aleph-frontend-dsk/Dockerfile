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



