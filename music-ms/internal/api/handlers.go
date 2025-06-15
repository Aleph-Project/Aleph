package api

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zmb3/spotify/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/angel/music-ms/internal/models"
	"github.com/angel/music-ms/internal/service"
)

// Handler maneja las peticiones HTTP
type Handler struct {
	musicService   *service.MusicService
	spotifyService *service.SpotifyService
}

// NewHandler crea un nuevo handler
func NewHandler(musicService *service.MusicService, spotifyService *service.SpotifyService) *Handler {
	return &Handler{
		musicService:   musicService,
		spotifyService: spotifyService,
	}
}

// Estructura para recibir la petición
type ImportArtistRequest struct {
	Artist string `json:"artist" binding:"required"`
}

// Ejemplo de función que maneja la petición POST /import_artist
func ImportArtistHandler(spotifyClient *spotify.Client, db DatabaseInterface) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req ImportArtistRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
			return
		}

		ctx := context.Background()

		// 1. Buscar artista
		searchResult, err := spotifyClient.Search(ctx, req.Artist, spotify.SearchTypeArtist)
		if err != nil || searchResult.Artists == nil || len(searchResult.Artists.Artists) == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Artist not found"})
			return
		}
		artist := searchResult.Artists.Artists[0]

		// 2. Obtener álbumes del artista
		albums, err := spotifyClient.GetArtistAlbums(ctx, artist.ID, []spotify.AlbumType{spotify.AlbumTypeAlbum}, spotify.Limit(50))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting albums"})
			return
		}

		// 3. Obtener géneros del artista (viene en el objeto artista)
		genres := artist.Genres

		// 4. Para cada álbum, obtener canciones
		var albumsData []AlbumData // define según tu modelo
		for _, album := range albums.Albums {
			tracks, err := spotifyClient.GetAlbumTracks(ctx, album.ID)
			if err != nil {
				continue // o maneja error
			}

			var trackNames []string
			for _, track := range tracks.Tracks {
				trackNames = append(trackNames, track.Name)
			}

			albumsData = append(albumsData, AlbumData{
				ID:     album.ID.String(),
				Name:   album.Name,
				Tracks: trackNames,
			})
		}

		// 5. Guardar en base de datos (aquí adapta según tu modelo)
		err = db.SaveArtistData(ArtistData{
			ID:     artist.ID.String(),
			Name:   artist.Name,
			Genres: genres,
			Albums: albumsData,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving artist data"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Artist imported successfully"})
	}
}

// ImportArtistFromSpotify maneja la petición POST /api/music/spotify/import_artist
func (h *Handler) ImportArtistFromSpotify(c *gin.Context) {
	fmt.Println("========= INICIANDO ImportArtistFromSpotify =========")
	fmt.Printf("Request: %+v\n", c.Request)

	// Verificar que el servicio de Spotify esté disponible
	if h.spotifyService == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Spotify service not available"})
		return
	}

	// Parsear la solicitud
	var req ImportArtistRequest

	// Obtener el cuerpo de la petición para debugging
	bodyBytes, _ := io.ReadAll(c.Request.Body)
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	fmt.Println("Request Body:", string(bodyBytes))

	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Println("Error de binding:", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Println("Artist:", req.Artist)

	// Crear contexto
	ctx := context.Background()

	// 1. Buscar artista en Spotify
	artists, err := h.spotifyService.SearchArtists(ctx, req.Artist, 1)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error searching for artist", "details": err.Error()})
		return
	}

	if len(artists) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artist not found"})
		return
	}

	// Obtener el primer artista de los resultados
	artist := artists[0]

	// 2. Obtener álbumes del artista
	artistAlbums, err := h.spotifyService.GetArtistAlbums(ctx, string(artist.ID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting artist albums", "details": err.Error()})
		return
	}

	if len(artistAlbums) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message": "Artist found but has no albums",
			"artist": map[string]interface{}{
				"id":   string(artist.ID),
				"name": artist.Name,
			},
		})
		return
	}

	// 3. Procesar el artista
	artistModel := h.spotifyService.ConvertSpotifyArtistToModel(&artist)

	// Guardar el artista en la base de datos
	artistCollection := h.musicService.GetArtistCollection()
	var existingArtist models.Artist
	err = artistCollection.FindOne(ctx, map[string]string{"spotify_id": string(artist.ID)}).Decode(&existingArtist)

	var artistID primitive.ObjectID
	if err == mongo.ErrNoDocuments {
		// El artista no existe, insertarlo
		result, err := artistCollection.InsertOne(ctx, artistModel)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving artist", "details": err.Error()})
			return
		}
		artistID = result.InsertedID.(primitive.ObjectID)

		// Guardar los géneros del artista como documentos independientes
		if len(artistModel.Genres) > 0 {
			fmt.Printf("Guardando %d géneros del artista: %v\n", len(artistModel.Genres), artistModel.Genres)
			if err := h.musicService.SaveGenres(ctx, artistModel.Genres); err != nil {
				fmt.Printf("Error al guardar los géneros: %v\n", err)
				// No detenemos el proceso por un error en los géneros
			}
		}
	} else if err != nil {
		// Error al buscar el artista
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking artist in database", "details": err.Error()})
		return
	} else {
		// El artista ya existe
		artistID = existingArtist.ID

		// Asegurarnos de que los géneros estén actualizados en la base de datos
		if len(artistModel.Genres) > 0 && !genresEqual(existingArtist.Genres, artistModel.Genres) {
			fmt.Printf("Actualizando géneros del artista: %v\n", artistModel.Genres)
			if err := h.musicService.SaveGenres(ctx, artistModel.Genres); err != nil {
				fmt.Printf("Error al actualizar los géneros: %v\n", err)
				// No detenemos el proceso por un error en los géneros
			}
		}
	}

	// 4. Importar los álbumes del artista
	var importedAlbums []map[string]interface{}
	for _, spotifyAlbum := range artistAlbums {
		// Obtener detalles completos del álbum desde Spotify
		fullAlbum, err := h.spotifyService.GetAlbum(ctx, string(spotifyAlbum.ID))
		if err != nil {
			fmt.Printf("Error obteniendo detalles del álbum %s: %v\n", spotifyAlbum.Name, err)
			continue
		}

		// Convertir el álbum de Spotify al modelo de la aplicación
		albumModel := h.spotifyService.ConvertSpotifyAlbumToModel(fullAlbum)
		albumModel.ArtistIDs = []primitive.ObjectID{artistID}

		// Verificar si el álbum ya existe
		albumCollection := h.musicService.GetAlbumCollection()
		var existingAlbum models.Album
		err = albumCollection.FindOne(ctx, map[string]string{"spotify_id": string(spotifyAlbum.ID)}).Decode(&existingAlbum)

		var albumID primitive.ObjectID
		if err == mongo.ErrNoDocuments {
			// El álbum no existe, insertarlo
			result, err := albumCollection.InsertOne(ctx, albumModel)
			if err != nil {
				fmt.Printf("Error al guardar el álbum %s: %v\n", albumModel.Title, err)
				continue
			}
			albumID = result.InsertedID.(primitive.ObjectID)
		} else if err != nil {
			// Error al buscar el álbum
			fmt.Printf("Error al verificar el álbum %s en la base de datos: %v\n", albumModel.Title, err)
			continue
		} else {
			// El álbum ya existe
			albumID = existingAlbum.ID
		}

		// Guardar las pistas del álbum
		songCollection := h.musicService.GetSongCollection()
		for _, track := range fullAlbum.Tracks.Tracks {
			song := h.spotifyService.ConvertSpotifyTrackToModel(track, albumID, []primitive.ObjectID{artistID})

			// Verificar si la canción ya existe
			var existingSong models.Song
			err = songCollection.FindOne(ctx, map[string]string{"spotify_id": string(track.ID)}).Decode(&existingSong)
			if err == mongo.ErrNoDocuments {
				// La canción no existe, insertarla
				_, err := songCollection.InsertOne(ctx, song)
				if err != nil {
					fmt.Printf("Error al guardar la canción %s: %v\n", song.Title, err)
				} else {
					fmt.Printf("Canción guardada correctamente: %s\n", song.Title)
				}
			} else if err != nil {
				// Error al buscar la canción
				fmt.Printf("Error al verificar la canción %s en la base de datos: %v\n", song.Title, err)
			} else {
				// La canción ya existe, pero actualizamos los artistas si es necesario
				if len(existingSong.ArtistIDs) == 0 || !containsObjectID(existingSong.ArtistIDs, artistID) {
					existingSong.ArtistIDs = append(existingSong.ArtistIDs, artistID)
					_, err := songCollection.ReplaceOne(ctx, map[string]string{"spotify_id": string(track.ID)}, existingSong)
					if err != nil {
						fmt.Printf("Error al actualizar los artistas para la canción %s: %v\n", existingSong.Title, err)
					}
				}
				fmt.Printf("La canción %s ya existe en la base de datos\n", song.Title)
			}
		}

		importedAlbums = append(importedAlbums, map[string]interface{}{
			"id":    albumID.Hex(),
			"title": albumModel.Title,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Artist imported successfully",
		"artist": map[string]interface{}{
			"id":   artistID.Hex(),
			"name": artist.Name,
		},
		"albums_imported": len(importedAlbums),
		"albums":          importedAlbums,
	})
}

// SearchAlbumsInSpotify maneja la petición para buscar álbumes en Spotify
func (h *Handler) SearchAlbumsInSpotify(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	// Obtener el límite de resultados (opcional, por defecto 10)
	limit := 10
	// Intentar convertir el valor del parámetro limit si está presente
	if limitParam := c.Query("limit"); limitParam != "" {
		if parsedLimit, err := strconv.Atoi(limitParam); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	// Crear contexto
	ctx := context.Background()

	// Buscar álbumes en Spotify
	albums, err := h.musicService.SearchAlbumsInSpotify(ctx, query, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error searching albums in Spotify", "details": err.Error()})
		return
	}

	// Formatear la respuesta
	var albumsResponse []map[string]interface{}
	for _, album := range albums {
		var imageURL string
		if len(album.Images) > 0 {
			imageURL = album.Images[0].URL
		}

		albumsResponse = append(albumsResponse, map[string]interface{}{
			"id":        string(album.ID),
			"name":      album.Name,
			"artist":    album.Artists[0].Name,
			"image_url": imageURL,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"albums": albumsResponse,
	})
}

// ImportAlbumFromSpotify maneja la petición para importar un álbum de Spotify
func (h *Handler) ImportAlbumFromSpotify(c *gin.Context) {
	// Estructura para recibir el ID del álbum
	type ImportAlbumRequest struct {
		AlbumID string `json:"album_id" binding:"required"`
	}

	var req ImportAlbumRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verificar que el servicio de Spotify esté disponible
	if h.spotifyService == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Spotify service not available"})
		return
	}

	// Crear contexto
	ctx := context.Background()

	// 1. Obtener el álbum de Spotify con todas sus canciones incluidas
	album, err := h.spotifyService.Client().GetAlbum(ctx, spotify.ID(req.AlbumID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting album from Spotify", "details": err.Error()})
		return
	}

	// 2. Buscar o crear el artista del álbum primero
	// Tomamos el primer artista del álbum como el artista principal
	if len(album.Artists) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Album doesn't have artists information"})
		return
	}

	// Obtener información completa del artista
	spotifyArtist, err := h.spotifyService.Client().GetArtist(ctx, album.Artists[0].ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting artist from Spotify", "details": err.Error()})
		return
	}

	// Convertir el artista al modelo de la aplicación
	artistModel := h.spotifyService.ConvertSpotifyArtistToModel(spotifyArtist)

	// Buscar si el artista ya existe en la base de datos
	artistCollection := h.musicService.GetArtistCollection()
	var existingArtist models.Artist
	var artistID primitive.ObjectID

	err = artistCollection.FindOne(ctx, map[string]string{"spotify_id": string(spotifyArtist.ID)}).Decode(&existingArtist)
	if err == mongo.ErrNoDocuments {
		// El artista no existe, insertarlo
		result, err := artistCollection.InsertOne(ctx, artistModel)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving artist", "details": err.Error()})
			return
		}
		artistID = result.InsertedID.(primitive.ObjectID)

		// Guardar los géneros del artista como documentos independientes
		if len(artistModel.Genres) > 0 {
			if err := h.musicService.SaveGenres(ctx, artistModel.Genres); err != nil {
				// Solo logueamos el error, no interrumpimos el proceso
				fmt.Printf("Error al guardar los géneros: %v\n", err)
			}
		}
	} else if err != nil {
		// Error al buscar el artista
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking artist in database", "details": err.Error()})
		return
	} else {
		// El artista ya existe
		artistID = existingArtist.ID
	}

	// 3. Convertir el álbum al modelo de la aplicación y asignarle el artista
	albumModel := h.spotifyService.ConvertSpotifyAlbumToModel(album)
	albumModel.ArtistIDs = []primitive.ObjectID{artistID} // Asignar el artista al álbum

	// 4. Guardar el álbum en la base de datos
	albumCollection := h.musicService.GetAlbumCollection()
	var existingAlbum models.Album
	err = albumCollection.FindOne(ctx, map[string]string{"spotify_id": req.AlbumID}).Decode(&existingAlbum)

	var albumID primitive.ObjectID
	if err == mongo.ErrNoDocuments {
		// El álbum no existe, insertarlo
		result, err := albumCollection.InsertOne(ctx, albumModel)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving album", "details": err.Error()})
			return
		}
		albumID = result.InsertedID.(primitive.ObjectID)
	} else if err != nil {
		// Error al buscar el álbum
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking album in database", "details": err.Error()})
		return
	} else {
		// El álbum ya existe, actualizar sus artistas si es necesario
		albumID = existingAlbum.ID

		// Verificar si el artistID ya está en la lista de artistas del álbum
		artistExistsInAlbum := false
		for _, id := range existingAlbum.ArtistIDs {
			if id == artistID {
				artistExistsInAlbum = true
				break
			}
		}

		// Si el artista no está asociado al álbum, añadirlo
		if !artistExistsInAlbum {
			existingAlbum.ArtistIDs = append(existingAlbum.ArtistIDs, artistID)
			_, err := albumCollection.UpdateOne(
				ctx,
				bson.M{"_id": existingAlbum.ID},
				bson.M{"$set": bson.M{"artist_ids": existingAlbum.ArtistIDs}},
			)
			if err != nil {
				fmt.Printf("Error al actualizar los artistas del álbum %s: %v\n", existingAlbum.Title, err)
			} else {
				fmt.Printf("Artista %s agregado al álbum %s\n", artistModel.Name, existingAlbum.Title)
			}
		}
	}

	// 5. Importar las canciones del álbum
	var importedTracks []string
	songCollection := h.musicService.GetSongCollection()

	for _, track := range album.Tracks.Tracks {
		// Convertir la pista al modelo de canción
		song := h.spotifyService.ConvertSpotifyTrackToModel(track, albumID, []primitive.ObjectID{artistID})

		// Verificar si la canción ya existe
		var existingSong models.Song
		err = songCollection.FindOne(ctx, map[string]string{"spotify_id": string(track.ID)}).Decode(&existingSong)
		if err == mongo.ErrNoDocuments {
			// La canción no existe, insertarla
			_, err := songCollection.InsertOne(ctx, song)
			if err != nil {
				fmt.Printf("Error al guardar la canción %s: %v\n", song.Title, err)
			} else {
				importedTracks = append(importedTracks, song.Title)
				fmt.Printf("Canción guardada correctamente: %s\n", song.Title)
			}
		} else if err != nil {
			// Error al buscar la canción
			fmt.Printf("Error al verificar la canción %s en la base de datos: %v\n", song.Title, err)
		} else {
			// La canción ya existe, pero actualizamos los artistas si es necesario
			if len(existingSong.ArtistIDs) == 0 || !containsObjectID(existingSong.ArtistIDs, artistID) {
				existingSong.ArtistIDs = append(existingSong.ArtistIDs, artistID)
				_, err := songCollection.ReplaceOne(ctx, map[string]string{"spotify_id": string(track.ID)}, existingSong)
				if err != nil {
					fmt.Printf("Error al actualizar los artistas para la canción %s: %v\n", existingSong.Title, err)
				}
			}
			importedTracks = append(importedTracks, song.Title)
			fmt.Printf("La canción %s ya existe en la base de datos\n", song.Title)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Album imported successfully",
		"album": map[string]interface{}{
			"id":   albumID.Hex(),
			"name": album.Name,
			"artist": map[string]interface{}{
				"id":   artistID.Hex(),
				"name": artistModel.Name,
			},
		},
		"tracks_imported": len(importedTracks),
	})
}

// GetSongs maneja la petición para obtener todas las canciones
func (h *Handler) GetSongs(c *gin.Context) {
	// Obtener el contexto de la petición
	ctx := c.Request.Context()

	fmt.Println("Iniciando GetSongs - Obteniendo todas las canciones")

	// Obtener parámetros de paginación (opcionales)
	var limit int
	skip := 0 // valor por defecto

	// Verificar si se solicita "all" para traer todas las canciones
	if c.Query("all") == "true" {
		// Si se solicita all=true, no establecemos límite (pasamos 0)
		limit = 0
		fmt.Println("Solicitando TODAS las canciones (sin límite)")

		// Obtener el número total de canciones para información
		totalSongs, err := h.musicService.CountSongs(ctx)
		if err != nil {
			fmt.Printf("Error al contar las canciones: %v\n", err)
		} else {
			fmt.Printf("Hay un total de %d canciones en la base de datos\n", totalSongs)
		}
	} else {
		// Valor por defecto cuando no se solicita "all"
		limit = 100000

		// Intentar convertir los parámetros de consulta si están presentes
		if limitParam := c.Query("limit"); limitParam != "" {
			if parsedLimit, err := strconv.Atoi(limitParam); err == nil && parsedLimit > 0 {
				limit = parsedLimit
			}
		}
	}

	// Configurar el desplazamiento (skip)
	if skipParam := c.Query("skip"); skipParam != "" {
		if parsedSkip, err := strconv.Atoi(skipParam); err == nil && parsedSkip >= 0 {
			skip = parsedSkip
		}
	}

	fmt.Printf("Parámetros de paginación: limit=%d, skip=%d\n", limit, skip)

	// Llamar al servicio para obtener las canciones
	songs, err := h.musicService.GetSongs(ctx, limit, skip)
	if err != nil {
		fmt.Printf("Error al obtener las canciones: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener las canciones: " + err.Error()})
		return
	}

	fmt.Printf("Se encontraron %d canciones en la consulta\n", len(songs))

	// Formatear las canciones según el formato requerido
	var formattedSongs []map[string]interface{}
	for i, song := range songs {
		fmt.Printf("Procesando canción #%d: ID=%s, Título=%s\n", i+1, song.ID.Hex(), song.Title)

		var albumTitle, albumReleaseDate, coverURL string
		var artistName string
		var artistNames []string

		// Obtener información del álbum
		album, err := h.musicService.GetAlbumByID(ctx, song.AlbumID)
		if err != nil {
			fmt.Printf("No se pudo obtener el álbum para la canción %s: %v\n", song.Title, err)
			// Usar valores por defecto para álbum
			albumTitle = "Desconocido"
			albumReleaseDate = "2000-01-01"
			coverURL = ""
		} else {
			albumTitle = album.Title
			albumReleaseDate = album.ReleaseDate
			coverURL = album.ImageURL

			// Determinar qué IDs de artistas usar
			// Primero intentamos usar los artistas asociados directamente a la canción
			if song.ArtistIDs != nil && len(song.ArtistIDs) > 0 {
				artistInfo, err := h.musicService.GetArtistByID(ctx, song.ArtistIDs[0])
				if err != nil {
					fmt.Printf("No se pudo obtener el artista para la canción %s: %v\n", song.Title, err)
					// Como fallback, intentamos con los artistas del álbum
					if len(album.ArtistIDs) > 0 {
						artistInfo, err := h.musicService.GetArtistByID(ctx, album.ArtistIDs[0])
						if err != nil {
							artistName = "Desconocido"
							artistNames = []string{"Desconocido"}
						} else {
							artistName = artistInfo.Name
							artistNames = []string{artistInfo.Name}
						}
					} else {
						artistName = "Desconocido"
						artistNames = []string{"Desconocido"}
					}
				} else {
					artistName = artistInfo.Name
					artistNames = []string{artistInfo.Name}

					// Si hay más de un artista, agregar todos sus nombres
					if len(song.ArtistIDs) > 1 {
						for i := 1; i < len(song.ArtistIDs); i++ {
							additionalArtist, err := h.musicService.GetArtistByID(ctx, song.ArtistIDs[i])
							if err == nil {
								artistNames = append(artistNames, additionalArtist.Name)
							}
						}
					}
				}
			} else if len(album.ArtistIDs) > 0 {
				// Si la canción no tiene artistas asociados directamente, usar los del álbum
				artistInfo, err := h.musicService.GetArtistByID(ctx, album.ArtistIDs[0])
				if err != nil {
					fmt.Printf("No se pudo obtener el artista para el álbum %s: %v\n", album.Title, err)
					artistName = "Desconocido"
					artistNames = []string{"Desconocido"}
				} else {
					artistName = artistInfo.Name
					artistNames = []string{artistInfo.Name}
				}
			} else {
				artistName = "Desconocido"
				artistNames = []string{"Desconocido"}
			}
		}

		// Formatear la duración como string "M:SS"
		minutes := song.Duration / 60
		seconds := song.Duration % 60
		durationStr := fmt.Sprintf("%d:%02d", minutes, seconds)

		// Crear el objeto formateado de la canción
		formattedSong := map[string]interface{}{
			"_id":                song.ID.Hex(),
			"title":              song.Title,
			"album":              albumTitle,
			"album_id":           song.AlbumID.Hex(),
			"artist":             artistName,
			"audio_content_type": nil,
			"audio_file_id":      nil,
			"audio_filename":     nil,
			"audio_fingerprint":  nil,
			"audio_size":         nil,
			"authors":            artistNames,
			"cover_url":          coverURL,
			"created_at":         song.CreatedAt.Format(time.RFC3339),
			"duration":           durationStr,
			"genre":              "Indie",                     // Valor por defecto, puedes obtener el género real si lo tienes
			"likes":              100000 + rand.Intn(900000),  // Valor aleatorio para simular likes
			"plays":              500000 + rand.Intn(1500000), // Valor aleatorio para simular reproducciones
			"release_date":       albumReleaseDate,
			"spotify_id":         song.SpotifyID,
			"updated_at":         song.UpdatedAt.Format(time.RFC3339),
		}

		formattedSongs = append(formattedSongs, formattedSong)
		fmt.Printf("Canción %s formateada correctamente\n", song.Title)
	}

	fmt.Printf("Se devuelven %d canciones formateadas\n", len(formattedSongs))
	c.JSON(http.StatusOK, formattedSongs)
}

// GetSong maneja la petición para obtener una canción por ID
func (h *Handler) GetSong(c *gin.Context) {
	songID := c.Param("id")

	// Obtener el contexto de la petición
	ctx := c.Request.Context()

	// Validar que el ID sea un ObjectID válido
	_, err := primitive.ObjectIDFromHex(songID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de canción inválido"})
		return
	}

	// Obtener la canción de la base de datos
	songDetails, err := h.musicService.GetSong(ctx, songID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener la canción: " + err.Error()})
		return
	}

	// Formatear la duración como string "M:SS"
	minutes := songDetails.Duration / 60
	seconds := songDetails.Duration % 60
	durationStr := fmt.Sprintf("%d:%02d", minutes, seconds)

	// Obtener el primer artista asociado
	var artistName string
	if len(songDetails.Artists) > 0 {
		artistName = songDetails.Artists[0].Name
	} else {
		artistName = "Desconocido"
	}

	// Crear el objeto formateado de la canción
	formattedSong := map[string]interface{}{
		"_id":                songDetails.ID.Hex(),
		"title":              songDetails.Title,
		"album":              songDetails.Album.Title,
		"album_id":           songDetails.Album.ID.Hex(),
		"artist":             artistName,
		"audio_content_type": nil,
		"audio_file_id":      nil,
		"audio_filename":     nil,
		"audio_fingerprint":  nil,
		"audio_size":         nil,
		"authors":            []string{artistName},
		"cover_url":          songDetails.Album.ImageURL,
		"created_at":         songDetails.CreatedAt.Format(time.RFC3339),
		"duration":           durationStr,
		"genre":              "Indie",                     // Valor por defecto, puedes obtener el género real si lo tienes
		"likes":              100000 + rand.Intn(900000),  // Valor aleatorio para simular likes
		"plays":              500000 + rand.Intn(1500000), // Valor aleatorio para simular reproducciones
		"release_date":       songDetails.Album.ReleaseDate,
		"spotify_id":         songDetails.SpotifyID,
		"updated_at":         songDetails.UpdatedAt.Format(time.RFC3339),
	}

	c.JSON(http.StatusOK, formattedSong)
}

// GetSongAudio maneja la petición para obtener el audio de una canción
func (h *Handler) GetSongAudio(c *gin.Context) {
	songID := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"message": "Get song audio endpoint", "id": songID})
}

// UpdateSongAudioURL actualiza la URL del audio de una canción
func (h *Handler) UpdateSongAudioURL(c *gin.Context) {
	songID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(songID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de canción inválido"})
		return
	}

	// Obtener la URL del body
	var request struct {
		AudioURL string `json:"audio_url" binding:"required"`
		S3Key    string `json:"s3_key,omitempty"`
		S3Bucket string `json:"s3_bucket,omitempty"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL de audio requerida"})
		return
	}

	// Actualizar la canción en la base de datos
	update := bson.M{
		"$set": bson.M{
			"audio_url":  request.AudioURL,
			"updated_at": time.Now(),
		},
	}

	// Si se proporcionan datos de S3, agregarlos
	if request.S3Key != "" {
		update["$set"].(bson.M)["s3_key"] = request.S3Key
	}
	if request.S3Bucket != "" {
		update["$set"].(bson.M)["s3_bucket"] = request.S3Bucket
	}

	_, err = h.musicService.GetSongCollection().UpdateOne(
		c.Request.Context(),
		bson.M{"_id": objectID},
		update,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar la canción"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "URL de audio actualizada exitosamente",
		"audio_url": request.AudioURL,
	})
}

// GetSongByName maneja la petición para obtener una canción por su nombre
func (h *Handler) SearchSongsByName(c *gin.Context) {
	name := c.Query("name")
	if name == "" {
		c.JSON(400, gin.H{"error": "El parámetro 'name' es requerido"})
		return
	}

	ctx := c.Request.Context()
	songsDetails, err := h.musicService.SearchSongsByName(ctx, name)
	if err != nil {
		c.JSON(500, gin.H{"error": "Error al buscar canciones: " + err.Error()})
		return
	}

	if len(songsDetails) == 0 {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	var formattedSongs []map[string]interface{}
	for _, songDetails := range songsDetails {
		song := songDetails.Song
		album := songDetails.Album
		artists := songDetails.Artists

		// Primer artista
		artistName := "Desconocido"
		artistNames := []string{"Desconocido"}
		if len(artists) > 0 {
			artistName = artists[0].Name
			artistNames = []string{artists[0].Name}
		}

		// Duración formateada
		minutes := song.Duration / 60
		seconds := song.Duration % 60
		durationStr := fmt.Sprintf("%d:%02d", minutes, seconds)

		formattedSong := map[string]interface{}{
			"_id":                song.ID.Hex(),
			"title":              song.Title,
			"album":              album.Title,
			"album_id":           album.ID.Hex(),
			"artist":             artistName,
			"audio_content_type": nil,
			"audio_file_id":      nil,
			"audio_filename":     nil,
			"audio_fingerprint":  nil,
			"audio_size":         nil,
			"authors":            artistNames,
			"cover_url":          album.ImageURL,
			"created_at":         song.CreatedAt.Format(time.RFC3339),
			"duration":           durationStr,
			"genre":              "Indie", // O usa el real si lo tienes
			"likes":              100000 + rand.Intn(900000),
			"plays":              500000 + rand.Intn(1500000),
			"release_date":       album.ReleaseDate,
			"spotify_id":         song.SpotifyID,
			"updated_at":         song.UpdatedAt.Format(time.RFC3339),
		}
		formattedSongs = append(formattedSongs, formattedSong)
	}
	c.JSON(200, formattedSongs)
}

// GetAlbums maneja la petición para obtener todos los álbumes
func (h *Handler) GetAlbums(c *gin.Context) {
	// Obtener el contexto de la petición
	ctx := c.Request.Context()

	// Llamar al servicio para obtener todos los álbumes
	albums, err := h.musicService.GetAlbums(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener los álbumes: " + err.Error()})
		return
	}

	// Formatear la respuesta según el formato requerido por el frontend
	var formattedAlbums []map[string]interface{}

	for _, album := range albums {
		// Variables para información del artista
		artistName := "Desconocido"
		artistID := ""

		// Intentar obtener información del artista si hay IDs disponibles
		if len(album.ArtistIDs) > 0 {
			artistInfo, err := h.musicService.GetArtistByID(ctx, album.ArtistIDs[0])
			if err == nil && artistInfo != nil {
				artistName = artistInfo.Name
				artistID = artistInfo.SpotifyID
			}
		}

		// Contar las canciones del álbum
		songCount, err := h.musicService.CountSongsByAlbumID(ctx, album.ID)
		if err != nil {
			songCount = 0
		}

		// Formato según lo requerido
		formattedAlbum := map[string]interface{}{
			"id":           album.ID.Hex(),
			"spotify_id":   album.SpotifyID,
			"title":        album.Title,
			"artist":       artistName,
			"artist_id":    artistID,
			"release_date": album.ReleaseDate,
			"total_tracks": songCount, // Este valor podría ser diferente del número real de canciones
			"songs_count":  songCount,
			"coverUrl":     album.ImageURL,
			"album_type":   "album", // Por defecto, todos son álbumes
		}

		formattedAlbums = append(formattedAlbums, formattedAlbum)
	}

	c.JSON(http.StatusOK, formattedAlbums)
}

// GetAlbum maneja la petición para obtener un álbum por ID
func (h *Handler) GetAlbum(c *gin.Context) {
	albumID := c.Param("id")

	// Obtener el contexto de la petición
	ctx := c.Request.Context()

	// Convertir el ID a ObjectID
	objectID, err := primitive.ObjectIDFromHex(albumID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de álbum inválido"})
		return
	}

	// Obtener el álbum de la base de datos
	album, err := h.musicService.GetAlbumByID(ctx, objectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener el álbum: " + err.Error()})
		return
	}

	// Obtener información del artista
	artistInfo, err := h.musicService.GetArtistByID(ctx, album.ArtistIDs[0])
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener el artista: " + err.Error()})
		return
	}

	// Contar las canciones del álbum
	songCount, err := h.musicService.CountSongsByAlbumID(ctx, album.ID)
	if err != nil {
		songCount = 0
	}

	// Formato según lo requerido
	formattedAlbum := map[string]interface{}{
		"id":           album.ID.Hex(),
		"spotify_id":   album.SpotifyID,
		"title":        album.Title,
		"artist":       artistInfo.Name,
		"artist_id":    artistInfo.SpotifyID,
		"release_date": album.ReleaseDate,
		"total_tracks": songCount,
		"songs_count":  songCount,
		"coverUrl":     album.ImageURL,
		"album_type":   "album", // Por defecto, todos son álbumes
	}

	c.JSON(http.StatusOK, formattedAlbum)
}

// GetArtists maneja la petición para obtener todos los artistas
func (h *Handler) GetArtists(c *gin.Context) {
	// Obtener el contexto de la petición
	ctx := c.Request.Context()

	// Obtener parámetros de paginación (opcionales)
	limit := 20 // valor por defecto
	skip := 0   // valor por defecto

	// Intentar convertir los parámetros de consulta si están presentes
	if limitParam := c.Query("limit"); limitParam != "" {
		if parsedLimit, err := strconv.Atoi(limitParam); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	if skipParam := c.Query("skip"); skipParam != "" {
		if parsedSkip, err := strconv.Atoi(skipParam); err == nil && parsedSkip >= 0 {
			skip = parsedSkip
		}
	}

	// Llamar al servicio para obtener los artistas
	artists, err := h.musicService.GetArtists(ctx, limit, skip)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener los artistas: " + err.Error()})
		return
	}

	// Formatear respuesta según el formato requerido por el frontend
	var formattedArtists []map[string]interface{}
	for _, artist := range artists {
		// Para cada artista, creamos un nuevo objeto con el formato requerido
		formattedArtist := map[string]interface{}{
			"id":         artist.ID.Hex(), // ID interno de MongoDB
			"spotify_id": artist.SpotifyID,
			"name":       artist.Name,
			"image_url":  artist.ImageURL,
			"genres":     artist.Genres,
			"popularity": artist.Popularity,
		}

		formattedArtists = append(formattedArtists, formattedArtist)
	}

	c.JSON(http.StatusOK, formattedArtists)
}

// GetArtist maneja la petición para obtener un artista por ID
func (h *Handler) GetArtist(c *gin.Context) {
	artistID := c.Param("id")

	// Obtener el contexto de la petición
	ctx := c.Request.Context()

	// Llamar al servicio para obtener el artista con sus detalles
	artistWithDetails, err := h.musicService.GetArtist(ctx, artistID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener el artista: " + err.Error()})
		return
	}

	// Formatear la respuesta según el formato requerido por el frontend
	formattedArtist := map[string]interface{}{
		"id":         artistWithDetails.ID.Hex(), // ID interno de MongoDB
		"spotify_id": artistWithDetails.SpotifyID,
		"name":       artistWithDetails.Name,
		"image_url":  artistWithDetails.ImageURL,
		"genres":     artistWithDetails.Genres,
		"popularity": artistWithDetails.Popularity,

		// Añadir los álbumes formateados
		"albums": artistWithDetails.Albums,

		// Añadir las canciones formateadas
		"songs": artistWithDetails.Songs,
	}

	c.JSON(http.StatusOK, formattedArtist)
}

// GetCategories maneja la petición para obtener todas las categorías
func (h *Handler) GetCategories(c *gin.Context) {
	// Obtener el contexto de la petición
	ctx := c.Request.Context()

	// Llamar al servicio para obtener todos los géneros
	genres, err := h.musicService.GetGenres(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener las categorías: " + err.Error()})
		return
	}

	// Agrupar los géneros en "categorías" para mantener compatibilidad
	// Usamos la primera letra del nombre como categoría simulada
	categoryMap := make(map[string]*models.CategoryResponse)

	for _, genre := range genres {
		// Como ahora genre es un map[string]interface{}, necesitamos extraer el nombre
		genreName, _ := genre["name"].(string)
		if genreName == "" {
			continue
		}

		firstLetter := strings.ToUpper(string([]rune(genreName)[0]))
		if len(firstLetter) == 0 {
			firstLetter = "#" // Para géneros con nombres que comienzan con caracteres especiales
		}

		// Si la categoría no existe, la creamos
		if _, exists := categoryMap[firstLetter]; !exists {
			categoryMap[firstLetter] = &models.CategoryResponse{
				ID:        primitive.NewObjectID().Hex(),
				Name:      firstLetter,
				Slug:      strings.ToLower(firstLetter),
				ImageURL:  "/images/categories/" + strings.ToLower(firstLetter) + ".jpg",
				Genres:    []models.Genre{},
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
		}

		// Convertimos el mapa de género a un objeto Genre para mantener compatibilidad
		genreObj := models.Genre{
			Name:  genreName,
			Slug:  genre["slug"].(string),
			Count: int(genre["count"].(float64)),
		}
		if genreID, ok := genre["id"].(string); ok {
			genreObj.ID, _ = primitive.ObjectIDFromHex(genreID)
		}

		// Agregamos el género a la categoría
		categoryMap[firstLetter].Genres = append(categoryMap[firstLetter].Genres, genreObj)
	}

	// Convertir el mapa a un slice de categorías
	var categories []*models.CategoryResponse
	for _, category := range categoryMap {
		categories = append(categories, category)
	}

	// Ordenar las categorías por nombre
	sort.Slice(categories, func(i, j int) bool {
		return categories[i].Name < categories[j].Name
	})

	c.JSON(http.StatusOK, categories)
}

// GetGenres maneja la petición para obtener todos los géneros musicales
func (h *Handler) GetGenres(c *gin.Context) {
	// Obtener el contexto de la petición
	ctx := c.Request.Context()

	// Llamar al servicio para obtener los géneros
	genres, err := h.musicService.GetGenres(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener los géneros: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, genres)
}

// GetGenreByID maneja la petición para obtener un género por ID
func (h *Handler) GetGenreByID(c *gin.Context) {
	genreID := c.Param("id")

	// Obtener el contexto de la petición
	ctx := c.Request.Context()

	// Llamar al servicio para obtener el género
	genre, err := h.musicService.GetGenreByID(ctx, genreID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener el género: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, genre)
}

// GetGenreBySlug maneja la petición para obtener un género por su slug
func (h *Handler) GetGenreBySlug(c *gin.Context) {
	slug := c.Param("slug")

	// Obtener el contexto de la petición
	ctx := c.Request.Context()

	// Llamar al servicio para obtener el género por slug
	genre, err := h.musicService.GetGenreBySlug(ctx, slug)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener el género: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, genre)
}

// Definiciones ejemplo de estructuras, adapta según tu base de datos
type AlbumData struct {
	ID     string   `bson:"id"`
	Name   string   `bson:"name"`
	Tracks []string `bson:"tracks"`
}

type ArtistData struct {
	ID     string      `bson:"id"`
	Name   string      `bson:"name"`
	Genres []string    `bson:"genres"`
	Albums []AlbumData `bson:"albums"`
}

type DatabaseInterface interface {
	SaveArtistData(artist ArtistData) error
}

// genresEqual compara dos arrays de géneros para determinar si son iguales
func genresEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}

	// Crear un mapa para contar las ocurrencias de cada género en el primer array
	counts := make(map[string]int)
	for _, genre := range a {
		counts[genre]++
	}

	// Restar las ocurrencias encontradas en el segundo array
	for _, genre := range b {
		if counts[genre] <= 0 {
			return false
		}
		counts[genre]--
	}

	// Verificar que no queden ocurrencias
	for _, count := range counts {
		if count != 0 {
			return false
		}
	}

	return true
}

// containsObjectID verifica si un ObjectID está presente en una lista de ObjectIDs
func containsObjectID(list []primitive.ObjectID, id primitive.ObjectID) bool {
	for _, item := range list {
		if item == id {
			return true
		}
	}
	return false
}
