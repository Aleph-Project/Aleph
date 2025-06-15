"use client"

import React from "react"
import { Play } from "lucide-react"

interface SongCardProps {
    song: {
        id: string
        title: string
        artist?: string
        duration?: string
        image_url: string
        __typename?: string
    }
    onClick?: () => void
}

export function SongCard({ song, onClick }: SongCardProps) {
    const handlePlayClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        // Enviar evento personalizado para reproducir la canción
        window.dispatchEvent(new CustomEvent('playSong', {
            detail: {
                id: song.id,
                title: song.title,
                artist: song.artist || 'Artista desconocido',
                duration: song.duration || '0:00',
                image_url: song.image_url
            }
        }))
    }

    return (
        <div 
            className="group flex items-center gap-4 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors relative"
            onClick={onClick}
        >
            <div className="relative">
                <img
                    src={song.image_url || "/placeholder.svg"}
                    alt={song.title}
                    className="w-12 h-12 rounded object-cover"
                />
                {/* Overlay del botón de reproducción */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                    <button
                        onClick={handlePlayClick}
                        className="bg-white text-black rounded-full p-1.5 hover:scale-105 transition-transform"
                    >
                        <Play className="h-3 w-3" />
                    </button>
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-white truncate">{song.title}</h3>
                {song.artist && (
                    <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                )}
            </div>
            {song.duration && (
                <div className="text-xs text-zinc-400">
                    {song.duration}
                </div>
            )}
        </div>
    )
} 