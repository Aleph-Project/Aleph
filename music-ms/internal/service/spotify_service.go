package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/oauth2/clientcredentials"

	"github.com/angel/music-ms/internal/models"
)

// SpotifyService maneja la interacción con la API de Spotify
type SpotifyService struct {
	client *spotify.Client
}

// NewSpotifyService crea un nuevo servicio de Spotify
func NewSpotifyService(clientID, clientSecret string) (*SpotifyService, error) {
	if clientID == "" || clientSecret == "" {
		return nil, errors.New("spotify client ID and secret are required")
	}

	config := &clientcredentials.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		TokenURL:     spotifyauth.TokenURL,
	}

	token, err := config.Token(context.Background())
	if err != nil {
		return nil, err
	}

	httpClient := spotifyauth.New().Client(context.Background(), token)
	client := spotify.New(httpClient)

	return &SpotifyService{client: client}, nil
}

// Client retorna el cliente de Spotify
func (s *SpotifyService) Client() *spotify.Client {
	return s.client
}

// SearchAlbums busca álbumes en Spotify
func (s *SpotifyService) SearchAlbums(ctx context.Context, query string, limit int) ([]spotify.SimpleAlbum, error) {
	if limit <= 0 {
		limit = 10 // valor por defecto
	}

	results, err := s.client.Search(ctx, query, spotify.SearchTypeAlbum, spotify.Limit(limit))
	if err != nil {
		return nil, err
	}

	if results.Albums == nil || len(results.Albums.Albums) == 0 {
		return []spotify.SimpleAlbum{}, nil
	}

	return results.Albums.Albums, nil
}

// GetAlbum obtiene un álbum específico de Spotify
func (s *SpotifyService) GetAlbum(ctx context.Context, id string) (*spotify.FullAlbum, error) {
	album, err := s.client.GetAlbum(ctx, spotify.ID(id))
	if err != nil {
		return nil, err
	}
	return album, nil
}

// GetArtist obtiene un artista específico de Spotify
func (s *SpotifyService) GetArtist(ctx context.Context, id string) (*spotify.FullArtist, error) {
	artist, err := s.client.GetArtist(ctx, spotify.ID(id))
	if err != nil {
		return nil, err
	}
	return artist, nil
}

// SearchArtists busca artistas en Spotify
func (s *SpotifyService) SearchArtists(ctx context.Context, query string, limit int) ([]spotify.FullArtist, error) {
	if limit <= 0 {
		limit = 10 // valor por defecto
	}

	results, err := s.client.Search(ctx, query, spotify.SearchTypeArtist, spotify.Limit(limit))
	if err != nil {
		return nil, err
	}

	if results.Artists == nil || len(results.Artists.Artists) == 0 {
		return []spotify.FullArtist{}, nil
	}

	return results.Artists.Artists, nil
}

// GetArtistAlbums obtiene todos los álbumes de un artista en Spotify
func (s *SpotifyService) GetArtistAlbums(ctx context.Context, artistID string) ([]spotify.SimpleAlbum, error) {
	albums, err := s.client.GetArtistAlbums(ctx, spotify.ID(artistID), []spotify.AlbumType{spotify.AlbumTypeAlbum}, spotify.Limit(50))
	if err != nil {
		return nil, err
	}
	return albums.Albums, nil
}

// ConvertSpotifyAlbumToModel convierte un álbum de Spotify a nuestro modelo
func (s *SpotifyService) ConvertSpotifyAlbumToModel(album *spotify.FullAlbum) models.Album {
	// Extraer año de la fecha de lanzamiento
	var year int
	if len(album.ReleaseDate) >= 4 {
		_, err := fmt.Sscanf(album.ReleaseDate[0:4], "%d", &year)
		if err != nil {
			year = 0
		}
	}

	// URL de la imagen
	var imageURL string
	if len(album.Images) > 0 {
		imageURL = album.Images[0].URL
	}

	return models.Album{
		Title:       album.Name,
		ReleaseDate: album.ReleaseDate,
		SpotifyID:   string(album.ID),
		ImageURL:    imageURL,
		Year:        year,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}

// ConvertSpotifyArtistToModel convierte un artista de Spotify a nuestro modelo
func (s *SpotifyService) ConvertSpotifyArtistToModel(artist *spotify.FullArtist) models.Artist {
	var imageURL string
	if len(artist.Images) > 0 {
		imageURL = artist.Images[0].URL
	}

	return models.Artist{
		Name:       artist.Name,
		SpotifyID:  string(artist.ID),
		ImageURL:   imageURL,
		Genres:     artist.Genres,
		Popularity: artist.Popularity,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
}

// ConvertSpotifyTrackToModel convierte una canción de Spotify a nuestro modelo
func (s *SpotifyService) ConvertSpotifyTrackToModel(track spotify.SimpleTrack, albumID primitive.ObjectID, artistIDs []primitive.ObjectID) models.Song {
	return models.Song{
		Title:       track.Name,
		Duration:    track.Duration / 1000, // Convertir de ms a segundos
		SpotifyID:   string(track.ID),
		AlbumID:     albumID,
		ArtistIDs:   artistIDs, // Añadir los IDs de los artistas
		TrackNumber: track.TrackNumber,
		AudioURL:    "", // Spotify no proporciona URL de audio directamente
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}
