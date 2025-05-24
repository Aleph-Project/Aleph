"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

export default function SongDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const songId = parseInt(params.id);
  
  const [song, setSong] = useState<Song | null>(null);
  const [similarSongs, setSimilarSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    async function fetchSongData() {
      try {
        setLoading(true);
        // Obtener la canción actual (ruta actualizada para coincidir con API Gateway)
        const response = await fetch(`/api/v1/music/songs/${songId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Canción no encontrada');
          }
          throw new Error('Error al cargar la información de la canción');
        }
        
        const data = await response.json();
        setSong(data.song);
        
        // Obtener todas las canciones para filtrar las similares
        const allSongsResponse = await fetch('/api/v1/music/songs');
        
        if (!allSongsResponse.ok) {
          throw new Error('Error al cargar canciones similares');
        }
        
        const allSongsData = await allSongsResponse.json();
        // Filtrar canciones similares (mismo género o mismo artista)
        const similar = allSongsData.songs.filter((s: Song) => 
          s.id !== songId && (s.genre === data.song.genre || s.artist === data.song.artist)
        ).slice(0, 4);
        
        setSimilarSongs(similar);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error inesperado al cargar la canción');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSongData();
  }, [songId]);
  
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const handleLoadedData = () => {
        setDuration(audio.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.addEventListener("loadeddata", handleLoadedData);
      audio.addEventListener("timeupdate", handleTimeUpdate);

      return () => {
        audio.removeEventListener("loadeddata", handleLoadedData);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [audioRef]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  if (loading) {
    return <div className="container mx-auto py-10 text-center">Cargando información de la canción...</div>;
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
        >
          Volver a la lista de canciones
        </Button>
      </div>
    );
  }

  if (!song) {
    return <div className="container mx-auto py-10 text-center">Canción no encontrada</div>;
  }

  // Format date to local format
  const releaseDate = new Date(song.releaseDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto py-10">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6"
      >
        ← Volver
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Album cover and basic info */}
        <div className="md:col-span-1">
          <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg mb-4">
            <Image
              src={song.coverUrl}
              alt={`${song.title} por ${song.artist}`}
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
          <p className="text-xl text-muted-foreground mb-4">{song.artist}</p>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Álbum:</span>
              <span className="font-medium">{song.album}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Género:</span>
              <Badge variant="outline">{song.genre}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duración:</span>
              <span>{song.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Publicación:</span>
              <span>{releaseDate}</span>
            </div>
          </div>
        </div>
        
        {/* Middle column - Reproduction and stats */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4 mb-4">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-14 w-14 rounded-full"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  )}
                </Button>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <audio ref={audioRef} src={song.audioUrl} preload="metadata" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span><strong>{new Intl.NumberFormat().format(song.likes)}</strong> Me gusta</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>{new Intl.NumberFormat().format(song.plays)}</strong> Reproducciones</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Autores</h2>
            <div className="flex flex-wrap gap-4">
              {song.authors.map((author, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarFallback>{author.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span>{author}</span>
                </div>
              ))}
            </div>
          </div>

          {similarSongs.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Canciones similares</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarSongs.map(similarSong => (
                  <Card 
                    key={similarSong.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/songs/${similarSong.id}`)}
                  >
                    <CardContent className="p-4 flex items-center space-x-3">
                      <div className="relative h-12 w-12 rounded overflow-hidden">
                        <Image
                          src={similarSong.coverUrl}
                          alt={similarSong.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{similarSong.title}</p>
                        <p className="text-sm text-muted-foreground">{similarSong.artist}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}