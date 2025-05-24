#!/bin/bash

# Script para construir y ejecutar el proyecto con Docker Compose

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Construyendo y levantando los contenedores...${NC}"
docker-compose build

echo -e "${YELLOW}Iniciando los servicios...${NC}"
docker-compose up -d

echo -e "${GREEN}¡Servicios iniciados!${NC}"
echo -e "El microservicio está disponible en: http://localhost:3002"
echo -e "MongoDB está disponible en: localhost:27018"
echo -e ""
echo -e "Para ver los logs: docker-compose logs -f"
echo -e "Para detener: docker-compose down"
