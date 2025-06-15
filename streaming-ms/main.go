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
	Type   string `json:"type"` // "play", "pause", "stop", "resume"
	SongID string `json:"songId"`
}

type StreamResponse struct {
	Type    string `json:"type"` // "song_data", "error", "status"
	Message string `json:"message"`
	Song    *Song  `json:"song,omitempty"`
}

// PlaybackSession mantiene el estado de reproducción de un usuario
type PlaybackSession struct {
	UserID          string    `json:"user_id"`
	SongID          string    `json:"song_id"`
	StartTime       time.Time `json:"start_time"`       // Momento en que inició la sesión actual
	AccumulatedTime int       `json:"accumulated_time"` // Segundos acumulados de sesiones anteriores (pausas)
	IsPlaying       bool      `json:"is_playing"`
	LastPlayTime    time.Time `json:"last_play_time"` // Último momento en que se inició reproducción
}

// SongPlayedEvent representa el evento que se envía a Kafka
type SongPlayedEvent struct {
	Event          string `json:"Event"`
	UserID         string `json:"User_Id"`
	SongID         string `json:"Song_Id"`
	PlayedAt       string `json:"Played_At"` // RFC3339 timestamp string
	DurationPlayed *int   `json:"Duration_Played,omitempty"`
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
	// userSessions mantiene las sesiones de reproducción activas por usuario
	userSessions = make(map[string]*PlaybackSession)
)

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "healthy",
		"service": "streaming-ms",
	})
}

// startPlaybackSession inicia una nueva sesión de reproducción o reanuda una pausada
func startPlaybackSession(userID, songID string) {
	session, exists := userSessions[userID]
	currentTime := time.Now()

	// Si existe una sesión para la misma canción, reanudarla
	if exists && session.SongID == songID && !session.IsPlaying {
		log.Printf("REANUDANDO SESIÓN - user_id=%s, song_id=%s, tiempo_acumulado=%d segundos",
			userID, songID, session.AccumulatedTime)
		session.IsPlaying = true
		session.LastPlayTime = currentTime
		return
	}

	// Si hay una sesión activa para una canción diferente, finalizarla primero
	if exists && session.IsPlaying && session.SongID != songID {
		log.Printf("Finalizando sesión previa para user_id=%s antes de iniciar nueva", userID)
		endPlaybackSession(userID)
	}

	// Crear nueva sesión para nueva canción
	userSessions[userID] = &PlaybackSession{
		UserID:          userID,
		SongID:          songID,
		StartTime:       currentTime,
		AccumulatedTime: 0, // Nueva canción, tiempo acumulado en 0
		IsPlaying:       true,
		LastPlayTime:    currentTime,
	}
	log.Printf("NUEVA SESIÓN INICIADA - user_id=%s, song_id=%s, start_time=%s",
		userID, songID, currentTime.Format(time.RFC3339))
}

// endPlaybackSession finaliza la sesión actual y envía el evento final a Kafka
func endPlaybackSession(userID string) error {
	session, exists := userSessions[userID]
	if !exists {
		log.Printf("No hay sesión para finalizar para user_id=%s", userID)
		return nil
	}

	var totalDuration int

	// Si está reproduciendo, calcular tiempo de la sesión actual y sumarlo al acumulado
	if session.IsPlaying {
		currentSessionDuration := int(time.Since(session.LastPlayTime).Seconds())
		totalDuration = session.AccumulatedTime + currentSessionDuration
		log.Printf("FINALIZANDO SESIÓN ACTIVA - user_id=%s, duración_sesión_actual=%d, tiempo_acumulado_previo=%d, duración_total=%d segundos",
			userID, currentSessionDuration, session.AccumulatedTime, totalDuration)
	} else {
		// Si está pausada, usar solo el tiempo acumulado
		totalDuration = session.AccumulatedTime
		log.Printf("FINALIZANDO SESIÓN PAUSADA - user_id=%s, duración_total=%d segundos",
			userID, totalDuration)
	}

	// Solo enviar evento si se reprodujo por más de 1 segundo en total
	if totalDuration > 0 {
		err := publishSongPlayedEvent(session.UserID, session.SongID, session.StartTime, totalDuration)
		if err != nil {
			log.Printf("Error enviando evento final a Kafka: %v", err)
			return err
		}
	}

	// Eliminar la sesión completamente
	delete(userSessions, userID)
	log.Printf("Sesión eliminada para user_id=%s", userID)
	return nil
}

// pausePlaybackSession pausa la sesión actual y acumula el tiempo reproducido
func pausePlaybackSession(userID string) error {
	session, exists := userSessions[userID]
	if !exists || !session.IsPlaying {
		log.Printf("No hay sesión activa para pausar para user_id=%s", userID)
		return nil
	}

	// Calcular duración de la sesión actual en segundos
	currentSessionDuration := int(time.Since(session.LastPlayTime).Seconds())

	// Acumular el tiempo de reproducción
	session.AccumulatedTime += currentSessionDuration

	// Marcar sesión como pausada pero NO eliminar la sesión
	session.IsPlaying = false

	log.Printf("SESIÓN PAUSADA - user_id=%s, duración_sesión_actual=%d segundos, tiempo_total_acumulado=%d segundos",
		userID, currentSessionDuration, session.AccumulatedTime)

	// NO enviar a Kafka en pausa, solo acumular tiempo
	log.Printf("PAUSA: Tiempo acumulado sin enviar a Kafka (se enviará al cambiar/terminar canción)")

	return nil
}

// resumePlaybackSession reanuda una sesión pausada
func resumePlaybackSession(userID, songID string) error {
	session, exists := userSessions[userID]
	if !exists {
		log.Printf("No hay sesión para reanudar para user_id=%s", userID)
		return fmt.Errorf("no hay sesión para reanudar")
	}

	// Verificar que sea la misma canción
	if session.SongID != songID {
		log.Printf("Intento de reanudar canción diferente: sesión=%s, solicitada=%s", session.SongID, songID)
		return fmt.Errorf("canción diferente en sesión")
	}

	// Si ya está reproduciendo, no hacer nada
	if session.IsPlaying {
		log.Printf("La sesión ya está activa para user_id=%s", userID)
		return nil
	}

	// Reactivar la sesión
	session.IsPlaying = true
	session.LastPlayTime = time.Now()

	log.Printf("SESIÓN REANUDADA - user_id=%s, song_id=%s, tiempo_acumulado=%d segundos",
		userID, songID, session.AccumulatedTime)

	return nil
}

// publishSongPlayedEvent envía el evento de canción reproducida al API Gateway
func publishSongPlayedEvent(userID, songID string, startTime time.Time, durationPlayed int) error {
	apiGatewayURL := os.Getenv("API_GATEWAY_URL")
	if apiGatewayURL == "" {
		apiGatewayURL = "http://apigateway:8080"
	}

	kafkaEndpoint := apiGatewayURL + "/api/v1/composite/publish-to-song-played-kafka"

	event := SongPlayedEvent{
		Event:          "song_played",
		UserID:         userID,
		SongID:         songID,
		PlayedAt:       startTime.Format(time.RFC3339),
		DurationPlayed: &durationPlayed,
	}

	jsonBody, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("error marshaling event: %v", err)
	}

	log.Printf("ENVIANDO A KAFKA - Endpoint: %s", kafkaEndpoint)
	log.Printf("PAYLOAD JSON: %s", string(jsonBody))

	resp, err := http.Post(kafkaEndpoint, "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Printf("ERROR enviando a Kafka: %v", err)
		return fmt.Errorf("error enviando evento a Kafka: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("ERROR respuesta Kafka - Status: %d", resp.StatusCode)
		return fmt.Errorf("error en respuesta de Kafka endpoint: status %d", resp.StatusCode)
	}

	log.Printf("KAFKA SUCCESS - Evento enviado: user_id=%s, song_id=%s, duración=%d segundos", userID, songID, durationPlayed)
	return nil
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
	// Obtener user_id del query parameter
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		log.Printf("Error: user_id requerido en query parameter")
		http.Error(w, "user_id requerido en query parameter", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	log.Printf("Cliente WebSocket conectado con user_id: %s", userID)

	// El userID viene del query parameter y es constante para esta conexión
	currentUserID := userID

	for {
		var request StreamRequest
		err := conn.ReadJSON(&request)
		if err != nil {
			log.Println("Read error:", err)
			// Finalizar sesión si existe antes de cerrar la conexión
			if currentUserID != "" {
				endPlaybackSession(currentUserID)
			}
			break
		}

		log.Printf("Received request: %+v", request)

		switch request.Type {
		case "play":
			log.Printf("Solicitud de reproducción para canción ID: %s de user_id: %s", request.SongID, currentUserID)

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

			// Iniciar sesión de reproducción (esto finalizará automáticamente cualquier sesión previa)
			startPlaybackSession(currentUserID, request.SongID)

			log.Printf("Enviando datos de canción al cliente: %s", song.Title)
			response := StreamResponse{
				Type:    "song_data",
				Message: fmt.Sprintf("Reproduciendo: %s", song.Title),
				Song:    song,
			}
			conn.WriteJSON(response)

		case "pause":
			log.Printf("Solicitud de pausa para canción ID: %s de user_id: %s", request.SongID, currentUserID)

			// Pausar sesión de reproducción y enviar evento a Kafka
			err := pausePlaybackSession(currentUserID)
			if err != nil {
				log.Printf("Error pausando sesión: %v", err)
			}

			response := StreamResponse{
				Type:    "status",
				Message: fmt.Sprintf("Canción %s pausada", request.SongID),
			}
			conn.WriteJSON(response)

		case "stop":
			log.Printf("Solicitud de detener para canción ID: %s de user_id: %s", request.SongID, currentUserID)

			// Finalizar sesión de reproducción y enviar evento a Kafka
			err := endPlaybackSession(currentUserID)
			if err != nil {
				log.Printf("Error finalizando sesión: %v", err)
			}

			response := StreamResponse{
				Type:    "status",
				Message: fmt.Sprintf("Canción %s detenida", request.SongID),
			}
			conn.WriteJSON(response)

		case "resume":
			log.Printf("Solicitud de reanudar para canción ID: %s de user_id: %s", request.SongID, currentUserID)

			// Reanudar sesión de reproducción
			err := resumePlaybackSession(currentUserID, request.SongID)
			if err != nil {
				log.Printf("Error reanudando sesión: %v", err)
				response := StreamResponse{
					Type:    "error",
					Message: "No se pudo reanudar la reproducción: " + err.Error(),
				}
				conn.WriteJSON(response)
				continue
			}

			response := StreamResponse{
				Type:    "status",
				Message: fmt.Sprintf("Canción %s reanudada", request.SongID),
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

	// Finalizar sesión si existe cuando se desconecta el cliente
	if currentUserID != "" {
		endPlaybackSession(currentUserID)
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
