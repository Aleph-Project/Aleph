package api

import (
	"log"

	gqlhandler "github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/angel/music-ms/graph"
	"github.com/angel/music-ms/graph/generated"
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
		log.Printf("⚠️ Spotify service no disponible: %v", err)
	}

	// Intentar crear servicio de cache
	log.Printf("🔄 Intentando conectar a Redis...")
	cacheService, err := service.NewCacheService()
	var musicService *service.MusicService
	var cacheEnabled bool

	if err != nil {
		// Fallback: usar MusicService sin cache
		log.Printf("⚠️ Cache no disponible, usando servicio sin cache: %v", err)
		musicService = service.NewMusicService(db, spotifyService)
		cacheEnabled = false
		cacheService = nil
	} else {
		// Usar CachedMusicService cuando cache esté disponible
		log.Printf("✅ Cache Redis disponible, creando CachedMusicService")
		// Por ahora usar MusicService regular pero con cache disponible para handlers
		musicService = service.NewMusicService(db, spotifyService)
		cacheEnabled = true
		log.Printf("✅ Cache disponible - handlers pueden usar funciones con cache")
	}

	handler := NewHandler(musicService, spotifyService, cacheService)

	// Rutas de la API
	api := r.Group("/api/v1")
	{
		// Ruta de health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "cache_enabled": cacheEnabled})
		})

		// Grupo music (acceso directo para desarrollo)
		music := api.Group("/music")
		{
			// Rutas de canciones
			music.GET("/songs", handler.GetSongs)
			music.GET("/songs/:id", handler.GetSong)
			music.GET("/songs/:id/audio", handler.GetSongAudio)
			music.PUT("/songs/:id/audio-url", handler.UpdateSongAudioURL)
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

			// Rutas de cache (solo si cache está disponible)
			if cacheEnabled && cacheService != nil {
				cache := music.Group("/cache")
				{
					cache.GET("/stats", handler.GetCacheStats)
					cache.DELETE("/clear", handler.ClearCache)
				}
			}

			// Rutas de Spotify
			spotify := music.Group("/spotify")
			if spotifyService != nil {
				spotify.GET("/search_albums", handler.SearchAlbumsInSpotify)
				spotify.POST("/import_album", handler.ImportAlbumFromSpotify)
				spotify.POST("/import_artist", handler.ImportArtistFromSpotify)
			}

			// GraphQL endpoint
			music.POST("/graphql", gin.WrapH(gqlhandler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{MusicService: musicService}}))))

			// Playground (opcional, solo en desarrollo)
			music.GET("/playground", gin.WrapH(playground.Handler("GraphQL", "/api/v1/music/graphql")))
		}
	}

	return r
}
