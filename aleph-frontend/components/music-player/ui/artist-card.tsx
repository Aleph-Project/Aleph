"use client"

import { Artist } from "../types"

interface ArtistCardProps {
    artist: Artist
    onClick: () => void
}

export function ArtistCard({ artist, onClick }: ArtistCardProps) {
    return (
        <div 
            className="group cursor-pointer"
            onClick={onClick}
        >
            <div className="relative group-hover:bg-zinc-800 p-3 rounded-lg transition-colors">
                <img
                    src={artist.image_url || "/placeholder.svg"}
                    alt={artist.name}
                    className="w-full aspect-square rounded-full object-cover mb-2"
                />
                <h3 className="font-bold text-sm text-white truncate">{artist.name}</h3>
                <p className="text-xs text-zinc-400 truncate">
                    {artist.genres && artist.genres.length > 0 ? artist.genres[0] : "Artista"}
                </p>
            </div>
        </div>
    )
} 