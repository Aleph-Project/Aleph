package routes

import (
	"github.com/gin-gonic/gin"

	"music-ms/internal/controllers"
	"music-ms/internal/database"
)

// SetupSongRoutes configura las rutas relacionadas con las canciones
func SetupSongRoutes(router *gin.Engine, db *database.MongoDB) {
	songController := controllers.NewSongController(db.Database)

	apiGroup := router.Group("/api/v1")
	musicGroup := apiGroup.Group("/music")
	{
		songsGroup := musicGroup.Group("/songs")
		{
			// GET /music/songs - Obtener todas las canciones
			songsGroup.GET("", songController.GetAllSongs)
			
			// GET /music/songs/:id - Obtener una canción específica por ID
			songsGroup.GET("/:id", songController.GetSongByID)
			
			// GET /music/songs/:id/audio - Obtener el archivo de audio de una canción
			songsGroup.GET("/:id/audio", songController.GetSongAudio)
		}
	}
}
