package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"music-ms/internal/models"
)

// GenreController maneja las solicitudes relacionadas con géneros musicales
type GenreController struct {
	DB         *mongo.Database
	Collection *mongo.Collection
}

// NewGenreController crea una nueva instancia de GenreController
func NewGenreController(db *mongo.Database) *GenreController {
	return &GenreController{
		DB:         db,
		Collection: db.Collection("genres"),
	}
}

// GetAllGenres obtiene todos los géneros musicales
func (gc *GenreController) GetAllGenres(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var genres []models.Genre
	cursor, err := gc.Collection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener los géneros"})
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &genres); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al decodificar los géneros"})
		return
	}

	c.JSON(http.StatusOK, genres)
}

// GetGenreByID obtiene un género específico por ID
func (gc *GenreController) GetGenreByID(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var genre models.Genre
	err = gc.Collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&genre)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Género no encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al buscar el género"})
		return
	}

	c.JSON(http.StatusOK, genre)
}

// GetGenresByCategoryID obtiene todos los géneros que pertenecen a una categoría específica
func (gc *GenreController) GetGenresByCategoryID(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	categoryID := c.Param("categoryId")
	objectID, err := primitive.ObjectIDFromHex(categoryID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de categoría inválido"})
		return
	}

	var genres []models.Genre
	cursor, err := gc.Collection.Find(ctx, bson.M{"category_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener los géneros"})
		return
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &genres); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al decodificar los géneros"})
		return
	}

	c.JSON(http.StatusOK, genres)
}
