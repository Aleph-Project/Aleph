package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

type Song struct {
	ID       string `json:"_id"`
	Title    string `json:"title"`
	Artist   string `json:"artist"`
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
	musicMSURL := os.Getenv("MUSIC_MS_URL")
	if musicMSURL == "" {
		musicMSURL = "http://music-ms:3001" // Usar nombre del servicio Docker
	}

	url := fmt.Sprintf("%s/api/songs/%s", musicMSURL, songID)
	log.Printf("Consultando music-ms en: %s", url)
	
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Error: music-ms respondió con status %d para song ID %s", resp.StatusCode, songID)
		return nil, fmt.Errorf("canción no encontrada (status: %d)", resp.StatusCode)
	}

	var song Song
	if err := json.NewDecoder(resp.Body).Decode(&song); err != nil {
		log.Printf("Error decodificando respuesta de music-ms: %v", err)
		return nil, fmt.Errorf("error procesando datos de la canción")
	}

	log.Printf("Canción obtenida exitosamente: %s - %s", song.Title, song.Artist)
	return &song, nil
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

			log.Printf("Enviando datos de canción al cliente: %s", song.Title)
			response := StreamResponse{
				Type:    "song_data",
				Message: fmt.Sprintf("Reproduciendo: %s - %s", song.Title, song.Artist),
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
