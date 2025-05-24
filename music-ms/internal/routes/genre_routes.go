package routes

import (
	"github.com/gin-gonic/gin"

	"github.com/angel/music-ms/internal/api"
)

// SetupGenreRoutes configura las rutas relacionadas con los géneros
func SetupGenreRoutes(router *gin.Engine, handler *api.Handler) {
	apiGroup := router.Group("/api")
	musicGroup := apiGroup.Group("/music")
	{
		genresGroup := musicGroup.Group("/genres")
		{
			// GET /api/music/genres - Obtener todos los géneros
			genresGroup.GET("", handler.GetGenres)
			
			// GET /api/music/genres/:id - Obtener un género específico por ID
			genresGroup.GET("/:id", handler.GetGenreByID)
			
			// GET /api/music/genres/slug/:slug - Obtener un género por slug
			genresGroup.GET("/slug/:slug", handler.GetGenreBySlug)
		}
	}
}
