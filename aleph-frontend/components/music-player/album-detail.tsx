"use client"

import { Play, Heart, Clock } from "lucide-react"
import { Album, Song } from "@/components/music-player/types"

interface AlbumDetailProps {
    album: Album
    songs: Song[]
    isLoading: boolean
    onBack: () => void
}

export function AlbumDetail({ album, songs, isLoading, onBack }: AlbumDetailProps) {
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
        <div className="p-6">
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
                    onError={(e) => {
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
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full flex items-center">
                            <Play className="h-4 w-4 mr-2" /> Reproducir
                        </button>
                        <button className="border border-zinc-600 hover:border-white text-white px-4 py-2 rounded-full flex items-center">
                            <Heart className="h-4 w-4 mr-2" /> Guardar
                        </button>
                    </div>
                </div>
            </div>

            {/* Canciones del álbum */}
            <div className="bg-zinc-900/40 rounded-md overflow-hidden">
                <div className="grid grid-cols-12 p-3 border-b border-zinc-800 text-xs uppercase text-zinc-500 font-medium">
                    <div className="col-span-1 flex items-center">#</div>
                    <div className="col-span-6 md:col-span-5">Título</div>
                    <div className="hidden md:block md:col-span-3">Álbum</div>
                    <div className="col-span-4 md:col-span-2">
                        <Clock className="h-4 w-4" />
                    </div>
                </div>
                
                {songs.map((song, index) => (
                    <div
                        key={`album-song-${song._id}-${index}`}
                        className={`grid grid-cols-12 p-3 items-center hover:bg-zinc-800 ${
                            index % 2 === 0 ? "bg-zinc-900/60" : "bg-zinc-900/30"
                        }`}
                    >
                        <div className="col-span-1 text-zinc-400">{index + 1}</div>
                        <div className="col-span-6 md:col-span-5 flex items-center">
                            <img
                                src={song.image_url || "/placeholder.svg"}
                                alt={song.title}
                                className="h-10 w-10 rounded mr-3"
                                onError={(e) => {
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
                        <div className="hidden md:block md:col-span-3 text-sm text-zinc-400">
                            {song.album}
                        </div>
                        <div className="col-span-4 md:col-span-2 flex items-center justify-end">
                            <Heart className="h-5 w-5 text-zinc-400 hover:text-white mr-4 cursor-pointer" />
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