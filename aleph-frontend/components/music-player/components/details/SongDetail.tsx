import { Song } from '../../types'
import { Play, Pause } from 'lucide-react'

interface SongDetailProps {
    song: Song;
    isPlaying: boolean;
    onPlayClick: () => void;
    onPauseClick: () => void;
}

export function SongDetail({
    song,
    isPlaying,
    onPlayClick,
    onPauseClick
}: SongDetailProps) {
    return (
        <div className="flex items-center space-x-6 p-6 bg-zinc-800 rounded-lg">
            {/* Imagen de la canción */}
            <div className="w-32 h-32 rounded-lg overflow-hidden">
                <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Información de la canción */}
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">
                    {song.title}
                </h1>
                <p className="text-zinc-400 mb-4">
                    {song.artist}
                    {song.album && ` • ${song.album}`}
                </p>
                {song.duration && (
                    <p className="text-sm text-zinc-500">
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                    </p>
                )}
            </div>

            {/* Controles de reproducción */}
            <button
                onClick={isPlaying ? onPauseClick : onPlayClick}
                className="p-4 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
            >
                {isPlaying ? (
                    <Pause className="h-6 w-6 text-white" />
                ) : (
                    <Play className="h-6 w-6 text-white" />
                )}
            </button>
        </div>
    )
} 