"use client"

interface SongCardProps {
    song: {
        id: string
        title: string
        image_url: string
        __typename?: string
    }
    onClick: () => void
}

export function SongCard({ song, onClick }: SongCardProps) {
    return (
        <div 
            className="flex items-center gap-4 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
            onClick={onClick}
        >
            <img
                src={song.image_url || "/placeholder.svg"}
                alt={song.title}
                className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-white truncate">{song.title}</h3>
            </div>
        </div>
    )
} 