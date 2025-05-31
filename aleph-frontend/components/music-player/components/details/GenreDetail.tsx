import { Artist, Album, Song } from '../../types'
import { ArtistGrid } from '../listings/ArtistGrid'
import { AlbumGrid } from '../listings/AlbumGrid'
import { SongList } from '../listings/SongList'
import { ArtistSkeleton } from '../skeletons/SkeletonComponents'

interface GenreDetailProps {
    genre: {
        id: string;
        name: string;
        slug: string;
        category: string;
        count: number;
    };
    artists: Artist[];
    albums: Album[];
    songs: Song[];
    isLoading: boolean;
    onArtistClick: (artist: Artist) => void;
    onAlbumClick: (album: Album) => void;
    onSongClick: (song: Song) => void;
    currentlyPlaying?: Song | null;
    isPlaying: boolean;
}

export function GenreDetail({
    genre,
    artists,
    albums,
    songs,
    isLoading,
    onArtistClick,
    onAlbumClick,
    onSongClick,
    currentlyPlaying,
    isPlaying
}: GenreDetailProps) {
    return (
        <div className="space-y-8">
            {/* Header del género */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    {genre.name}
                </h1>
                <p className="text-zinc-400">
                    {artists.length} artistas • {albums.length} álbumes • {songs.length} canciones
                </p>
            </div>

            {/* Artistas */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                    Artistas
                </h2>
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <ArtistSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <ArtistGrid
                        artists={artists}
                        isLoading={false}
                        onArtistClick={onArtistClick}
                    />
                )}
            </div>

            {/* Álbumes */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                    Álbumes
                </h2>
                <AlbumGrid
                    albums={albums}
                    isLoading={isLoading}
                    onAlbumClick={onAlbumClick}
                />
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