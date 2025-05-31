import { Artist } from '../../types'
import { ArtistSkeleton } from '../skeletons/SkeletonComponents'

interface ArtistGridProps {
    artists: Artist[];
    isLoading: boolean;
    onArtistClick: (artist: Artist) => void;
}

export function ArtistGrid({ artists, isLoading, onArtistClick }: ArtistGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, index) => (
                    <ArtistSkeleton key={index} />
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {artists.map((artist) => (
                <div
                    key={artist.id}
                    onClick={() => onArtistClick(artist)}
                    className="group cursor-pointer"
                >
                    <div className="p-3 rounded-lg transition-colors hover:bg-zinc-800">
                        <div className="relative aspect-square rounded-full overflow-hidden mb-3">
                            <img
                                src={artist.imageUrl}
                                alt={artist.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h3 className="text-sm font-medium text-white truncate">
                            {artist.name}
                        </h3>
                        <p className="text-xs text-zinc-400 truncate">
                            Artista
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
} 