package models

import (
	"time"
)

// CategoryResponse representa la estructura de respuesta para datos de categoría
// Modelo de compatibilidad para mantener la API existente
type CategoryResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	ImageURL  string    `json:"image_url"`
	Genres    []Genre   `json:"genres"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// NewCategoryResponse crea una nueva instancia de CategoryResponse
func NewCategoryResponse(id, name string) *CategoryResponse {
	return &CategoryResponse{
		ID:        id,
		Name:      name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}
