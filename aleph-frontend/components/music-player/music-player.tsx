"use client"

import React, { useState, useEffect, useRef } from "react"
import { Play, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Pause } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Song as SongType } from "./types"

interface Song extends SongType {
    // Extendemos la interfaz base para mantener compatibilidad con diferentes fuentes de datos
    coverUrl?: string;
    audioUrl?: string;
}

export function MusicPlayer() {
    const [isLoading, setIsLoading] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentSong, setCurrentSong] = useState<Song | null>(null)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const audioRef = useRef<HTMLAudioElement>(null)

    // Simular carga inicial
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 250)

        return () => clearTimeout(timer)
    }, [])

    // Función para obtener datos completos de la canción
    const fetchCompleteSongData = async (songId: string) => {
        try {
            console.log('[MusicPlayer] Obteniendo datos completos para canción:', songId);
            const response = await fetch(`/api/v1/music/songs/${songId}`);
            
            if (!response.ok) {
                throw new Error('Error al obtener datos de la canción');
            }
            
            const songData = await response.json();
            console.log('[MusicPlayer] Datos completos obtenidos:', songData);
            
            return songData;
        } catch (error) {
            console.error('[MusicPlayer] Error al obtener datos completos:', error);
            return null;
        }
    };

    // Escuchar eventos de reproducción de canciones
    useEffect(() => {
        const handlePlaySong = async (event: any) => {
            console.log('[MusicPlayer] Evento playSong recibido:', event.detail);
            
            // Manejar diferentes estructuras de datos
            const songData = event.detail.song || event.detail;
            
            console.log('[MusicPlayer] Datos de la canción extraídos:', songData);
            console.log('[MusicPlayer] Propiedades disponibles:', Object.keys(songData));
            
            if (songData) {
                console.log('[MusicPlayer] Actualizando canción actual:', songData);
                
                // Verificar si los datos están incompletos (falta artista, álbum, etc.)
                const isIncomplete = !songData.artist || !songData.album || !songData.image_url;
                
                let completeSongData = songData;
                
                // Si los datos están incompletos, obtener datos completos
                if (isIncomplete && (songData.id || songData._id)) {
                    console.log('[MusicPlayer] Datos incompletos detectados, obteniendo datos completos...');
                    const fetchedData = await fetchCompleteSongData(songData.id || songData._id);
                    
                    if (fetchedData) {
                        // Combinar los datos del evento con los datos completos obtenidos
                        completeSongData = {
                            ...fetchedData,
                            ...songData, // Mantener audio_url del evento original si está presente
                        };
                        console.log('[MusicPlayer] Datos completos combinados:', completeSongData);
                    }
                }
                
                // Asegurar que tenemos todos los campos necesarios
                const normalizedSong: Song = {
                    _id: completeSongData._id || completeSongData.id || '',
                    id: completeSongData.id || completeSongData._id || '',
                    title: completeSongData.title || 'Título desconocido',
                    artist: completeSongData.artist || completeSongData.artists?.[0] || 'Artista desconocido',
                    duration: completeSongData.duration || '0:00',
                    image_url: completeSongData.image_url || completeSongData.cover_url || completeSongData.coverUrl || '/placeholder.svg',
                    album: completeSongData.album || completeSongData.album_name || 'Álbum desconocido',
                    audio_url: completeSongData.audio_url || completeSongData.audioUrl || completeSongData.audio || '',
                    authors: completeSongData.authors || (completeSongData.artist ? [completeSongData.artist] : []),
                    release_date: completeSongData.release_date || completeSongData.releaseDate || '',
                    genre: completeSongData.genre || '',
                    likes: completeSongData.likes || 0,
                    plays: completeSongData.plays || 0,
                    spotify_id: completeSongData.spotify_id || '',
                    album_id: completeSongData.album_id || '',
                    created_at: completeSongData.created_at || '',
                    updated_at: completeSongData.updated_at || '',
                };
                
                console.log('[MusicPlayer] Canción normalizada:', normalizedSong);
                console.log('[MusicPlayer] Artista final:', normalizedSong.artist);
                console.log('[MusicPlayer] Álbum final:', normalizedSong.album);
                console.log('[MusicPlayer] Imagen final:', normalizedSong.image_url);
                
                setCurrentSong(normalizedSong);
                setIsPlaying(true);

                // Si hay una URL de audio, actualizar el elemento audio
                if (audioRef.current && normalizedSong.audio_url) {
                    audioRef.current.src = normalizedSong.audio_url;
                    audioRef.current.load();
                    audioRef.current.play().catch((error: Error) => {
                        console.error('[MusicPlayer] Error al reproducir audio:', error);
                    });
                }
            }
        };

        window.addEventListener('playSong', handlePlaySong);
        
        return () => {
            window.removeEventListener('playSong', handlePlaySong);
        };
    }, []);

    // Configurar audio
    useEffect(() => {
        if (audioRef.current) {
            const audio = audioRef.current;
            
            const handleLoadedMetadata = () => {
                setDuration(audio.duration);
            };
            
            const handleTimeUpdate = () => {
                setCurrentTime(audio.currentTime);
            };
            
            audio.addEventListener('loadedmetadata', handleLoadedMetadata);
            audio.addEventListener('timeupdate', handleTimeUpdate);
            
            return () => {
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
                audio.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    }, [currentSong])

    // Formatear tiempo
    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (audioRef.current && currentSong) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 h-20 bg-zinc-900 border-t border-zinc-800 flex items-center px-4">
            {/* Audio element */}
            {currentSong && currentSong.audio_url && (
                <audio
                    ref={audioRef}
                    src={currentSong.audio_url}
                    preload="metadata"
                    onError={(e) => console.error('[MusicPlayer] Error de audio:', e)}
                />
            )}
            
            {/* Song Info */}
            <div className="flex items-center w-1/3">
                {isLoading ? (
                    <div className="flex items-center">
                        <Skeleton className="h-14 w-14 rounded mr-3" />
                        <div>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ) : currentSong ? (
                    <>
                        <img
                            src={currentSong.image_url}
                            alt={`Portada de ${currentSong.title}`}
                            className="h-14 w-14 rounded object-cover mr-3"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "/placeholder.svg?height=56&width=56";
                            }}
                        />
                        <div className="overflow-hidden">
                            <h4 className="text-sm font-medium truncate">{currentSong.title}</h4>
                            <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
                            <p className="text-xs text-zinc-400 truncate">{currentSong.album}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <img
                            src="/placeholder.svg?height=56&width=56"
                            alt="Album cover"
                            className="h-14 w-14 rounded object-cover mr-3"
                        />
                        <div>
                            <h4 className="text-sm font-medium">Selecciona una canción</h4>
                            <p className="text-xs text-zinc-400">No hay reproducción activa</p>
                        </div>
                    </>
                )}
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center w-1/3">
                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </>
                    ) : (
                        <>
                            <button className="text-zinc-400 hover:text-white">
                                <Shuffle className="h-4 w-4" />
                            </button>
                            <button className="text-zinc-400 hover:text-white">
                                <SkipBack className="h-5 w-5" />
                            </button>
                            <button 
                                onClick={togglePlay} 
                                className="bg-white text-black rounded-full p-2 hover:scale-105 transition"
                                disabled={!currentSong}
                            >
                                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            </button>
                            <button className="text-zinc-400 hover:text-white">
                                <SkipForward className="h-5 w-5" />
                            </button>
                            <button className="text-zinc-400 hover:text-white">
                                <Repeat className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
                <div className="w-full flex items-center gap-2 mt-2">
                    {isLoading ? (
                        <div className="w-full flex items-center gap-2">
                            <Skeleton className="h-3 w-8" />
                            <Skeleton className="h-1 flex-1 rounded-full" />
                            <Skeleton className="h-3 w-8" />
                        </div>
                    ) : (
                        <>
                            <span className="text-xs text-zinc-400">
                                {formatTime(currentTime)}
                            </span>
                            <div className="h-1 flex-1 bg-zinc-700 rounded-full">
                                <div 
                                    className="h-1 bg-white rounded-full transition-all duration-150"
                                    style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                                ></div>
                            </div>
                            <span className="text-xs text-zinc-400">
                                {duration > 0 ? formatTime(duration) : (currentSong?.duration || '0:00')}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-end w-1/3">
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-1 w-24 rounded-full" />
                    </div>
                ) : (
                    <>
                        <Volume2 className="h-5 w-5 text-zinc-400 mr-2" />
                        <div className="h-1 w-24 bg-zinc-700 rounded-full">
                            <div className="h-1 w-2/3 bg-white rounded-full"></div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
