package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

// SetupCORS configura el middleware CORS para permitir solicitudes de origen cruzado
func SetupCORS() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins:     []string{"*"},                            // Permitir todos los orígenes
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"}, // Métodos permitidos
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}
