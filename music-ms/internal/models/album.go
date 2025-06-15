package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Album representa un álbum musical en la base de datos
type Album struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Title       string               `bson:"title" json:"title"`
	ReleaseDate string               `bson:"release_date" json:"release_date"`
	SpotifyID   string               `bson:"spotify_id" json:"spotify_id"`
	ImageURL    string               `bson:"image_url" json:"image_url"`
	ArtistIDs   []primitive.ObjectID `bson:"artist_ids" json:"artist_ids"`
	Year        int                  `bson:"year" json:"year"`
	CreatedAt   time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time            `bson:"updated_at" json:"updated_at"`
	Songs       []Song               `bson:"-" json:"songs,omitempty"`
}

// AlbumWithDetails representa un álbum con detalles de artistas y canciones
type AlbumWithDetails struct {
	Album
	Artists []Artist `json:"artists"`
	Songs   []Song   `json:"songs"`
}
