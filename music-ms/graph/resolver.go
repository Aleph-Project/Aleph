package graph

import "github.com/angel/music-ms/internal/service"

// This file will not be regenerated automatically.
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	MusicService *service.MusicService
}
