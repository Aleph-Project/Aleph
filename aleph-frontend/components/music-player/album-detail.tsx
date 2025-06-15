"use client"

import { Play, Heart, Clock, Pause, Square } from "lucide-react"
import { Album, Song } from "@/components/music-player/types"
import { useState, useEffect } from "react"

interface AlbumDetailProps {
    album: Album
    songs: Song[]
    isLoading: boolean
    onBack: () => void
    webSocket: {
        isConnected: boolean
        isPlaying: boolean
        currentSong: Song | null
        error: string | null
        playSong: (songId: string) => void
        pauseSong: () => void
        stopSong: () => void
    }
}

export function AlbumDetail({ album, songs, isLoading, onBack, webSocket }: AlbumDetailProps) {
    // Validación de seguridad para webSocket
    if (!webSocket) {
        console.error('[AlbumDetail] webSocket prop es undefined')
        return (
            <div className="p-6">
                <div className="text-center py-12 space-y-4">
                    <div className="text-red-400">Error: Conexión de streaming no disponible</div>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
                    >
                        Volver
                    </button>
                </div>
            </div>
        )
    }

    // Extraer propiedades del WebSocket
    const { 
        isConnected, 
        isPlaying, 
        currentSong, 
        error: streamError, 
        playSong, 
        pauseSong, 
        stopSong 
    } = webSocket

    // Estado para tracking de playlist
    const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1)

    // Sincronizar currentSongIndex con la canción actual del WebSocket
    useEffect(() => {
        if (currentSong) {
            const songIndex = songs.findIndex(song => (song._id || song.id) === (currentSong._id || currentSong.id));
            if (songIndex !== -1 && songIndex !== currentSongIndex) {
                console.log('[AlbumDetail] Sincronizando currentSongIndex:', songIndex, 'para canción:', currentSong.title);
                setCurrentSongIndex(songIndex);
            }
        }
    }, [currentSong, songs, currentSongIndex]);

    const handlePlaySong = (songId: string) => {
        console.log('[AlbumDetail] Reproduciendo canción con ID:', songId);
        
        // Encontrar el índice de la canción
        const songIndex = songs.findIndex(song => (song._id || song.id) === songId);
        if (songIndex !== -1) {
            setCurrentSongIndex(songIndex);
        }
        
        playSong(songId)
    }

    const handleNextSong = () => {
        if (currentSongIndex < songs.length - 1) {
            const nextIndex = currentSongIndex + 1;
            const nextSong = songs[nextIndex];
            console.log('[AlbumDetail] Cambiando a siguiente canción:', nextSong.title);
            handlePlaySong(nextSong._id || nextSong.id);
        } else {
            console.log('[AlbumDetail] Ya es la última canción del álbum');
        }
    }

    const handlePreviousSong = () => {
        if (currentSongIndex > 0) {
            const prevIndex = currentSongIndex - 1;
            const prevSong = songs[prevIndex];
            console.log('[AlbumDetail] Cambiando a canción anterior:', prevSong.title);
            handlePlaySong(prevSong._id || prevSong.id);
        } else {
            console.log('[AlbumDetail] Ya es la primera canción del álbum');
        }
    }

    // Agregar listeners para eventos de navegación de canciones
    useEffect(() => {
        const handleNextSongEvent = () => {
            console.log('[AlbumDetail] Evento nextSong recibido');
            handleNextSong();
        };

        const handlePreviousSongEvent = () => {
            console.log('[AlbumDetail] Evento previousSong recibido');
            handlePreviousSong();
        };

        window.addEventListener('nextSong', handleNextSongEvent);
        window.addEventListener('previousSong', handlePreviousSongEvent);

        return () => {
            window.removeEventListener('nextSong', handleNextSongEvent);
            window.removeEventListener('previousSong', handlePreviousSongEvent);
        };
    }, [currentSongIndex, songs]); // Dependencias para que tenga acceso a las funciones actualizadas

    // Log de depuración para ver qué datos llegan
    console.log("[AlbumDetail] Álbum recibido:", album);
    console.log("[AlbumDetail] Canciones recibidas:", songs);
    console.log("[AlbumDetail] WebSocket conectado:", isConnected);
    console.log("[AlbumDetail] Canción actual:", currentSong);

    const handlePlayAlbum = () => {
        if (songs.length > 0) {
            console.log('[AlbumDetail] Reproduciendo álbum, primera canción:', songs[0]);
            playSong(songs[0]._id || songs[0].id)
        }
    }

    const handlePauseResume = () => {
        if (isPlaying) {
            pauseSong()
        } else if (currentSong) {
            playSong(currentSong._id)
        }
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 w-32 bg-zinc-800 rounded mb-6" />
                    <div className="flex items-center mb-6">
                        <div className="w-40 h-40 bg-zinc-800 rounded-lg mr-6" />
                        <div className="flex-1">
                            <div className="h-8 w-64 bg-zinc-800 rounded mb-4" />
                            <div className="h-4 w-48 bg-zinc-800 rounded mb-4" />
                            <div className="h-4 w-32 bg-zinc-800 rounded mb-4" />
                            <div className="flex space-x-3">
                                <div className="h-10 w-32 bg-zinc-800 rounded-full" />
                                <div className="h-10 w-32 bg-zinc-800 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 pb-24">
            <button
                onClick={onBack}
                className="mt-4 text-sm text-white hover:underline hover:text-purple-500 mb-6"
            >
                ← Volver a todos los álbumes
            </button>
            
            <div className="flex items-center mb-6">
                <img
                    src={album.image_url || "/placeholder.svg"}
                    alt={album.title}
                    className="w-40 h-40 object-cover rounded-lg mr-6"
                    onError={(e: any) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/placeholder.svg";
                    }}
                />
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{album.title}</h1>
                    <p className="text-zinc-300 mb-4">
                        Álbum de {album.artist}
                    </p>
                    <p className="text-sm text-zinc-400 mb-4">
                        {album.songsCount} canciones
                        {album.release_date && ` • ${new Date(album.release_date).getFullYear()}`}
                    </p>
                    <div className="flex space-x-3">
                        <button 
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full flex items-center"
                            onClick={handlePlayAlbum}
                            disabled={!isConnected || songs.length === 0}
                        >
                            {isPlaying && currentSong ? (
                                <Pause className="h-4 w-4 mr-2" />
                            ) : (
                                <Play className="h-4 w-4 mr-2" />
                            )}
                            {isPlaying && currentSong ? 'Pausar' : 'Reproducir'}
                        </button>
                        <button className="border border-zinc-600 hover:border-white text-white px-4 py-2 rounded-full flex items-center">
                            <Heart className="h-4 w-4 mr-2" /> Guardar
                        </button>
                        {streamError && (
                            <div className="text-red-400 text-sm">
                                Error: {streamError}
                            </div>
                        )}
                        {!isConnected && (
                            <div className="text-yellow-400 text-sm">
                                Conectando al servidor de streaming...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Canciones del álbum */}
            <div className="bg-zinc-900/40 rounded-md overflow-hidden">
                <div className="grid grid-cols-12 p-3 border-b border-zinc-800 text-xs uppercase text-zinc-500 font-medium">
                    <div className="col-span-1 flex items-center">#</div>
                    <div className="col-span-6 md:col-span-5">Título</div>
                    <div className="hidden md:block md:col-span-4">Álbum</div>
                    <div className="col-span-2 flex items-center justify-center text-center">
                        <Clock className="h-4 w-4" />
                    </div>
                </div>
                
                {songs.map((song, index) => (
                    <div
                        key={`album-song-${song._id}-${index}`}
                        className={`grid grid-cols-12 p-3 items-center hover:bg-zinc-800 group cursor-pointer ${
                            index % 2 === 0 ? "bg-zinc-900/60" : "bg-zinc-900/30"
                        }`}
                        onClick={() => {
                            console.log('[AlbumDetail] Reproduciendo canción:', song);
                            handlePlaySong(song._id || song.id);
                        }}
                    >
                        <div className="col-span-1 text-zinc-400 relative">
                            <span className="group-hover:opacity-0 transition-opacity">
                                {index + 1}
                            </span>
                            <button 
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                onClick={(e: any) => {
                                    e.stopPropagation();
                                    if (isPlaying && currentSong?._id === (song._id || song.id)) {
                                        pauseSong();
                                    } else {
                                        handlePlaySong(song._id || song.id);
                                    }
                                }}
                            >
                                {isPlaying && currentSong?._id === (song._id || song.id) ? (
                                    <Pause className="h-4 w-4 text-purple-400 fill-purple-400" />
                                ) : (
                                    <Play className="h-4 w-4 text-purple-400 fill-purple-400" />
                                )}
                            </button>
                        </div>
                        <div className="col-span-6 md:col-span-5 flex items-center">
                            <img
                                src={song.image_url || "/placeholder.svg"}
                                alt={song.title}
                                className="h-10 w-10 rounded mr-3"
                                onError={(e: any) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = "/placeholder.svg";
                                }}
                            />
                            <div>
                                <h3 className="text-sm font-medium text-white">{song.title}</h3>
                                <p className="text-xs text-zinc-400">{song.artist}</p>
                            </div>
                        </div>
                        <div className="hidden md:block md:col-span-4 text-sm text-zinc-400">
                            {song.album}
                        </div>
                        <div className="col-span-2 flex items-center justify-center text-center">
                            <span className="text-xs text-zinc-400">{song.duration}</span>
                        </div>
                    </div>
                ))}
                
                {songs.length === 0 && (
                    <div className="text-center py-6">
                        <p className="text-zinc-400">No hay canciones disponibles para este álbum</p>
                    </div>
                )}
            </div>
        </div>
    )
} 