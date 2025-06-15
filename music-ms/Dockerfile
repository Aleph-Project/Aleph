FROM golang:1.23-alpine AS builder

WORKDIR /app

# Instalar dependencias
RUN apk add --no-cache git

# Descargar dependencias
COPY go.mod go.sum ./
RUN go mod download

# Copiar el código fuente
COPY . .

# Compilar la aplicación
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o music-ms ./cmd/server

# Etapa final
FROM alpine:3.17

WORKDIR /app

# Instalar certificados CA para HTTPS
RUN apk --no-cache add ca-certificates

# Copiar el binario compilado
COPY --from=builder /app/music-ms .

# Variables de entorno por defecto
# ENV MONGODB_URI="mongodb://mongo:27017" \
#     MONGODB_NAME="music_ms" \
#     MONGODB_TIMEOUT=10

# EXPOSE 3002

CMD ["./music-ms"]