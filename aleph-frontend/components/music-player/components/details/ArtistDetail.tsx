import { Artist, Album, Song } from '../../types'
import { AlbumGrid } from '../listings/AlbumGrid'
import { SongList } from '../listings/SongList'
import { AlbumSkeleton } from '../skeletons/SkeletonComponents'

interface ArtistDetailProps {
    artist: Artist;
    albums: Album[];
    songs: Song[];
    isLoading: boolean;
    onAlbumClick: (album: Album) => void;
    onSongClick: (song: Song) => void;
    currentlyPlaying?: Song | null;
    isPlaying: boolean;
}

export function ArtistDetail({
    artist,
    albums,
    songs,
    isLoading,
    onAlbumClick,
    onSongClick,
    currentlyPlaying,
    isPlaying
}: ArtistDetailProps) {
    return (
        <div className="space-y-8">
            {/* Header del artista */}
            <div className="flex items-center space-x-6">
                <div className="w-32 h-32 rounded-full overflow-hidden">
                    <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {artist.name}
                    </h1>
                    <p className="text-zinc-400">
                        {albums.length} álbumes • {songs.length} canciones
                    </p>
                </div>
            </div>

            {/* Álbumes */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                    Álbumes
                </h2>
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <AlbumSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <AlbumGrid
                        albums={albums}
                        isLoading={false}
                        onAlbumClick={onAlbumClick}
                    />
                )}
            </div>

            {/* Canciones */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                    Canciones
                </h2>
                <SongList
                    songs={songs}
                    isLoading={isLoading}
                    onSongClick={onSongClick}
                    currentlyPlaying={currentlyPlaying}
                    isPlaying={isPlaying}
                />
            </div>
        </div>
    )
} 