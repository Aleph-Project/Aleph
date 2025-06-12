package controllers

import (
	"context"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"music-ms/internal/models"
)

// SongController maneja las solicitudes relacionadas con canciones
type SongController struct {
	DB         *mongo.Database
	Collection *mongo.Collection
}

// NewSongController crea una nueva instancia de SongController
func NewSongController(db *mongo.Database) *SongController {
	return &SongController{
		DB:         db,
		Collection: db.Collection("songs"),
	}
}

// GetAllSongs obtiene todas las canciones
func (sc *SongController) GetAllSongs(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var songs []models.Song
	cursor, err := sc.Collection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener las canciones"})
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &songs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al decodificar las canciones"})
		return
	}

	c.JSON(http.StatusOK, songs)
}

// GetSongByID obtiene una canción específica por ID
func (sc *SongController) GetSongByID(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var song models.Song
	err = sc.Collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&song)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Canción no encontrada"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al buscar la canción"})
		return
	}

	c.JSON(http.StatusOK, song)
}

// GetSongAudio obtiene el archivo de audio de una canción
func (sc *SongController) GetSongAudio(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var song models.Song
	err = sc.Collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&song)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Canción no encontrada"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al buscar la canción"})
		return
	}

	// Suponiendo que song.AudioPath contiene la ruta al archivo de audio
	audioPath := song.AudioPath
	if audioPath == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Archivo de audio no encontrado"})
		return
	}

	// Verificar si el archivo existe
	if _, err := os.Stat(audioPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Archivo de audio no encontrado en el sistema"})
		return
	}

	// Obtener el nombre del archivo
	fileName := filepath.Base(audioPath)

	// Servir el archivo
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", "attachment; filename="+fileName)
	c.Header("Content-Type", "audio/mpeg") // Ajustar según el formato real
	c.File(audioPath)
}

// GetSongByName obtiene una canción específica por nombre
func (sc *SongController) SearchSongsByName(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	name := c.Query("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El parámetro 'name' es requerido"})
		return
	}

	filter := bson.M{"name": bson.M{"$regex": name, "$options": "i"}} // búsqueda insensible a mayúsculas
	var songs []models.Song
	cursor, err := sc.Collection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al buscar canciones"})
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &songs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al decodificar las canciones"})
		return
	}

	c.JSON(http.StatusOK, songs)
}
