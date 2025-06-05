# streaming-ms

Microservicio de streaming con WebSocket en Go (Gorilla)

## Endpoints

- `ws://localhost:8081/ws` - WebSocket para streaming
- `http://localhost:8081/health` - Health check

## Uso local

```bash
go mod tidy
go run main.go
```

## Docker

```bash
docker build -t streaming-ms .
docker run -p 8081:8080 streaming-ms
```

## Integrado con docker-compose

```bash
# Desde la raíz del proyecto
docker-compose up streaming-ms
```

## Comandos WebSocket

```json
// Reproducir canción
{
  "type": "play",
  "songId": "64f7b1234567890abcdef123"
}

// Pausar
{
  "type": "pause",
  "songId": "64f7b1234567890abcdef123"
}

// Detener
{
  "type": "stop",
  "songId": "64f7b1234567890abcdef123"
}
```
