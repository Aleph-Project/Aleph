package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"github.com/angel/music-ms/internal/api"
	"github.com/angel/music-ms/internal/config"
	"github.com/angel/music-ms/internal/db"
)

func main() {
	// Cargar variables de entorno
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found or error loading it. Using environment variables.")
	}

	// Configurar el servidor
	cfg := config.LoadConfig()

	// Conectar a MongoDB
	client, err := db.ConnectMongoDB(cfg.MongoURI, cfg.MongoTimeout)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer client.Disconnect(context.Background())

	// Configurar el enrutador HTTP
	router := api.SetupRouter(client.Database(cfg.MongoDB))

	// Crear servidor HTTP
	addr := fmt.Sprintf(":%d", cfg.Port)
	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Iniciar servidor en una goroutine
	go func() {
		log.Printf("Server starting on port %d", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Configurar canal para capturar señales de apagado
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// Apagar el servidor de manera elegante
	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited gracefully")
}