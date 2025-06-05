# syntax=docker/dockerfile:1
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o streaming-ms main.go

FROM alpine:3.18
WORKDIR /app
COPY --from=builder /app/streaming-ms .
EXPOSE 8080
CMD ["./streaming-ms"]
