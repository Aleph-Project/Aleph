package service

import (
	"context"
	"fmt"
	"log"

	"github.com/zmb3/spotify/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/angel/music-ms/internal/models"
)

// CachedMusicService envuelve MusicService agregando funcionalidad de cache
type CachedMusicService struct {
	musicService *MusicService
	cacheService *CacheService
}

// NewCachedMusicService crea un nuevo servicio de música con cache
func NewCachedMusicService(db *mongo.Database, spotifyService *SpotifyService, cacheService *CacheService) *CachedMusicService {
	musicService := NewMusicService(db, spotifyService)
	return &CachedMusicService{
		musicService: musicService,
		cacheService: cacheService,
	}
}

// GetSongs obtiene canciones con cache
func (c *CachedMusicService) GetSongs(ctx context.Context, limit, skip int) ([]models.SongWithDetails, error) {
	// Generar clave de cache única
	cacheKey := c.cacheService.GenerateKey("songs",
		fmt.Sprintf("limit_%d_skip_%d", limit, skip))

	// Intentar obtener del cache
	var cachedSongs []models.SongWithDetails
	err := c.cacheService.Get(ctx, cacheKey, &cachedSongs)
	if err == nil {
		log.Printf("✅ CACHE HIT: GetSongs(limit=%d, skip=%d)", limit, skip)
		return cachedSongs, nil
	}

	// Cache miss - obtener de la base de datos
	log.Printf("🔍 CACHE MISS: GetSongs(limit=%d, skip=%d) - consultando DB", limit, skip)
	songs, err := c.musicService.GetSongs(ctx, limit, skip)
	if err != nil {
		return nil, err
	}

	// Guardar en cache para próximas consultas
	if err := c.cacheService.Set(ctx, cacheKey, songs); err != nil {
		log.Printf("⚠️ Error guardando en cache: %v", err)
	}

	return songs, nil
}

// GetSong obtiene una canción específica con cache
func (c *CachedMusicService) GetSong(ctx context.Context, id string) (*models.SongWithDetails, error) {
	cacheKey := c.cacheService.GenerateKey("song", id)

	var cachedSong models.SongWithDetails
	err := c.cacheService.Get(ctx, cacheKey, &cachedSong)
	if err == nil {
		log.Printf("✅ CACHE HIT: GetSong(%s)", id)
		return &cachedSong, nil
	}

	log.Printf("🔍 CACHE MISS: GetSong(%s) - consultando DB", id)
	song, err := c.musicService.GetSong(ctx, id)
	if err != nil {
		return nil, err
	}

	if err := c.cacheService.Set(ctx, cacheKey, *song); err != nil {
		log.Printf("⚠️ Error guardando canción en cache: %v", err)
	}

	return song, nil
}

// GetAlbums obtiene álbumes con cache
func (c *CachedMusicService) GetAlbums(ctx context.Context) ([]models.Album, error) {
	cacheKey := c.cacheService.GenerateKey("albums", "all")

	var cachedAlbums []models.Album
	err := c.cacheService.Get(ctx, cacheKey, &cachedAlbums)
	if err == nil {
		log.Printf("✅ CACHE HIT: GetAlbums()")
		return cachedAlbums, nil
	}

	log.Printf("🔍 CACHE MISS: GetAlbums() - consultando DB")
	albums, err := c.musicService.GetAlbums(ctx)
	if err != nil {
		return nil, err
	}

	if err := c.cacheService.Set(ctx, cacheKey, albums); err != nil {
		log.Printf("⚠️ Error guardando álbumes en cache: %v", err)
	}

	return albums, nil
}

// GetArtists obtiene artistas con cache
func (c *CachedMusicService) GetArtists(ctx context.Context, limit, skip int) ([]models.Artist, error) {
	cacheKey := c.cacheService.GenerateKey("artists",
		fmt.Sprintf("limit_%d_skip_%d", limit, skip))

	var cachedArtists []models.Artist
	err := c.cacheService.Get(ctx, cacheKey, &cachedArtists)
	if err == nil {
		log.Printf("✅ CACHE HIT: GetArtists(limit=%d, skip=%d)", limit, skip)
		return cachedArtists, nil
	}

	log.Printf("🔍 CACHE MISS: GetArtists(limit=%d, skip=%d) - consultando DB", limit, skip)
	artists, err := c.musicService.GetArtists(ctx, limit, skip)
	if err != nil {
		return nil, err
	}

	if err := c.cacheService.Set(ctx, cacheKey, artists); err != nil {
		log.Printf("⚠️ Error guardando artistas en cache: %v", err)
	}

	return artists, nil
}

// TODO: Implementar GetGenres cuando se defina el tipo models.Genre
/*
// GetGenres obtiene géneros con cache
func (c *CachedMusicService) GetGenres(ctx context.Context) ([]models.Genre, error) {
	cacheKey := c.cacheService.GenerateKey("genres", "all")

	var cachedGenres []models.Genre
	err := c.cacheService.Get(ctx, cacheKey, &cachedGenres)
	if err == nil {
		log.Printf("✅ CACHE HIT: GetGenres()")
		return cachedGenres, nil
	}

	log.Printf("🔍 CACHE MISS: GetGenres() - consultando DB")
	genres, err := c.musicService.GetGenres(ctx)
	if err != nil {
		return nil, err
	}

	if err := c.cacheService.Set(ctx, cacheKey, genres); err != nil {
		log.Printf("⚠️ Error guardando géneros en cache: %v", err)
	}

	return genres, nil
}
*/

// SearchSongsByName busca canciones con cache
func (c *CachedMusicService) SearchSongsByName(ctx context.Context, name string) ([]models.SongWithDetails, error) {
	cacheKey := c.cacheService.GenerateKey("search", "songs", name)

	var cachedResults []models.SongWithDetails
	err := c.cacheService.Get(ctx, cacheKey, &cachedResults)
	if err == nil {
		log.Printf("✅ CACHE HIT: SearchSongsByName('%s')", name)
		return cachedResults, nil
	}

	log.Printf("🔍 CACHE MISS: SearchSongsByName('%s') - consultando DB", name)
	results, err := c.musicService.SearchSongsByName(ctx, name)
	if err != nil {
		return nil, err
	}

	// Cache búsquedas por tiempo más corto (búsquedas cambian más frecuentemente)
	if err := c.cacheService.Set(ctx, cacheKey, results); err != nil {
		log.Printf("⚠️ Error guardando búsqueda en cache: %v", err)
	}

	return results, nil
}

// InvalidateCache invalida entradas de cache relacionadas
func (c *CachedMusicService) InvalidateCache(ctx context.Context, patterns ...string) error {
	for _, pattern := range patterns {
		fullPattern := c.cacheService.GenerateKey(pattern, "*")
		if err := c.cacheService.DeletePattern(ctx, fullPattern); err != nil {
			log.Printf("⚠️ Error invalidando cache pattern '%s': %v", fullPattern, err)
			return err
		}
	}
	return nil
}

// GetCacheStats obtiene estadísticas del cache
func (c *CachedMusicService) GetCacheStats(ctx context.Context) (map[string]interface{}, error) {
	return c.cacheService.GetStats(ctx)
}

// Métodos que delegan directamente al MusicService (sin cache por ser operaciones de escritura)

func (c *CachedMusicService) ImportAlbumFromSpotify(ctx context.Context, spotifyID string) (*models.Album, error) {
	result, err := c.musicService.ImportAlbumFromSpotify(ctx, spotifyID)
	if err == nil {
		// Invalidar cache de álbumes y canciones cuando se importa nuevo contenido
		c.InvalidateCache(ctx, "albums", "songs")
	}
	return result, err
}

func (c *CachedMusicService) CountSongs(ctx context.Context) (int64, error) {
	cacheKey := c.cacheService.GenerateKey("count", "songs")

	var cachedCount int64
	err := c.cacheService.Get(ctx, cacheKey, &cachedCount)
	if err == nil {
		return cachedCount, nil
	}

	count, err := c.musicService.CountSongs(ctx)
	if err == nil {
		c.cacheService.Set(ctx, cacheKey, count)
	}
	return count, err
}

// Métodos que simplemente delegan (agregar más según necesidad)
func (c *CachedMusicService) GetAlbum(ctx context.Context, id string) (*models.AlbumWithDetails, error) {
	return c.musicService.GetAlbum(ctx, id)
}

func (c *CachedMusicService) GetArtist(ctx context.Context, id string) (*models.ArtistWithDetails, error) {
	return c.musicService.GetArtist(ctx, id)
}

func (c *CachedMusicService) GetArtistByID(ctx context.Context, id primitive.ObjectID) (*models.Artist, error) {
	return c.musicService.GetArtistByID(ctx, id)
}

func (c *CachedMusicService) GetAlbumByID(ctx context.Context, id primitive.ObjectID) (*models.Album, error) {
	return c.musicService.GetAlbumByID(ctx, id)
}

func (c *CachedMusicService) GetCategories(ctx context.Context) ([]models.Category, error) {
	return c.musicService.GetCategories(ctx)
}

func (c *CachedMusicService) SearchAlbumsInSpotify(ctx context.Context, query string, limit int) ([]spotify.SimpleAlbum, error) {
	return c.musicService.SearchAlbumsInSpotify(ctx, query, limit)
}
