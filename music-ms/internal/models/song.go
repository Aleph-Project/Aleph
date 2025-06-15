package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Song representa una canción en la base de datos
type Song struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Title       string               `bson:"title" json:"title"`
	Duration    int                  `bson:"duration" json:"duration"` // Duración en segundos
	SpotifyID   string               `bson:"spotify_id" json:"spotify_id"`
	AlbumID     primitive.ObjectID   `bson:"album_id" json:"album_id"`
	ArtistIDs   []primitive.ObjectID `bson:"artist_ids" json:"artist_ids"` // IDs de los artistas asociados a la canción
	TrackNumber int                  `bson:"track_number" json:"track_number"`
	AudioURL    string               `bson:"audio_url" json:"audio_url"`
	AudioPath   string               `bson:"audio_path" json:"audio_path"` // Para compatibilidad con código existente
	S3Bucket    string               `bson:"s3_bucket" json:"s3_bucket,omitempty"`
	S3Key       string               `bson:"s3_key" json:"s3_key,omitempty"`
	CreatedAt   time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time            `bson:"updated_at" json:"updated_at"`
}

// SongWithDetails representa una canción con detalles del álbum y artista
type SongWithDetails struct {
	Song
	Album   Album    `json:"album"`
	Artists []Artist `json:"artists"`
}
