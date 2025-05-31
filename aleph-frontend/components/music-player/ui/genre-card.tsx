"use client"

import { Genre } from "../types"

interface GenreCardProps {
    genre: Genre
    onClick: () => void
}

export function GenreCard({ genre, onClick }: GenreCardProps) {
    return (
        <div 
            className="group cursor-pointer"
            onClick={onClick}
        >
            <div className="relative group-hover:bg-zinc-800 p-3 rounded-lg transition-colors">
                <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 mb-2 flex items-center justify-center">
                    <span className="text-2xl">🎵</span>
                </div>
                <h3 className="font-bold text-sm text-white truncate">{genre.name}</h3>
                <p className="text-xs text-zinc-400 truncate">
                    {genre.count ? `${genre.count} canciones` : "Género"}
                </p>
            </div>
        </div>
    )
} 