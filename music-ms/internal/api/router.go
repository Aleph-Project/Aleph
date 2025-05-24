package api

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	
	"github.com/angel/music-ms/internal/config"
	"github.com/angel/music-ms/internal/service"
)

// SetupRouter configura el router HTTP
func SetupRouter(db *mongo.Database) *gin.Engine {
	r := gin.Default()


	// Configuración de CORS
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Cargar la configuración
	cfg := config.LoadConfig()

	// Crear servicios
	spotifyService, err := service.NewSpotifyService(cfg.SpotifyID, cfg.SpotifyKey)
	if err != nil {
		// Fallback sin servicio de Spotify
		spotifyService = nil
	}

	musicService := service.NewMusicService(db, spotifyService)
	handler := NewHandler(musicService, spotifyService)

	// Rutas de la API
	api := r.Group("/api/v1")
	{
		// Ruta de health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		// Grupo music (acceso directo para desarrollo)
		music := api.Group("/music")
		{
			// Rutas de canciones
			music.GET("/songs", handler.GetSongs)
			music.GET("/songs/:id", handler.GetSong)
			music.GET("/songs/:id/audio", handler.GetSongAudio)
			music.GET("/songs/search", handler.SearchSongsByName)
			
			// Rutas de álbumes
			music.GET("/albums", handler.GetAlbums)
			music.GET("/albums/:id", handler.GetAlbum)
			
			// Rutas de artistas
			music.GET("/artists", handler.GetArtists)
			music.GET("/artists/:id", handler.GetArtist)
			music.GET("/artists/:id/details", handler.GetArtist) // Alias para compatibilidad
			
			// Rutas de géneros
			music.GET("/genres", handler.GetGenres)
			music.GET("/genres/:id", handler.GetGenreByID)
			music.GET("/genres/slug/:slug", handler.GetGenreBySlug)
			
			// Rutas de Spotify
			spotify := music.Group("/spotify")
			if spotifyService != nil {
				spotify.GET("/search_albums", handler.SearchAlbumsInSpotify)
				spotify.POST("/import_album", handler.ImportAlbumFromSpotify)
				spotify.POST("/import_artist", handler.ImportArtistFromSpotify)
			}
		}
	}

	return r
}
