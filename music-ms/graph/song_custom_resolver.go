package graph

import (
	"context"
	"fmt"

	"github.com/angel/music-ms/graph/model"
)

// Albums is the resolver for the albums field of Artist.
func (r *Resolver) Albums(ctx context.Context, obj *model.Artist) ([]*model.Album, error) {
	albumsData, err := r.MusicService.GetAlbums(ctx)
	if err != nil {
		return nil, err
	}
	var albums []*model.Album
	for _, a := range albumsData {
		// Busca si el artista está en la lista de artistas del álbum
		found := false
		for _, artistID := range a.ArtistIDs {
			if artistID.Hex() == obj.ID {
				found = true
				break
			}
		}
		if !found {
			continue
		}
		artistIDs := make([]string, len(a.ArtistIDs))
		for i, id := range a.ArtistIDs {
			artistIDs[i] = id.Hex()
		}
		albums = append(albums, &model.Album{
			ID:          a.ID.Hex(),
			Title:       a.Title,
			ReleaseDate: strPtr(a.ReleaseDate),
			SpotifyID:   strPtr(a.SpotifyID),
			Year:        &a.Year,
			CreatedAt:   strPtr(a.CreatedAt.Format("2006-01-02T15:04:05Z07:00")),
			UpdatedAt:   strPtr(a.UpdatedAt.Format("2006-01-02T15:04:05Z07:00")),
			ArtistIds:   artistIDs,
			ImageURL:    strPtr(a.ImageURL),
		})
	}
	return albums, nil
}

// Song resolver para el campo album
func (r *songResolver) Album(ctx context.Context, obj *model.Song) (*model.Album, error) {
	// Si ya tenemos el álbum en el objeto Song, lo devolvemos
	if obj.Album != nil && obj.Album.ID != "" {
		return obj.Album, nil
	}

	// Si no tenemos el ID del álbum, no podemos buscar nada
	if obj.AlbumID == nil || *obj.AlbumID == "" {
		return nil, nil
	}

	// Buscar el álbum en la base de datos
	album, err := r.Resolver.MusicService.GetAlbum(ctx, *obj.AlbumID)
	if err != nil {
		fmt.Printf("Error getting album %s: %v\n", *obj.AlbumID, err)
		return nil, err
	}

	// Convertir los IDs de artistas
	artistIDs := make([]string, len(album.ArtistIDs))
	for i, aid := range album.ArtistIDs {
		artistIDs[i] = aid.Hex()
	}

	// Crear el modelo de álbum
	return &model.Album{
		ID:          album.ID.Hex(),
		Title:       album.Title,
		ReleaseDate: strPtr(album.ReleaseDate),
		SpotifyID:   strPtr(album.SpotifyID),
		Year:        &album.Year,
		ImageURL:    strPtr(album.ImageURL),
		ArtistIds:   artistIDs,
		CreatedAt:   strPtr(album.CreatedAt.Format("2006-01-02T15:04:05Z07:00")),
		UpdatedAt:   strPtr(album.UpdatedAt.Format("2006-01-02T15:04:05Z07:00")),
	}, nil
}

// Album resolver para el campo image_url
func (r *albumResolver) ImageURL(ctx context.Context, obj *model.Album) (*string, error) {
	if obj.ImageURL != nil {
		return obj.ImageURL, nil
	}
	empty := ""
	return &empty, nil
}

// Artists resolver para el campo artists de Song
func (r *songResolver) Artists(ctx context.Context, obj *model.Song) ([]*model.Artist, error) {
	// Si ya tenemos los artistas en el objeto Song, los devolvemos
	if obj.Artists != nil && len(obj.Artists) > 0 {
		return obj.Artists, nil
	}

	if obj.ID == "" {
		return []*model.Artist{}, nil
	}

	// Obtener los detalles completos de la canción
	songDetails, err := r.Resolver.MusicService.GetSong(ctx, obj.ID)
	if err != nil {
		fmt.Printf("Error getting song details: %v\n", err)
		return []*model.Artist{}, nil
	}

	var artists []*model.Artist
	
	// Convertir los artistas del modelo interno al modelo GraphQL
	for _, a := range songDetails.Artists {
		artist := &model.Artist{
			ID:         a.ID.Hex(),
			Name:       a.Name,
			SpotifyID:  strPtr(a.SpotifyID),
			ImageURL:   strPtr(a.ImageURL),
			Genres:     a.Genres,
			Popularity: &a.Popularity,
			CreatedAt:  strPtr(a.CreatedAt.Format("2006-01-02T15:04:05Z07:00")),
			UpdatedAt:  strPtr(a.UpdatedAt.Format("2006-01-02T15:04:05Z07:00")),
		}
		artists = append(artists, artist)
	}

	return artists, nil
}

type songResolver struct{ *Resolver }
type albumResolver struct{ *Resolver }
