# Music Microservicio (music-ms)

Microservicio para la gestión de música desarrollado en Go. Este microservicio proporciona endpoints para la gestión de canciones, álbumes, artistas y categorías musicales. También incluye integración con la API de Spotify para importar datos.

![GitHub](https://img.shields.io/github/license/tu-usuario/music-ms)
![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248?logo=mongodb&logoColor=white)

## Características

- API RESTful con Gin
- Persistencia en MongoDB
- Integración con Spotify
- Dockerizado para fácil despliegue
- Estructurado siguiendo principios de Clean Architecture

## Estructura del Proyecto

```
music-ms/
├── cmd/
│   └── server/
│       └── main.go              # Punto de entrada de la aplicación
├── internal/
│   ├── api/
│   │   ├── handlers.go          # Manejadores HTTP
│   │   └── router.go            # Configuración de rutas
│   ├── config/
│   │   └── config.go            # Configuración de la aplicación
│   ├── db/
│   │   └── mongodb.go           # Conexión a MongoDB
│   ├── models/
│   │   ├── album.go             # Modelo de álbum
│   │   ├── artist.go            # Modelo de artista
│   │   ├── category.go          # Modelo de categoría
│   │   └── song.go              # Modelo de canción
│   └── service/
│       ├── music_service.go     # Lógica de negocio
│       └── spotify_service.go   # Integración con Spotify
├── .env.example                 # Ejemplo de variables de entorno
├── Dockerfile                   # Configuración para Docker
├── docker-compose.yml           # Configuración para Docker Compose
├── go.mod                       # Dependencias de Go
└── go.sum                       # Checksums de dependencias
```

## Requisitos

- Go 1.21+
- MongoDB
- Credenciales de la API de Spotify (opcional para la integración con Spotify)

## Instalación y Ejecución

### Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` para establecer tus propias variables, especialmente las credenciales de Spotify.

### Ejecución Local

```bash
# Descargar dependencias
go mod download

# Ejecutar la aplicación
go run cmd/server/main.go
```

### Ejecución con Docker

```bash
# Construir y ejecutar con Docker Compose
docker-compose up -d
```

## API Endpoints

### Canciones

- `GET /api/music/songs` - Obtener todas las canciones
- `GET /api/music/songs/:id` - Obtener detalles de una canción
- `GET /api/music/songs/:id/audio` - Obtener la URL de audio de una canción

### Álbumes

- `GET /api/music/albums` - Obtener todos los álbumes
- `GET /api/music/albums/:id` - Obtener detalles de un álbum

### Artistas

- `GET /api/music/artists` - Obtener todos los artistas
- `GET /api/music/artists/:id` - Obtener detalles de un artista
- `GET /api/music/artists/:id/details` - Alias de la ruta anterior por compatibilidad

### Categorías

- `GET /api/music/categories` - Obtener todas las categorías

### Integración con Spotify

- `GET /api/music/spotify/search_albums?q=query` - Buscar álbumes en Spotify
- `POST /api/music/spotify/import_album` - Importar un álbum desde Spotify
- `POST /api/music/spotify/import_artist` - Importar un artista y sus álbumes desde Spotify

## Para Compatibilidad con Sistemas Anteriores

Todos los endpoints también están disponibles con el prefijo `/api/v1/` en lugar de `/api/music/`.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue antes de enviar un pull request.

## Configuración para GitHub

Para subir este repositorio a GitHub, sigue estos pasos:

1. Asegúrate de tener Git instalado en tu sistema
2. Inicializa Git en el directorio del proyecto (si no lo has hecho ya):
   ```bash
   git init
   ```

3. Crea un archivo `.gitignore` para excluir archivos sensibles:
   ```bash
   cat > .gitignore << EOL
   # Binarios y archivos de compilación
   *.exe
   *.exe~
   *.dll
   *.so
   *.dylib
   *.test
   *.out

   # Variables de entorno y configuración
   .env
   *.env

   # Carpetas específicas de Go
   /vendor/
   /bin/
   /dist/
   
   # Logs
   *.log

   # Archivos de sistema
   .DS_Store
   Thumbs.db
   EOL
   ```

4. Agrega todos los archivos y haz el primer commit:
   ```bash
   git add .
   git commit -m "Commit inicial del microservicio de música"
   ```

5. Crea un repositorio en GitHub y vincúlalo con tu repositorio local:
   ```bash
   git remote add origin https://github.com/tu-usuario/music-ms.git
   git branch -M main
   git push -u origin main
   ```

## Licencia

MIT
