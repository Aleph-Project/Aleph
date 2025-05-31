"use client"

import { Album } from "../types"

interface AlbumCardProps {
    album: Album
    onClick: () => void
}

export function AlbumCard({ album, onClick }: AlbumCardProps) {
    return (
        <div 
            className="group cursor-pointer"
            onClick={onClick}
        >
            <div className="relative group-hover:bg-zinc-800 p-3 rounded-lg transition-colors">
                <img
                    src={album.image_url || "/placeholder.svg"}
                    alt={album.title}
                    className="w-full aspect-square rounded-lg object-cover mb-2"
                />
                <h3 className="font-bold text-sm text-white truncate">{album.title}</h3>
                <p className="text-xs text-zinc-400 truncate">{album.artist}</p>
            </div>
        </div>
    )
} 