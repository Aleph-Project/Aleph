"use client"

import { Genre } from "../types"

interface GenreCardProps {
    genre: Genre
    onClick: () => void
}

export function GenreCard({ genre, onClick }: GenreCardProps) {
    return (
        <div 
            className="group cursor-pointer select-none"
            onClick={onClick}
        >
            <div className="relative flex flex-col items-center justify-center aspect-square w-full h-full min-h-[72px] max-h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg transition-colors hover:from-indigo-700/60 hover:to-purple-900/60 border border-zinc-800 shadow-sm p-2">
                <span className="text-2xl mb-1">🎵</span>
                <span className="text-xs font-medium text-white text-center truncate w-full px-1">{genre.name}</span>
            </div>
        </div>
    )
}