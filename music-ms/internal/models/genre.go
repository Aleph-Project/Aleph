package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Genre representa un género musical en la base de datos
type Genre struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Slug        string             `bson:"slug" json:"slug"`
	Description string             `bson:"description" json:"description"`
	ImageURL    string             `bson:"image_url" json:"image_url,omitempty"`
	Count       int                `bson:"count" json:"count"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}
