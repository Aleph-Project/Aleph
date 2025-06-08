package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

type Song struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	AudioURL string `json:"audio_url"`
}

type StreamRequest struct {
	Type   string `json:"type"` // "play", "pause", "stop"
	SongID string `json:"songId"`
}

type StreamResponse struct {
	Type    string `json:"type"` // "song_data", "error", "status"
	Message string `json:"message"`
	Song    *Song  `json:"song,omitempty"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // Configura para producción
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "healthy",
		"service": "streaming-ms",
	})
}

func getSongFromMusicMS(songID string) (*Song, error) {
	apiGatewayURL := os.Getenv("API_GATEWAY_URL")
	if apiGatewayURL == "" {
		apiGatewayURL = "http://apigateway:8080" // Cambia esto según tu entorno
	}

	graphqlURL := apiGatewayURL + "/api/v1/music/graphql"
	query := `query GetSongById($id: ID!) { song(id: $id) { id title audio_url } }`
	requestBody := map[string]interface{}{
		"query":     query,
		"variables": map[string]interface{}{"id": songID},
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, err
	}

	log.Printf("Consultando music-ms (GraphQL) en: %s con id: %s", graphqlURL, songID)
	resp, err := http.Post(graphqlURL, "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Error: music-ms (GraphQL) respondió con status %d para song ID %s", resp.StatusCode, songID)
		return nil, fmt.Errorf("canción no encontrada (status: %d)", resp.StatusCode)
	}

	var result struct {
		Data struct {
			Song *Song `json:"song"`
		} `json:"data"`
		Errors []interface{} `json:"errors"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Printf("Error decodificando respuesta de music-ms (GraphQL): %v", err)
		return nil, fmt.Errorf("error procesando datos de la canción")
	}

	if len(result.Errors) > 0 {
		log.Printf("Error: la respuesta GraphQL contiene errores")
		return nil, fmt.Errorf("canción no encontrada o error en GraphQL")
	}

	if result.Data.Song == nil {
		log.Printf("Error: la canción no existe")
		return nil, fmt.Errorf("canción no encontrada o error en GraphQL")
	}

	// Permitir audio_url null
	log.Printf("Canción obtenida exitosamente (GraphQL): %s", result.Data.Song.Title)
	return result.Data.Song, nil
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	log.Println("Cliente WebSocket conectado")

	for {
		var request StreamRequest
		err := conn.ReadJSON(&request)
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		log.Printf("Received request: %+v", request)

		switch request.Type {
		case "play":
			log.Printf("Solicitud de reproducción para canción ID: %s", request.SongID)
			song, err := getSongFromMusicMS(request.SongID)
			if err != nil {
				log.Printf("Error obteniendo canción: %v", err)
				response := StreamResponse{
					Type:    "error",
					Message: "No se pudo obtener la canción: " + err.Error(),
				}
				conn.WriteJSON(response)
				continue
			}

			// Verificar si hay audio_url disponible
			if song.AudioURL == "" {
				log.Printf("Canción encontrada pero sin audio_url: %s", song.Title)
				response := StreamResponse{
					Type:    "error",
					Message: fmt.Sprintf("La canción '%s' no tiene audio disponible. Audio URL no configurado en la base de datos.", song.Title),
				}
				conn.WriteJSON(response)
				continue
			}

			log.Printf("Enviando datos de canción al cliente: %s", song.Title)
			response := StreamResponse{
				Type:    "song_data",
				Message: fmt.Sprintf("Reproduciendo: %s", song.Title),
				Song:    song,
			}
			conn.WriteJSON(response)

		case "pause":
			log.Printf("Solicitud de pausa para canción ID: %s", request.SongID)
			response := StreamResponse{
				Type:    "status",
				Message: fmt.Sprintf("Canción %s pausada", request.SongID),
			}
			conn.WriteJSON(response)

		case "stop":
			log.Printf("Solicitud de detener para canción ID: %s", request.SongID)
			response := StreamResponse{
				Type:    "status",
				Message: fmt.Sprintf("Canción %s detenida", request.SongID),
			}
			conn.WriteJSON(response)

		default:
			response := StreamResponse{
				Type:    "error",
				Message: "Tipo de comando no reconocido",
			}
			conn.WriteJSON(response)
		}
	}

	log.Println("Cliente WebSocket desconectado")
}

func main() {
	http.HandleFunc("/health", healthCheckHandler)
	http.HandleFunc("/ws", wsHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
