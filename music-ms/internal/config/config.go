package config

import (
	"os"
	"strconv"
	"time"
)

// Config estructura que contiene la configuración de la aplicación
type Config struct {
	Port         int
	MongoURI     string
	MongoDB      string
	MongoTimeout time.Duration
	SpotifyID    string
	SpotifyKey   string
}

// LoadConfig carga la configuración desde las variables de entorno
func LoadConfig() Config {
	var cfg Config

	// Puerto por defecto 3002 (ya que songs-ms usa 3001)
	port, err := strconv.Atoi(getEnv("PORT", "3002"))
	if err != nil {
		port = 3002
	}
	cfg.Port = port

	// Configuración MongoDB
	cfg.MongoURI = getEnv("MONGODB_URI", "mongodb://localhost:27017")
	cfg.MongoDB = getEnv("MONGODB_NAME", "music_ms")
	
	// Timeout para MongoDB (en segundos)
	timeout, err := strconv.Atoi(getEnv("MONGODB_TIMEOUT", "10"))
	if err != nil {
		timeout = 10
	}
	cfg.MongoTimeout = time.Duration(timeout) * time.Second

	// Credenciales de Spotify
	cfg.SpotifyID = getEnv("SPOTIFY_CLIENT_ID", "")
	cfg.SpotifyKey = getEnv("SPOTIFY_CLIENT_SECRET", "")

	return cfg
}

// getEnv obtiene el valor de una variable de entorno, o un valor por defecto si no existe
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
