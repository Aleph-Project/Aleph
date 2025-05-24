#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Preparando el proyecto music-ms para GitHub...${NC}"

# 1. Verificar que git esté instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git no está instalado. Instálalo con: sudo apt-get install git${NC}"
    exit 1
fi

# 2. Inicializar repositorio Git si no existe
if [ ! -d .git ]; then
    echo -e "${YELLOW}Inicializando repositorio Git...${NC}"
    git init
    echo -e "${GREEN}Repositorio Git inicializado.${NC}"
else
    echo -e "${YELLOW}Repositorio Git ya existe.${NC}"
fi

# 3. Crear .gitignore adecuado para Go
echo -e "${YELLOW}Creando archivo .gitignore...${NC}"
cat > .gitignore << EOL
# Binarios compilados
*.exe
*.exe~
*.dll
*.so
*.dylib
music-ms

# Archivos de prueba
*.test
*.tmp

# Cobertura de código
*.out
*.cov

# Archivos de dependencias
vendor/

# Archivos específicos de Go
go.work

# Archivos de IDE
.idea/
.vscode/
*.swp
*.swo

# Sistema operativo
.DS_Store
Thumbs.db

# Archivos de entorno
.env
EOL
echo -e "${GREEN}Archivo .gitignore creado.${NC}"

# 4. Crear archivo .env.example
echo -e "${YELLOW}Creando archivo .env.example...${NC}"
cat > .env.example << EOL
# Configuración del servidor
PORT=3002

# Configuración de MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_NAME=music_ms
MONGODB_TIMEOUT=10

# Credenciales de Spotify (reemplazar con tus propias credenciales)
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
EOL
echo -e "${GREEN}Archivo .env.example creado.${NC}"

# 5. Verificar que no haya secretos en el código
echo -e "${YELLOW}Verificando si hay credenciales en docker-compose.yml...${NC}"
if grep -q "SPOTIFY_CLIENT" docker-compose.yml; then
    echo -e "${RED}¡Advertencia! Parece que el archivo docker-compose.yml contiene credenciales de Spotify.${NC}"
    echo -e "${YELLOW}Deberías eliminar estas credenciales antes de subir a GitHub.${NC}"
    
    # Preguntar al usuario si quiere eliminar las credenciales
    read -p "¿Quieres eliminar las credenciales del archivo docker-compose.yml? (s/n): " resp
    if [[ "$resp" == "s" || "$resp" == "S" ]]; then
        # Hacer un backup
        cp docker-compose.yml docker-compose.yml.bak
        
        # Reemplazar credenciales
        sed -i 's/SPOTIFY_CLIENT_ID=.*/SPOTIFY_CLIENT_ID=your_spotify_client_id_here/g' docker-compose.yml
        sed -i 's/SPOTIFY_CLIENT_SECRET=.*/SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here/g' docker-compose.yml
        
        echo -e "${GREEN}Credenciales reemplazadas en docker-compose.yml${NC}"
    fi
fi

# 6. Verificar README.md
if [ ! -f README.md ] || [ ! -s README.md ]; then
    echo -e "${YELLOW}El archivo README.md no existe o está vacío. Creando uno...${NC}"
    # README.md se crea en un paso posterior
else
    echo -e "${GREEN}README.md ya existe.${NC}"
fi

echo -e "${GREEN}¡Proyecto preparado para GitHub!${NC}"
echo -e "${YELLOW}Ahora puedes añadir tus archivos con 'git add .' y crear un commit con 'git commit -m \"Commit inicial\"'${NC}"
echo -e "${YELLOW}Luego, conecta tu repositorio local con GitHub y haz push:${NC}"
echo -e "${YELLOW}git remote add origin https://github.com/tu-usuario/music-ms.git${NC}"
echo -e "${YELLOW}git branch -M main${NC}"
echo -e "${YELLOW}git push -u origin main${NC}"

echo -e "${GREEN}¡Listo para subir tu proyecto!${NC}"
