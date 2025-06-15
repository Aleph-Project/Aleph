// Tipos principales para el reproductor de música

export interface Song {
    _id: string;  // Cambiado de id a _id para consistencia con MongoDB
    id: string;   // Mantenido para compatibilidad
    title: string;
    duration: string;
    artist: string;
    album: string;
    authors: string[];
    release_date: string;
    genre: string;
    likes: number;
    plays: number;
    image_url: string;
    audio_url: string;
    spotify_id: string;
    album_id: string;
    created_at: string;
    updated_at: string;
}

export interface Album {
    _id: string;   // Agregado para consistencia con MongoDB
    id: string;
    title: string;
    artist: string;
    image_url?: string;
    release_date?: string;   // Agregado para consistencia
    releaseDate?: string;
    songsCount: number;
}

export interface Artist {
    id: string;
    name: string;
    image_url: string;
    genres?: string[];
    popularity?: number;
}

export interface Genre {
    id: string;
    name: string;
    slug: string;
    count?: number;
}

export interface Category {
    id: string;
    name: string;
    image_url?: string;
    color?: string;
    genres?: Genre[];
} 