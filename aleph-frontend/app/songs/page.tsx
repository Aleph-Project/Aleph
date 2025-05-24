"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Definir el tipo de datos para una canción
interface Song {
  id: number;
  title: string;
  artist: string;
  authors: string[];
  album: string;
  releaseDate: string;
  duration: string;
  genre: string;
  likes: number;
  plays: number;
  coverUrl: string;
  audioUrl: string;
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchSongs() {
      try {
        setLoading(true);
        // URL corregida para coincidir con la estructura del API Gateway
        const response = await fetch('/api/v1/music/songs');
        
        if (!response.ok) {
          throw new Error('Error al cargar las canciones');
        }
        
        const data = await response.json();
        setSongs(data.songs);
        setError(null);
      } catch (err) {
        console.error('Error al cargar las canciones:', err);
        setError('No se pudieron cargar las canciones. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSongs();
  }, []);
  
  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.album.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-lg">Cargando canciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-lg text-red-500">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Explorar Canciones</h1>
      
      <div className="flex items-center space-x-4 mb-8">
        <Input
          type="text"
          placeholder="Buscar por título, artista, álbum o género..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        {searchTerm && (
          <Button variant="outline" onClick={() => setSearchTerm("")}>
            Limpiar
          </Button>
        )}
      </div>

      {filteredSongs.length === 0 ? (
        <p className="text-center py-8">No se encontraron canciones que coincidan con tu búsqueda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSongs.map((song) => (
            <Link key={song.id} href={`/songs/${song.id}`} passHref>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden">
                    <Image
                      src={song.coverUrl}
                      alt={song.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{song.title}</CardTitle>
                    <CardDescription>{song.artist}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm mb-2">Album: {song.album}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <Badge variant="outline">{song.genre}</Badge>
                    <span>{song.duration}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {new Intl.NumberFormat().format(song.likes)}
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Intl.NumberFormat().format(song.plays)}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}