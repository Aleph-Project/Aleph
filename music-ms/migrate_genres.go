package main

import (
"context"
"fmt"
"log"
"strings"
"time"

"go.mongodb.org/mongo-driver/bson"
"go.mongodb.org/mongo-driver/mongo"
"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
// Conectar a MongoDB
clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
client, err := mongo.Connect(context.Background(), clientOptions)
if err != nil {
log.Fatal(err)
}
defer client.Disconnect(context.Background())

// Verificar la conexión
err = client.Ping(context.Background(), nil)
if err != nil {
log.Fatal(err)
}
fmt.Println("Conectado a MongoDB!")

// Seleccionar la base de datos y colección
db := client.Database("musicdb")
collection := db.Collection("genres")

// Obtener todos los géneros
cursor, err := collection.Find(context.Background(), bson.M{})
if err != nil {
log.Fatal(err)
}

var genres []bson.M
if err = cursor.All(context.Background(), &genres); err != nil {
log.Fatal(err)
}

fmt.Printf("Se encontraron %d géneros\n", len(genres))

// Procesar cada género
for _, genre := range genres {
name, ok := genre["name"].(string)
if !ok || name == "" {
continue
}

// Generar slug si no existe
slug, _ := genre["slug"].(string)
if slug == "" {
slug = slugify(name)
fmt.Printf("Generando slug %s para %s\n", slug, name)
}

// Establecer contador a 1 si no existe
var count int32 = 1
if countVal, ok := genre["count"].(int32); ok {
count = countVal
}

// Actualizar el género
_, err := collection.UpdateOne(
context.Background(),
bson.M{"_id": genre["_id"]},
bson.M{
"$set": bson.M{
"slug":       slug,
"count":      count,
"updated_at": time.Now(),
},
},
)

if err != nil {
log.Printf("Error actualizando género %s: %v", name, err)
} else {
fmt.Printf("Género %s actualizado correctamente\n", name)
}
}

fmt.Println("Migración completada")
}

// slugify convierte un texto a formato slug
func slugify(text string) string {
slug := strings.ToLower(text)
slug = strings.ReplaceAll(slug, " ", "-")
slug = strings.ReplaceAll(slug, "_", "-")
return slug
}
