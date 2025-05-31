export interface Artist {
    id: string;
    name: string;
    image_url: string;
    genres: string[];
    followers: number;
    monthly_listeners: number;
    bio?: string;
    social_links?: {
        spotify?: string;
        instagram?: string;
        twitter?: string;
        youtube?: string;
    };
}

export interface Album {
    id: string;
    title: string;
    cover_url: string;
    release_date: string;
    artist_id: string;
    artist_name: string;
    songs: Song[];
}

export interface Song {
    id: string;
    title: string;
    cover_url: string;
    audio_url: string;
    duration: number;
    artist_id: string;
    artist_name: string;
    album_id?: string;
    album_name?: string;
    plays: number;
    likes: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    category: string;
    count: number;
    image_url?: string;
    color?: string;
    genres?: string[];
}

export interface SearchResults {
    artists: Artist[];
    albums: Album[];
    songs: Song[];
}

export type ViewMode = 'normal' | 'artist-detail' | 'genre-detail';

export type Tab = 'artists' | 'albums' | 'songs';

export interface ArtistDetailProps {
    artist: Artist;
    albums: Album[];
    songs: Song[];
    isLoading: boolean;
    onAlbumClick: (album: Album) => void;
    onSongClick: (song: Song) => void;
    currentlyPlaying?: Song;
    isPlaying: boolean;
}

export interface GenreDetailProps {
    genre: Category;
    artists: Artist[];
    albums: Album[];
    songs: Song[];
    isLoading: boolean;
    onArtistClick: (artist: Artist) => void;
    onAlbumClick: (album: Album) => void;
    onSongClick: (song: Song) => void;
    currentlyPlaying?: Song;
    isPlaying: boolean;
}

export interface SearchBarProps {
    searchTerm: string;
    onSearch: (term: string) => void;
    onClear: () => void;
} 