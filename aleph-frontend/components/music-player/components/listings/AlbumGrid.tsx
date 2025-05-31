import { Album } from '../../types'
import { AlbumSkeleton } from '../skeletons/SkeletonComponents'

interface AlbumGridProps {
    albums: Album[];
    isLoading: boolean;
    onAlbumClick: (album: Album) => void;
}

export function AlbumGrid({ albums, isLoading, onAlbumClick }: AlbumGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, index) => (
                    <AlbumSkeleton key={index} />
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {albums.map((album) => (
                <div
                    key={album.id}
                    onClick={() => onAlbumClick(album)}
                    className="group cursor-pointer"
                >
                    <div className="p-3 rounded-lg transition-colors hover:bg-zinc-800">
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                            <img
                                src={album.coverUrl}
                                alt={album.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h3 className="text-sm font-medium text-white truncate">
                            {album.title}
                        </h3>
                        <p className="text-xs text-zinc-400 truncate">
                            {album.artist}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
} 