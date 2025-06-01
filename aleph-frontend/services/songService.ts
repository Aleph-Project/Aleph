import { Review } from "@/services/reviewService";
import { Profile } from "@/services/profileService";
import { ReactSVGElement } from "react";

import { gql } from '@apollo/client';
import client from './graphqlClient';

// Definición de la interfaz Song que coincide con el modelo en el microservicio
export interface Song {
  _id: string;
  title: string;
  artist: string;
  authors: string[];
  album: string;
  release_date: string;
  duration: string;
  genre: string;
  likes: number;
  plays: number;
  image_url: string;
  audio_url: string;
  spotify_id?: string;  // ID del álbum en Spotify (opcional)
  album_id?: string;    // ID del álbum (opcional)
  created_at?: string;
  updated_at?: string;
}

// Interfaz para álbumes extraídos de canciones
export interface Album {
  id: string;
  title: string;  // Nombre real del álbum
  artist: string;
  image_url: string;
  releaseDate?: string;
  songsCount: number;
}

// Interfaz para artistas de la API
export interface Artist {
  id: string;
  name: string;
  image_url: string;
  genres?: string[];
  popularity?: number;
}

// Interfaz para categorías
// Interfaz para los géneros de música
export interface Genre {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface Category {
  id: string;
  name: string;
  image_url?: string;
  color?: string;
  genres?: Genre[];
}

// Interfaz para los datos completos de un artista con sus álbumes y canciones
export interface ArtistDetails {
  artist: Artist;
  albums: Album[];
  songs: Song[];
}

export interface ReviewWithProfile {
  review: Review;
  profile: Profile; 
}

export interface ReviewsWithProfilesResponse{
  reviewsWithProfiles: ReviewWithProfile[];
}

// URL base del microservicio utilizando variables de entorno
const LEGACY_BASE_URL = '/api';  // Ruta anterior para compatibilidad
const API_VERSION = 'v1';
const LEGACY_API_URL = `${LEGACY_BASE_URL}/${API_VERSION}`;

// Nueva estructura de rutas con prefijo /api/music
const MUSIC_API_URL = '/api/v1/music';
const COMPOSED_API_URL = '/api/v1/composite';  

// Función para obtener todas las canciones
export async function getAllSongs(): Promise<Song | null> {
  try {
    // Usar la nueva estructura de URL
    const response = await fetch(`${MUSIC_API_URL}/songs`);
    
    if (!response.ok) {
      // Intentar con la estructura antigua como fallback
      // console.warn('Trying legacy API endpoint as fallback');
      const legacyResponse = await fetch(`${LEGACY_API_URL}/songs`);
      
      if (!legacyResponse.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return legacyResponse.json();
    }
    
    return response.json();
  } catch (error) {
    // console.error('Error fetching songs:', error);
    throw error;
  }
}

// Función para obtener una canción por su ID
export async function getSongById(id: string): Promise<Song | null> {
  try {
    // Usar la nueva estructura de URL
    const response = await fetch(`${MUSIC_API_URL}/songs/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
       return null ; // Retornar null si la canción no se encuentra
      }
    }
    
    return response.json();
  } catch (error) {
    // console.error(`Error fetching song with id ${id}:`, error);
    throw error;
  }
}

// Función para obtener todos los artistas
export async function getAllArtists(): Promise<Artist[]> {
  try {
    // Usar la nueva estructura de URL
    const response = await fetch(`${MUSIC_API_URL}/artists`);
    
    if (!response.ok) {
      // Intentar con la estructura antigua como fallback
      // console.warn('Trying legacy API endpoint as fallback');
      const legacyResponse = await fetch(`${LEGACY_API_URL}/artists`);
      
      if (!legacyResponse.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return legacyResponse.json();
    }
    
    return response.json();
  } catch (error) {
    // console.error('Error fetching artists:', error);
    throw error;
  }
}

// Función para obtener un artista por su ID
export async function getArtistById(id: string): Promise<Artist> {
  try {
    // Usar la nueva estructura de URL
    const response = await fetch(`${MUSIC_API_URL}/artists/${id}`);
    
    if (!response.ok) {
      // Intentar con la estructura antigua como fallback
      // console.warn('Trying legacy API endpoint as fallback');
      const legacyResponse = await fetch(`${LEGACY_API_URL}/artists/${id}`);
      
      if (!legacyResponse.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return legacyResponse.json();
    }
    
    return response.json();
  } catch (error) {
    // console.error(`Error fetching artist with id ${id}:`, error);
    throw error;
  }
}

/**
 * @deprecated Esta función está obsoleta y será eliminada en futuras versiones.
 * Usar getArtistDetails en su lugar para obtener toda la información del artista incluyendo sus canciones.
 */
// Función para obtener todas las canciones de un artista por su ID
export async function getSongsByArtist(artistName: string): Promise<Song[]> {
  // console.warn('DEPRECATED: getSongsByArtist está obsoleta. Usar getArtistDetails en su lugar.');
  try {
    // Obtener todas las canciones
    const allSongs = await getAllSongs();
    
    // Filtrar solo las canciones del artista
    return allSongs.filter(song => song.artist === artistName);
  } catch (error) {
    // console.error(`Error fetching songs for artist ${artistName}:`, error);
    throw error;
  }
}

/**
 * @deprecated Esta función está obsoleta y será eliminada en futuras versiones.
 * Usar getArtistDetails en su lugar para obtener toda la información del artista incluyendo sus álbumes.
 */
// Función para obtener todos los álbumes de un artista por su nombre
export async function getAlbumsByArtist(artistName: string): Promise<Album[]> {
  // console.warn('DEPRECATED: getAlbumsByArtist está obsoleta. Usar getArtistDetails en su lugar.');
  try {
    // Obtener todos los álbumes
    const allAlbums = await getAllAlbums();
    
    // Filtrar solo los álbumes del artista
    return allAlbums.filter(album => album.artist === artistName);
  } catch (error) {
    // console.error(`Error fetching albums for artist ${artistName}:`, error);
    throw error;
  }
}

// Función para obtener todos los álbumes
export async function getAllAlbums(): Promise<Album[]> {
  try {
    // Usar la nueva estructura de URL
    const response = await fetch(`${MUSIC_API_URL}/albums`);
    
    if (!response.ok) {
      // Intentar con la estructura antigua como fallback
      // console.warn('Trying legacy API endpoint as fallback for albums');
      const legacyResponse = await fetch(`${LEGACY_API_URL}/albums`);
      
      if (!legacyResponse.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return legacyResponse.json();
    }
    
    return response.json();
  } catch (error) {
    // console.error('Error fetching albums:', error);
    throw error;
  }
}

// Función para obtener un álbum por su ID
export async function getAlbumById(id: string): Promise<Album> {
  try {
    // Usar la nueva estructura de URL
    const response = await fetch(`${MUSIC_API_URL}/albums/${id}`);
    
    if (!response.ok) {
      // Intentar con la estructura antigua como fallback
      // console.warn('Trying legacy API endpoint as fallback');
      const legacyResponse = await fetch(`${LEGACY_API_URL}/albums/${id}`);
      
      if (!legacyResponse.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return legacyResponse.json();
    }
    
    return response.json();
  } catch (error) {
    // console.error(`Error fetching album with id ${id}:`, error);
    throw error;
  }
}

// Función para obtener todas las categorías
export async function getAllCategories(): Promise<Category[]> {
  try {
    // Usar la nueva estructura de URL
    const response = await fetch(`${MUSIC_API_URL}/categories`);
    
    if (!response.ok) {
      // Intentar con la estructura antigua como fallback
      // console.warn('Trying legacy API endpoint as fallback for categories');
      const legacyResponse = await fetch(`${LEGACY_API_URL}/categories`);
      
      if (!legacyResponse.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await legacyResponse.json();
      return processCategories(data);
    }
    
    const data = await response.json();
    return processCategories(data);
  } catch (error) {
    // console.error('Error fetching categories:', error);
    throw error;
  }
}

// Función para obtener todos los géneros
export async function getAllGenres(): Promise<Genre[]> {
  try {
    // Usar la nueva estructura de URL
    const response = await fetch(`${MUSIC_API_URL}/genres`);
    
    if (!response.ok) {
      // Intentar con la estructura antigua como fallback
      // console.warn('Trying legacy API endpoint as fallback for genres');
      const legacyResponse = await fetch(`${LEGACY_API_URL}/genres`);
      
      if (!legacyResponse.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return legacyResponse.json();
    }
    
    return response.json();
  } catch (error) {
    // console.error('Error fetching genres:', error);
    throw error;
  }
}

// Función auxiliar para procesar categorías y asegurar que tengan el formato correcto
function processCategories(categories: any[]): Category[] {
  return categories.map(category => {
    // Verificar si la categoría tiene el formato esperado
    const processedCategory = {
      id: category.id || category._id || String(Math.random()),
      name: category.name,
      // Si hay géneros disponibles, crear una URL de imagen basada en el primer género
      image_url: category.image_url || 
                (category.genres && category.genres.length > 0 
                  ? `/api/v1/music/genres/${category.genres[0].slug}/image` 
                  : '/placeholder.svg?height=200&width=200'),
      color: category.color || getRandomGradient(), // Usar color existente o generar uno aleatorio
      // Agregar los géneros si están disponibles
      genres: category.genres || []
    };
    
    // console.log("Categoría procesada:", processedCategory);
    return processedCategory;
  });
}

// Función para generar un gradiente aleatorio de color para categorías sin color definido
function getRandomGradient(): string {
  const gradients = [
    'from-pink-500 to-purple-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-red-800',
    'from-blue-400 to-indigo-600',
    'from-purple-400 to-purple-800',
    'from-green-400 to-emerald-600',
    'from-amber-500 to-yellow-800',
    'from-gray-400 to-gray-700',
    'from-teal-400 to-cyan-600',
    'from-rose-400 to-pink-600'
  ];
  
  return gradients[Math.floor(Math.random() * gradients.length)];
}

// Función para obtener una categoría por su ID
export async function getCategoryById(id: string): Promise<Category> {
  try {
    // Usar la nueva estructura de URL
    const response = await fetch(`${MUSIC_API_URL}/categories/${id}`);
    
    if (!response.ok) {
      // Intentar con la estructura antigua como fallback
      // console.warn('Trying legacy API endpoint as fallback');
      const legacyResponse = await fetch(`${LEGACY_API_URL}/categories/${id}`);
      
      if (!legacyResponse.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return legacyResponse.json();
    }
    
    return response.json();
  } catch (error) {
    // console.error(`Error fetching category with id ${id}:`, error);
    throw error;
  }
}

// Función para obtener el audio de una canción
export async function getSongAudio(id: string): Promise<Blob> {
  try {
    // Usar la nueva estructura de URL
    const response = await fetch(`${MUSIC_API_URL}/songs/${id}/audio`);
    
    if (!response.ok) {
      // Intentar con la estructura antigua como fallback
      // console.warn('Trying legacy API endpoint as fallback');
      const legacyResponse = await fetch(`${LEGACY_API_URL}/songs/${id}/audio`);
      
      if (!legacyResponse.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return legacyResponse.blob();
    }
    
    return response.blob();
  } catch (error) {
    // console.error(`Error fetching audio for song ${id}:`, error);
    throw error;
  }
}

// Función para obtener todas las canciones
export async function getAllSongsGraphQL() {
  const { data } = await client.query({
    query: GET_ALL_SONGS,
    fetchPolicy: 'no-cache',
  });
  return data.songs;
}

// Función para obtener una canción por su ID
export async function getSongByIdGraphQL(id: string) {
  const { data } = await client.query({
    query: GET_SONG_BY_ID,
    variables: { id },
    fetchPolicy: 'no-cache',
  });
  return data.song;
}

// Función para obtener todos los artistas
export async function getAllArtistsGraphQL() {
  const { data } = await client.query({
    query: GET_ALL_ARTISTS,
    fetchPolicy: 'no-cache',
  });
  return data.artists;
}

// Función para obtener un artista por su ID
export async function getArtistByIdGraphQL(id: string) {
  const { data } = await client.query({
    query: GET_ARTIST_BY_ID,
    variables: { id },
    fetchPolicy: 'no-cache',
  });
  return data.artist;
}

// Función para obtener todos los álbumes
export async function getAllAlbumsGraphQL() {
  const { data } = await client.query({
    query: GET_ALL_ALBUMS,
    fetchPolicy: 'no-cache',
  });
  return data.albums;
}

// Función para obtener un álbum por su ID
export async function getAlbumByIdGraphQL(id: string) {
  const { data } = await client.query({
    query: GET_ALBUM_BY_ID,
    variables: { id },
    fetchPolicy: 'no-cache',
  });
  return data.album;
}

// Función para obtener todas las categorías
export async function getAllCategoriesGraphQL() {
  const { data } = await client.query({
    query: GET_ALL_CATEGORIES,
    fetchPolicy: 'no-cache',
  });
  return data.categories;
}

// Función para obtener todos los géneros
export async function getAllGenresGraphQL() {
  const { data } = await client.query({
    query: GET_ALL_GENRES,
    fetchPolicy: 'no-cache',
  });
  return data.genres;
}

// Función para obtener una categoría por su ID
export async function getCategoryByIdGraphQL(id: string) {
  const { data } = await client.query({
    query: GET_CATEGORY_BY_ID,
    variables: { id },
    fetchPolicy: 'no-cache',
  });
  return data.category;
}

// GraphQL

export const GET_ALL_SONGS = gql`
  query GetAllSongs {
    songs {
      id
      title
      duration
      spotify_id
      album_id
      track_number
      audio_url
      created_at
      updated_at
      album {
        id
        title
        image_url
      }
      artists {
        id
        name
        image_url
      }
    }
  }
`;

export const GET_SONG_BY_ID = gql`
  query GetSongById($id: ID!) {
    song(id: $id) {
      id
      title
      duration
      spotify_id
      album_id
      track_number
      audio_url
      created_at
      updated_at
      album {
        id
        title
        image_url
      }
      artists {
        id
        name
        image_url
      }
    }
  }
`;

export const GET_ALL_ARTISTS = gql`
    query GetAllArtists {
      artists {
        id
        name
        spotify_id
        image_url
        genres
        popularity
        created_at
        updated_at
      }
    }
`;

export const GET_ARTIST_BY_ID = gql`
  query GetArtistById($id: ID!) {
    artist(id: $id) {
      id
      name
      spotify_id
      image_url
      genres
      popularity
      created_at
      updated_at
      albums {
        id
        title
        image_url
        release_date
      }
      songs {
        id
        title
        duration
        album {
          id
          title
        }
      }
    }
  }
`;

export const GET_ALL_ALBUMS = gql`
  query GetAllAlbums {
    albums {
      id
      title
      release_date
      spotify_id
      image_url
      year
      created_at
      updated_at
      artist_ids
    }
  }
`;

export const GET_ALBUM_BY_ID = gql`
  query GetAlbumById($id: ID!) {
    album(id: $id) {
      id
      title
      release_date
      spotify_id
      image_url
      year
      created_at
      updated_at
      artists {
        id
        name
        image_url
      }
      songs {
        id
        title
        duration
      }
    }
  }
`;

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories {
      id
      name
      slug
      image_url
      genres {
        id
        name
        slug
        count
      }
    }
  }
`;

export const GET_ALL_GENRES = gql`
  query GetAllGenres {
    genres {
      id
      name
      slug
      count
    }
  }
`;

export const GET_CATEGORY_BY_ID = gql`
  query GetCategoryById($id: ID!) {
    category(id: $id) {
      id
      name
      slug
      image_url
      genres {
        id
        name
        slug
        count
      }
    }
  }
`;

export const GET_ARTIST_DETAILS = gql`
  query GetArtistDetails($id: ID!) {
    artist(id: $id) {
      id
      name
      image_url
      genres
      popularity
      albums {
        id
        title
        image_url
        release_date
        year
        songs {
          id
          title
          duration
          track_number
          audio_url
        }
      }
      songs {
        id
        title
        duration
        track_number
        audio_url
        album {
          id
          title
          image_url
        }
      }
    }
  }
`;

export async function getArtistDetailsGraphQL(id: string): Promise<ArtistDetails> {
  try {
    const { data } = await client.query({
      query: GET_ARTIST_DETAILS,
      variables: { id }
    });

    const artistData = data.artist;

    // Procesar el artista
    const artist: Artist = {
      id: artistData.id,
      name: artistData.name,
      image_url: artistData.image_url,
      genres: artistData.genres,
      popularity: artistData.popularity
    };

    // Procesar los álbumes
    const albums: Album[] = artistData.albums.map((album: any) => ({
      id: album.id,
      title: album.title,
      image_url: album.image_url,
      releaseDate: album.release_date,
      songsCount: album.songs?.length || 0
    }));

    // Procesar las canciones
    const songs: Song[] = artistData.songs.map((song: any) => ({
      _id: song.id,
      title: song.title,
      artist: artistData.name,
      authors: [artistData.name],
      album: song.album?.title || '',
      release_date: '',
      duration: song.duration.toString(),
      genre: '',
      likes: 0,
      plays: 0,
      image_url: song.album?.image_url || '',
      audio_url: song.audio_url || '',
      album_id: song.album?.id
    }));

    return {
      artist,
      albums,
      songs
    };
  } catch (error) {
    console.error('Error fetching artist details:', error);
    throw error;
  }
}

export async function getAlbumDetailsGraphQL(albumId: string): Promise<{ album: Album; songs: Song[] }> {
    try {
        // Primero obtenemos los detalles del álbum
        const { data: albumData } = await client.query({
            query: gql`
                query GetAlbumDetails($albumId: ID!) {
                    album(id: $albumId) {
                        id
                        title
                        image_url
                        release_date
                        artist_ids
                        songs {
                            id
                            title
                            duration
                        }
                    }
                }
            `,
            variables: { albumId }
        });

        if (!albumData?.album) {
            throw new Error('Álbum no encontrado');
        }

        // Si hay artist_ids, obtenemos los detalles de los artistas
        let artistName = 'Artista desconocido';
        if (albumData.album.artist_ids && albumData.album.artist_ids.length > 0) {
            const { data: artistData } = await client.query({
                query: gql`
                    query GetArtistById($id: ID!) {
                        artist(id: $id) {
                            id
                            name
                        }
                    }
                `,
                variables: { id: albumData.album.artist_ids[0] }
            });
            
            if (artistData?.artist) {
                artistName = artistData.artist.name;
            }
        }
        
        return {
            album: {
                id: albumData.album.id,
                title: albumData.album.title,
                image_url: albumData.album.image_url,
                artist: artistName,
                releaseDate: albumData.album.release_date,
                songsCount: albumData.album.songs.length
            },
            songs: albumData.album.songs.map((song: any) => ({
                _id: song.id,
                title: song.title,
                artist: artistName,
                authors: [artistName],
                album: albumData.album.title,
                release_date: albumData.album.release_date,
                duration: song.duration.toString(),
                genre: '',
                likes: 0,
                plays: 0,
                image_url: albumData.album.image_url,
                audio_url: '',
                album_id: albumData.album.id
            }))
        };
    } catch (error) {
        console.error('Error fetching album details:', error);
        throw error;
    }
}