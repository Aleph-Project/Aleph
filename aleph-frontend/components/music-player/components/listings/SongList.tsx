import { Song } from '../../types'
import { SongSkeleton } from '../skeletons/SkeletonComponents'
import { Play, Pause } from 'lucide-react'

interface SongListProps {
    songs: Song[];
    isLoading: boolean;
    onSongClick: (song: Song) => void;
    currentlyPlaying?: Song | null;
    isPlaying: boolean;
}

export function SongList({ 
    songs, 
    isLoading, 
    onSongClick, 
    currentlyPlaying,
    isPlaying 
}: SongListProps) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, index) => (
                    <SongSkeleton key={index} />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {songs.map((song) => {
                const isCurrentSong = currentlyPlaying?.id === song.id
                return (
                    <div
                        key={song.id}
                        onClick={() => onSongClick(song)}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                            isCurrentSong ? 'bg-zinc-800' : 'hover:bg-zinc-800'
                        }`}
                    >
                        <div className="w-8 h-8 rounded mr-3 overflow-hidden">
                            <img
                                src={song.coverUrl}
                                alt={song.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white truncate">
                                {song.title}
                            </h3>
                            <p className="text-xs text-zinc-400 truncate">
                                {song.artist}
                            </p>
                        </div>
                        <div className="ml-4">
                            {isCurrentSong && isPlaying ? (
                                <Pause className="h-5 w-5 text-green-500" />
                            ) : (
                                <Play className="h-5 w-5 text-zinc-400" />
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
} 