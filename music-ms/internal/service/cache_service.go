package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

// CacheService maneja las operaciones de Redis cache
type CacheService struct {
	client *redis.Client
	ttl    time.Duration
}

// NewCacheService crea un nuevo servicio de cache
func NewCacheService() (*CacheService, error) {
	// Obtener configuración desde variables de entorno
	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("REDIS_PORT")
	if port == "" {
		port = "6379"
	}

	password := os.Getenv("REDIS_PASSWORD")

	// TTL configurable desde variable de entorno
	ttlSeconds, err := strconv.Atoi(os.Getenv("CACHE_TTL_SECONDS"))
	if err != nil || ttlSeconds <= 0 {
		ttlSeconds = 300 // 5 minutos por defecto
	}

	// Crear cliente Redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", host, port),
		Password: password,
		DB:       0, // Base de datos por defecto
	})

	// Verificar conexión
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = rdb.Ping(ctx).Result()
	if err != nil {
		log.Printf("Error conectando a Redis: %v", err)
		return nil, fmt.Errorf("no se pudo conectar a Redis: %v", err)
	}

	log.Printf("✅ Conectado a Redis en %s:%s con TTL de %d segundos", host, port, ttlSeconds)

	return &CacheService{
		client: rdb,
		ttl:    time.Duration(ttlSeconds) * time.Second,
	}, nil
}

// Set almacena un valor en el cache
func (c *CacheService) Set(ctx context.Context, key string, value interface{}) error {
	jsonValue, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("error marshaling value: %v", err)
	}

	err = c.client.Set(ctx, key, jsonValue, c.ttl).Err()
	if err != nil {
		log.Printf("❌ Error guardando en cache key '%s': %v", key, err)
		return err
	}

	log.Printf("📝 Cache SET: %s (TTL: %v)", key, c.ttl)
	return nil
}

// Get obtiene un valor del cache
func (c *CacheService) Get(ctx context.Context, key string, dest interface{}) error {
	val, err := c.client.Get(ctx, key).Result()
	if err == redis.Nil {
		log.Printf("🔍 Cache MISS: %s", key)
		return fmt.Errorf("cache miss")
	} else if err != nil {
		log.Printf("❌ Error obteniendo del cache key '%s': %v", key, err)
		return err
	}

	err = json.Unmarshal([]byte(val), dest)
	if err != nil {
		log.Printf("❌ Error unmarshaling cache value for key '%s': %v", key, err)
		return err
	}

	log.Printf("✅ Cache HIT: %s", key)
	return nil
}

// Delete elimina una clave del cache
func (c *CacheService) Delete(ctx context.Context, key string) error {
	err := c.client.Del(ctx, key).Err()
	if err != nil {
		log.Printf("❌ Error eliminando del cache key '%s': %v", key, err)
		return err
	}

	log.Printf("🗑️ Cache DELETE: %s", key)
	return nil
}

// DeletePattern elimina todas las claves que coincidan con un patrón
func (c *CacheService) DeletePattern(ctx context.Context, pattern string) error {
	iter := c.client.Scan(ctx, 0, pattern, 0).Iterator()

	var keys []string
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}

	if err := iter.Err(); err != nil {
		return err
	}

	if len(keys) > 0 {
		err := c.client.Del(ctx, keys...).Err()
		if err != nil {
			log.Printf("❌ Error eliminando del cache pattern '%s': %v", pattern, err)
			return err
		}
		log.Printf("🗑️ Cache DELETE PATTERN: %s (%d keys)", pattern, len(keys))
	}

	return nil
}

// Exists verifica si una clave existe en el cache
func (c *CacheService) Exists(ctx context.Context, key string) (bool, error) {
	result, err := c.client.Exists(ctx, key).Result()
	if err != nil {
		return false, err
	}
	return result > 0, nil
}

// GetStats obtiene estadísticas del cache
func (c *CacheService) GetStats(ctx context.Context) (map[string]interface{}, error) {
	info, err := c.client.Info(ctx, "stats").Result()
	if err != nil {
		return nil, err
	}

	// Parse básico de las estadísticas de Redis
	stats := map[string]interface{}{
		"info": info,
		"ttl":  c.ttl.Seconds(),
	}

	return stats, nil
}

// Close cierra la conexión Redis
func (c *CacheService) Close() error {
	return c.client.Close()
}

// GenerateKey genera una clave de cache estandarizada
func (c *CacheService) GenerateKey(prefix string, parts ...string) string {
	key := "aleph:music:" + prefix
	for _, part := range parts {
		key += ":" + part
	}
	return key
}
