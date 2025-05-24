package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Artist representa un artista musical en la base de datos
type Artist struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name"`
	SpotifyID string             `bson:"spotify_id" json:"spotify_id"`
	ImageURL  string             `bson:"image_url" json:"image_url"`
	Biography string             `bson:"biography" json:"biography"`
	Genres    []string           `bson:"genres" json:"genres"`
	Popularity int               `bson:"popularity" json:"popularity"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// ArtistWithDetails representa un artista con sus álbumes y canciones
type ArtistWithDetails struct {
	Artist
	Albums []Album `json:"albums"`
	Songs  []Song  `json:"songs"`
}
