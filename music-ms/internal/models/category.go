package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Category representa una categoría musical en la base de datos
type Category struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name"`
	Slug      string             `bson:"slug" json:"slug"`
	ImageURL  string             `bson:"image_url" json:"image_url"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}
