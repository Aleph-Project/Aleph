package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/zmb3/spotify/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/angel/music-ms/internal/models"
)

// MusicService maneja las operaciones de la base de datos para la música
type MusicService struct {
	db             *mongo.Database
	spotifyService *SpotifyService
}

// NewMusicService crea un nuevo servicio de música
func NewMusicService(db *mongo.Database, spotifyService *SpotifyService) *MusicService {
	return &MusicService{
		db:             db,
		spotifyService: spotifyService,
	}
}

// GetArtistCollection retorna la colección de artistas
func (s *MusicService) GetArtistCollection() *mongo.Collection {
	return s.db.Collection("artists")
}

// GetAlbumCollection retorna la colección de álbumes
func (s *MusicService) GetAlbumCollection() *mongo.Collection {
	return s.db.Collection("albums")
}

// GetSongCollection retorna la colección de canciones
func (s *MusicService) GetSongCollection() *mongo.Collection {
	return s.db.Collection("songs")
}

// GetSongs obtiene todas las canciones con sus detalles
func (s *MusicService) GetSongs(ctx context.Context, limit, skip int) ([]models.SongWithDetails, error) {
	collection := s.db.Collection("songs")

	findOptions := options.Find()
	if limit > 0 {
		findOptions.SetLimit(int64(limit))
	}
	findOptions.SetSkip(int64(skip))
	findOptions.SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var songs []models.Song
	if err := cursor.All(ctx, &songs); err != nil {
		return nil, err
	}

	var songsWithDetails []models.SongWithDetails
	for _, song := range songs {
		// Obtener detalles del álbum
		var album models.Album
		albumCollection := s.db.Collection("albums")
		err := albumCollection.FindOne(ctx, bson.M{"_id": song.AlbumID}).Decode(&album)
		if err != nil {
			log.Printf("Error al obtener álbum para canción %s: %v", song.ID.Hex(), err)
			continue
		}

		// Obtener detalles de los artistas
		var artists []models.Artist
		artistCollection := s.db.Collection("artists")

		// Combinar artistas del álbum y de la canción
		var artistIDs []primitive.ObjectID

		// Agregar artistas del álbum
		if len(album.ArtistIDs) > 0 {
			artistIDs = append(artistIDs, album.ArtistIDs...)
		}

		// Agregar artistas de la canción
		if len(song.ArtistIDs) > 0 {
			// Evitar duplicados
			for _, artistID := range song.ArtistIDs {
				exists := false
				for _, existingID := range artistIDs {
					if existingID == artistID {
						exists = true
						break
					}
				}
				if !exists {
					artistIDs = append(artistIDs, artistID)
				}
			}
		}

		if len(artistIDs) > 0 {
			artistCursor, err := artistCollection.Find(ctx, bson.M{"_id": bson.M{"$in": artistIDs}})
			if err == nil {
				if err := artistCursor.All(ctx, &artists); err != nil {
					log.Printf("Error al decodificar artistas para canción %s: %v", song.ID.Hex(), err)
				}
				artistCursor.Close(ctx)
			} else {
				log.Printf("Error al buscar artistas para canción %s: %v", song.ID.Hex(), err)
			}
		}

		songsWithDetails = append(songsWithDetails, models.SongWithDetails{
			Song:    song,
			Album:   album,
			Artists: artists,
		})
	}

	return songsWithDetails, nil
}

// CountSongs cuenta el número total de canciones en la base de datos
func (s *MusicService) CountSongs(ctx context.Context) (int64, error) {
	collection := s.db.Collection("songs")
	return collection.CountDocuments(ctx, bson.M{})
}

// GetSong obtiene una canción por ID
func (s *MusicService) GetSong(ctx context.Context, id string) (*models.SongWithDetails, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	collection := s.db.Collection("songs")
	var song models.Song

	if err := collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&song); err != nil {
		return nil, err
	}

	// Obtener detalles del álbum
	albumCollection := s.db.Collection("albums")
	var album models.Album
	if err := albumCollection.FindOne(ctx, bson.M{"_id": song.AlbumID}).Decode(&album); err != nil {
		return nil, err
	}

	// Obtener detalles de los artistas
	artistCollection := s.db.Collection("artists")

	// Combinar artistas del álbum y de la canción
	var artistIDs []primitive.ObjectID

	// Agregar artistas del álbum si hay
	if len(album.ArtistIDs) > 0 {
		artistIDs = append(artistIDs, album.ArtistIDs...)
	}

	// Agregar artistas directos de la canción si hay
	if len(song.ArtistIDs) > 0 {
		// Verificar si ya existen para no duplicar
		for _, artistID := range song.ArtistIDs {
			exists := false
			for _, existingID := range artistIDs {
				if existingID == artistID {
					exists = true
					break
				}
			}
			if !exists {
				artistIDs = append(artistIDs, artistID)
			}
		}
	}

	// Si no hay artistas, devolver lista vacía
	var artists []models.Artist
	if len(artistIDs) > 0 {
		cursor, err := artistCollection.Find(ctx, bson.M{"_id": bson.M{"$in": artistIDs}})
		if err != nil {
			return nil, err
		}
		defer cursor.Close(ctx)

		if err := cursor.All(ctx, &artists); err != nil {
			return nil, err
		}
	}

	return &models.SongWithDetails{
		Song:    song,
		Album:   album,
		Artists: artists,
	}, nil
}

// SearchSongsByName busca canciones por nombre
func (s *MusicService) SearchSongsByName(ctx context.Context, name string) ([]models.SongWithDetails, error) {
	filter := bson.M{"title": bson.M{"$regex": name, "$options": "i"}}
	cursor, err := s.GetSongCollection().Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var songs []models.Song
	if err := cursor.All(ctx, &songs); err != nil {
		return nil, err
	}

	var result []models.SongWithDetails
	for _, song := range songs {
		// Obtener detalles del álbum
		album, err := s.GetAlbumByID(ctx, song.AlbumID)
		if err != nil {
			continue
		}
		// Obtener detalles de los artistas
		artistCollection := s.db.Collection("artists")
		artistCursor, err := artistCollection.Find(ctx, bson.M{"_id": bson.M{"$in": album.ArtistIDs}})
		if err != nil {
			continue
		}
		var artists []models.Artist
		if err := artistCursor.All(ctx, &artists); err != nil {
			continue
		}
		result = append(result, models.SongWithDetails{
			Song:    song,
			Album:   *album,
			Artists: artists,
		})
	}
	return result, nil
}

// GetAlbums returns all albums from the database
func (s *MusicService) GetAlbums(ctx context.Context) ([]models.Album, error) {
	collection := s.db.Collection("albums")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var albums []models.Album
	if err := cursor.All(ctx, &albums); err != nil {
		return nil, err
	}

	return albums, nil
}

// GetAlbum obtiene un álbum por ID con todos sus detalles
func (s *MusicService) GetAlbum(ctx context.Context, id string) (*models.AlbumWithDetails, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	// Obtener el álbum
	albumCollection := s.db.Collection("albums")
	var album models.Album
	if err := albumCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&album); err != nil {
		return nil, err
	}

	// Obtener las canciones del álbum
	songCollection := s.db.Collection("songs")
	songCursor, err := songCollection.Find(ctx, bson.M{"album_id": objectID})
	if err != nil {
		return nil, err
	}
	defer songCursor.Close(ctx)

	var songs []models.Song
	if err := songCursor.All(ctx, &songs); err != nil {
		return nil, err
	}

	// Obtener los artistas del álbum
	artistCollection := s.db.Collection("artists")
	var artists []models.Artist
	if len(album.ArtistIDs) > 0 {
		artistCursor, err := artistCollection.Find(ctx, bson.M{"_id": bson.M{"$in": album.ArtistIDs}})
		if err != nil {
			return nil, err
		}
		defer artistCursor.Close(ctx)

		if err := artistCursor.All(ctx, &artists); err != nil {
			return nil, err
		}
	}

	return &models.AlbumWithDetails{
		Album:   album,
		Songs:   songs,
		Artists: artists,
	}, nil
}

// GetAlbumByID obtiene un álbum por su ID
func (s *MusicService) GetAlbumByID(ctx context.Context, id primitive.ObjectID) (*models.Album, error) {
	collection := s.db.Collection("albums")

	var album models.Album
	if err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&album); err != nil {
		return nil, err
	}

	return &album, nil
}

// GetArtists obtiene todos los artistas
func (s *MusicService) GetArtists(ctx context.Context, limit, skip int) ([]models.Artist, error) {
	collection := s.db.Collection("artists")

	findOptions := options.Find()
	findOptions.SetLimit(int64(limit))
	findOptions.SetSkip(int64(skip))
	findOptions.SetSort(bson.D{{Key: "name", Value: 1}})

	cursor, err := collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var artists []models.Artist
	if err := cursor.All(ctx, &artists); err != nil {
		return nil, err
	}

	return artists, nil
}

// GetArtist obtiene un artista por ID
func (s *MusicService) GetArtist(ctx context.Context, id string) (*models.ArtistWithDetails, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	collection := s.db.Collection("artists")
	var artist models.Artist

	if err := collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&artist); err != nil {
		return nil, err
	}

	// Primero, buscar canciones asociadas directamente al artista
	songCollection := s.db.Collection("songs")
	songCursor, err := songCollection.Find(ctx, bson.M{"artist_ids": objectID})
	if err != nil {
		return nil, err
	}
	defer songCursor.Close(ctx)

	var artistSongs []models.Song
	if err := songCursor.All(ctx, &artistSongs); err != nil {
		return nil, err
	}

	// Obtener IDs de álbumes de esas canciones
	albumIDsMap := make(map[primitive.ObjectID]bool)
	for _, song := range artistSongs {
		albumIDsMap[song.AlbumID] = true
	}

	// Convertir el mapa a un slice para la consulta
	var albumIDsFromSongs []primitive.ObjectID
	for albumID := range albumIDsMap {
		albumIDsFromSongs = append(albumIDsFromSongs, albumID)
	}

	// Obtener álbumes del artista (tanto por relación directa como por canciones)
	albumCollection := s.db.Collection("albums")
	var albumsQuery bson.M

	// Si tenemos IDs de álbumes de las canciones, incluirlos en la consulta
	if len(albumIDsFromSongs) > 0 {
		albumsQuery = bson.M{
			"$or": []bson.M{
				{"artist_ids": objectID},                  // Álbumes directamente relacionados con el artista
				{"_id": bson.M{"$in": albumIDsFromSongs}}, // Álbumes de las canciones del artista
			},
		}
	} else {
		albumsQuery = bson.M{"artist_ids": objectID}
	}

	albumCursor, err := albumCollection.Find(ctx, albumsQuery)
	if err != nil {
		return nil, err
	}
	defer albumCursor.Close(ctx)

	var albums []models.Album
	if err := albumCursor.All(ctx, &albums); err != nil {
		return nil, err
	}

	// Obtener canciones del artista (tanto por álbum como por asociación directa)
	var albumIDs []primitive.ObjectID
	for _, album := range albums {
		albumIDs = append(albumIDs, album.ID)
	}

	// Reutilizamos la colección de canciones ya declarada anteriormente

	// Consulta para obtener canciones ya sea por álbum o por relación directa con el artista
	var songFilter bson.M

	if len(albumIDs) > 0 {
		// Si hay álbumes, buscar canciones por álbum o por artista directamente
		songFilter = bson.M{
			"$or": []bson.M{
				{"album_id": bson.M{"$in": albumIDs}},
				{"artist_ids": objectID},
			},
		}
	} else {
		// Si no hay álbumes, buscar solo por artista directamente
		songFilter = bson.M{
			"artist_ids": objectID,
		}
	}

	var songs []models.Song
	songCursor, err = songCollection.Find(ctx, songFilter)
	if err != nil {
		return nil, err
	}
	defer songCursor.Close(ctx)

	if err := songCursor.All(ctx, &songs); err != nil {
		return nil, err
	}

	return &models.ArtistWithDetails{
		Artist: artist,
		Albums: albums,
		Songs:  songs,
	}, nil
}

// GetArtistByID obtiene un artista por su ID
func (s *MusicService) GetArtistByID(ctx context.Context, id primitive.ObjectID) (*models.Artist, error) {
	collection := s.db.Collection("artists")

	var artist models.Artist
	if err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&artist); err != nil {
		return nil, err
	}

	return &artist, nil
}

// GetCategories obtiene todas las categorías
func (s *MusicService) GetCategories(ctx context.Context) ([]models.Category, error) {
	collection := s.db.Collection("categories")

	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "name", Value: 1}})

	cursor, err := collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var categories []models.Category
	if err := cursor.All(ctx, &categories); err != nil {
		return nil, err
	}

	return categories, nil
}

// ImportAlbumFromSpotify importa un álbum de Spotify
func (s *MusicService) ImportAlbumFromSpotify(ctx context.Context, spotifyID string) (*models.Album, error) {
	// Verificar si ya existe el álbum
	albumCollection := s.db.Collection("albums")
	var existingAlbum models.Album
	err := albumCollection.FindOne(ctx, bson.M{"spotify_id": spotifyID}).Decode(&existingAlbum)
	if err == nil {
		return &existingAlbum, nil // El álbum ya existe
	} else if err != mongo.ErrNoDocuments {
		return nil, err
	}

	// Obtener álbum de Spotify
	albumData, err := s.spotifyService.GetAlbum(ctx, spotifyID)
	if err != nil {
		return nil, err
	}

	// Procesar artistas
	var artistIDs []primitive.ObjectID
	artistCollection := s.db.Collection("artists")

	for _, spotifyArtist := range albumData.Artists {
		// Verificar si el artista ya existe
		var existingArtist models.Artist
		err := artistCollection.FindOne(ctx, bson.M{"spotify_id": string(spotifyArtist.ID)}).Decode(&existingArtist)

		if err == nil {
			// El artista ya existe
			artistIDs = append(artistIDs, existingArtist.ID)
		} else if err == mongo.ErrNoDocuments {
			// Obtener detalles del artista
			artistData, err := s.spotifyService.GetArtist(ctx, string(spotifyArtist.ID))
			if err != nil {
				continue
			}

			// Crear el artista
			artist := s.spotifyService.ConvertSpotifyArtistToModel(artistData)
			insertResult, err := artistCollection.InsertOne(ctx, artist)
			if err != nil {
				return nil, err
			}

			artistID, ok := insertResult.InsertedID.(primitive.ObjectID)
			if !ok {
				return nil, errors.New("failed to get inserted artist ID")
			}
			artistIDs = append(artistIDs, artistID)
		} else {
			return nil, err
		}
	}

	// Crear el álbum
	album := s.spotifyService.ConvertSpotifyAlbumToModel(albumData)
	album.ArtistIDs = artistIDs

	insertResult, err := albumCollection.InsertOne(ctx, album)
	if err != nil {
		return nil, err
	}

	albumID, ok := insertResult.InsertedID.(primitive.ObjectID)
	if !ok {
		return nil, errors.New("failed to get inserted album ID")
	}
	album.ID = albumID

	// Procesar canciones
	songCollection := s.db.Collection("songs")
	for _, track := range albumData.Tracks.Tracks {
		song := s.spotifyService.ConvertSpotifyTrackToModel(track, albumID, artistIDs)
		_, err := songCollection.InsertOne(ctx, song)
		if err != nil {
			log.Printf("Error inserting song %s: %v", track.Name, err)
		}
	}

	return &album, nil
}

// SearchAlbumsInSpotify busca álbumes en Spotify
func (s *MusicService) SearchAlbumsInSpotify(ctx context.Context, query string, limit int) ([]spotify.SimpleAlbum, error) {
	if s.spotifyService == nil {
		return nil, fmt.Errorf("Spotify service not available")
	}

	// Crear cliente de Spotify
	results, err := s.spotifyService.Client().Search(ctx, query, spotify.SearchTypeAlbum, spotify.Limit(limit))
	if err != nil {
		return nil, err
	}

	if results.Albums == nil || len(results.Albums.Albums) == 0 {
		return []spotify.SimpleAlbum{}, nil
	}

	return results.Albums.Albums, nil
}

// CountSongsByAlbumID cuenta el número de canciones de un álbum
func (s *MusicService) CountSongsByAlbumID(ctx context.Context, albumID primitive.ObjectID) (int, error) {
	collection := s.db.Collection("songs")

	count, err := collection.CountDocuments(ctx, bson.M{"album_id": albumID})
	if err != nil {
		return 0, err
	}

	return int(count), nil
}

// GetGenres obtiene todos los géneros musicales desde la base de datos
func (s *MusicService) GetGenres(ctx context.Context) ([]map[string]interface{}, error) {
	collection := s.db.Collection("genres")

	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "name", Value: 1}})

	cursor, err := collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var genreModels []models.Genre
	if err := cursor.All(ctx, &genreModels); err != nil {
		return nil, err
	}

	// Convertir los modelos de género a la estructura simplificada
	var genres []map[string]interface{}
	for _, genre := range genreModels {
		// Asegurarse de que el slug nunca esté vacío
		slug := genre.Slug
		if slug == "" {
			slug = slugify(genre.Name)

			// Actualizar el slug en la base de datos si está vacío
			_, err := collection.UpdateOne(
				ctx,
				bson.M{"_id": genre.ID},
				bson.M{"$set": bson.M{"slug": slug, "updated_at": time.Now()}},
			)
			if err != nil {
				log.Printf("Error al actualizar el slug del género %s: %v", genre.Name, err)
			}
		}

		// Formato simplificado con solo los campos requeridos
		genres = append(genres, map[string]interface{}{
			"id":    genre.ID.Hex(),
			"name":  genre.Name,
			"slug":  slug,
			"count": genre.Count,
		})
	}

	return genres, nil
}

// GetGenreByID obtiene un género por su ID desde la base de datos
func (s *MusicService) GetGenreByID(ctx context.Context, genreID string) (map[string]interface{}, error) {
	objectID, err := primitive.ObjectIDFromHex(genreID)
	if err != nil {
		return nil, fmt.Errorf("ID de género inválido: %v", err)
	}

	collection := s.db.Collection("genres")
	var genre models.Genre

	if err := collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&genre); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("género no encontrado")
		}
		return nil, err
	}

	// Asegurarse de que el slug nunca esté vacío
	slug := genre.Slug
	if slug == "" {
		slug = slugify(genre.Name)

		// Actualizar el slug en la base de datos si está vacío
		_, err := collection.UpdateOne(
			ctx,
			bson.M{"_id": genre.ID},
			bson.M{"$set": bson.M{"slug": slug, "updated_at": time.Now()}},
		)
		if err != nil {
			log.Printf("Error al actualizar el slug del género %s: %v", genre.Name, err)
		}
	}

	// Formato simplificado con solo los campos requeridos
	genreMap := map[string]interface{}{
		"id":    genre.ID.Hex(),
		"name":  genre.Name,
		"slug":  slug,
		"count": genre.Count,
	}

	return genreMap, nil
}

// GetGenreBySlug obtiene un género por su slug desde la base de datos
func (s *MusicService) GetGenreBySlug(ctx context.Context, slug string) (map[string]interface{}, error) {
	collection := s.db.Collection("genres")
	var genre models.Genre

	if err := collection.FindOne(ctx, bson.M{"slug": slug}).Decode(&genre); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("género no encontrado")
		}
		return nil, err
	}

	// Formato simplificado con solo los campos requeridos
	genreMap := map[string]interface{}{
		"id":    genre.ID.Hex(),
		"name":  genre.Name,
		"slug":  genre.Slug,
		"count": genre.Count,
	}

	return genreMap, nil
}

// slugify convierte un texto a formato slug
func slugify(text string) string {
	// Puedes implementar una funcionalidad más completa aquí
	// para manejar acentos, caracteres especiales, etc.
	slug := strings.ToLower(text)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "_", "-")
	return slug
}

// SaveGenres guarda los géneros de un artista en la colección de géneros
func (s *MusicService) SaveGenres(ctx context.Context, genres []string) error {
	if len(genres) == 0 {
		return nil
	}

	collection := s.db.Collection("genres")

	// Procesamos cada género
	for _, genreName := range genres {
		if genreName == "" {
			continue
		}

		// Verificar si el género ya existe
		var existingGenre models.Genre
		err := collection.FindOne(ctx, bson.M{"name": genreName}).Decode(&existingGenre)

		if err == mongo.ErrNoDocuments {
			// El género no existe, lo creamos con un slug
			slug := slugify(genreName)
			genre := models.Genre{
				Name:        genreName,
				Slug:        slug,
				Description: fmt.Sprintf("Género musical: %s", genreName),
				Count:       1,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}

			_, err := collection.InsertOne(ctx, genre)
			if err != nil {
				// Logueamos el error pero continuamos con los demás géneros
				log.Printf("Error al guardar el género %s: %v", genreName, err)
			} else {
				log.Printf("Género %s guardado correctamente", genreName)
			}
		} else if err != nil {
			// Error al buscar el género
			log.Printf("Error al verificar el género %s en la base de datos: %v", genreName, err)
		} else {
			// El género ya existe
			update := bson.M{"$inc": bson.M{"count": 1}, "$set": bson.M{"updated_at": time.Now()}}

			// Si el slug está vacío, lo generamos
			if existingGenre.Slug == "" {
				update["$set"].(bson.M)["slug"] = slugify(existingGenre.Name)
			}

			// Actualizamos el contador y, si es necesario, el slug
			_, err := collection.UpdateOne(
				ctx,
				bson.M{"_id": existingGenre.ID},
				update,
			)
			if err != nil {
				log.Printf("Error al actualizar el género %s: %v", genreName, err)
			} else {
				log.Printf("Género %s actualizado correctamente", genreName)
			}
		}
	}

	return nil
}

// GetArtistsByGenre obtiene todos los artistas que tienen un género específico
func (s *MusicService) GetArtistsByGenre(ctx context.Context, genreName string) ([]models.Artist, error) {
	collection := s.db.Collection("artists")

	// Buscar artistas que tengan el nombre del género en su array de géneros
	cursor, err := collection.Find(ctx, bson.M{"genres": genreName})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var artists []models.Artist
	if err := cursor.All(ctx, &artists); err != nil {
		return nil, err
	}

	return artists, nil
}

// GetArtistWithDetails obtiene un artista con todos sus detalles en una sola consulta
func (s *MusicService) GetArtistWithDetails(ctx context.Context, id string) (*models.ArtistWithDetails, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	// Obtener el artista
	artistCollection := s.db.Collection("artists")
	var artist models.Artist
	if err := artistCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&artist); err != nil {
		return nil, err
	}

	// Obtener todos los álbumes del artista con sus canciones
	albumCollection := s.db.Collection("albums")
	albumCursor, err := albumCollection.Find(ctx, bson.M{"artist_ids": objectID})
	if err != nil {
		return nil, err
	}
	defer albumCursor.Close(ctx)

	var albums []models.Album
	if err := albumCursor.All(ctx, &albums); err != nil {
		return nil, err
	}

	// Obtener todas las canciones de los álbumes
	songCollection := s.db.Collection("songs")
	var albumIDs []primitive.ObjectID
	for _, album := range albums {
		albumIDs = append(albumIDs, album.ID)
	}

	songCursor, err := songCollection.Find(ctx, bson.M{"album_id": bson.M{"$in": albumIDs}})
	if err != nil {
		return nil, err
	}
	defer songCursor.Close(ctx)

	var songs []models.Song
	if err := songCursor.All(ctx, &songs); err != nil {
		return nil, err
	}

	// Organizar las canciones por álbum
	albumSongs := make(map[primitive.ObjectID][]models.Song)
	for _, song := range songs {
		albumSongs[song.AlbumID] = append(albumSongs[song.AlbumID], song)
	}

	// Agregar las canciones a sus respectivos álbumes
	for i := range albums {
		albums[i].Songs = albumSongs[albums[i].ID]
	}

	return &models.ArtistWithDetails{
		Artist: artist,
		Albums: albums,
		Songs:  songs,
	}, nil
}
