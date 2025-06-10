package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gorilla/websocket"
)

type Song struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	AudioURL string `json:"audio_url"`
	S3Key    string `json:"s3_key,omitempty"`    // Nueva: clave de S3
	S3Bucket string `json:"s3_bucket,omitempty"` // Nueva: bucket de S3
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

// S3Service maneja las operaciones con S3
type S3Service struct {
	client     *s3.Client
	bucketName string
}

// NewS3Service crea un nuevo servicio S3
func NewS3Service() (*S3Service, error) {
	accessKey := os.Getenv("S3_ACCESS_KEY")
	secretKey := os.Getenv("S3_SECRET_KEY")
	bucketName := os.Getenv("S3_BUCKET_NAME")
	region := os.Getenv("AWS_REGION")

	if accessKey == "" || secretKey == "" || bucketName == "" {
		return nil, fmt.Errorf("faltan variables de entorno S3: S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET_NAME")
	}

	if region == "" {
		region = "us-east-2" // Región por defecto basada en tu bucket
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return nil, fmt.Errorf("error configurando AWS SDK: %v", err)
	}

	client := s3.NewFromConfig(cfg)
	return &S3Service{
		client:     client,
		bucketName: bucketName,
	}, nil
}

// GeneratePresignedURL genera una URL firmada para acceder al objeto en S3
func (s *S3Service) GeneratePresignedURL(ctx context.Context, key string) (string, error) {
	if key == "" {
		return "", fmt.Errorf("clave S3 vacía")
	}

	presignClient := s3.NewPresignClient(s.client)

	// Generar URL firmada válida por 1 hora
	presignedURL, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(time.Hour))

	if err != nil {
		return "", fmt.Errorf("error generando URL firmada: %v", err)
	}

	log.Printf("URL firmada generada para clave '%s': %s", key, presignedURL.URL)
	return presignedURL.URL, nil
}

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true }, // Configura para producción
	}
	s3Service *S3Service
)

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

	song := result.Data.Song
	log.Printf("Canción obtenida exitosamente (GraphQL): %s", song.Title)

	// Si la canción tiene audio_url pero es una clave de S3 (no una URL completa), generar URL firmada
	if song.AudioURL != "" && s3Service != nil {
		// Verificar si es una clave de S3 (no contiene http)
		if len(song.AudioURL) > 0 && song.AudioURL[0] != 'h' {
			log.Printf("Detectada clave S3, generando URL firmada para: %s", song.AudioURL)
			signedURL, err := s3Service.GeneratePresignedURL(context.Background(), song.AudioURL)
			if err != nil {
				log.Printf("Error generando URL firmada: %v", err)
				return nil, fmt.Errorf("error generando URL de audio")
			}
			song.AudioURL = signedURL
			log.Printf("URL firmada generada exitosamente")
		}
	}

	return song, nil
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
	// Inicializar servicio S3
	var err error
	s3Service, err = NewS3Service()
	if err != nil {
		log.Printf("Advertencia: No se pudo inicializar S3 service: %v", err)
		log.Printf("El servicio funcionará sin URLs firmadas")
		s3Service = nil
	} else {
		log.Printf("Servicio S3 inicializado correctamente")
	}

	http.HandleFunc("/health", healthCheckHandler)
	http.HandleFunc("/ws", wsHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
