import { Review } from "@/services/reviewService";
import { Profile } from "@/services/profileService";
import { ReactSVGElement } from "react";

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
  cover_url: string;
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
  coverUrl: string;
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

// Función para obtener todos los detalles de un artista: información, álbumes y canciones
export async function getArtistDetails(artistId: string): Promise<ArtistDetails> {
  try {
    // console.log(`Obteniendo detalles completos del artista con ID: ${artistId}`);
    
    // Utilizar el endpoint del backend que devuelve todos los detalles del artista en una sola llamada
    const response = await fetch(`${MUSIC_API_URL}/artists/${artistId}/details`);
    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
    }
    
    // Si la respuesta es exitosa, procesar los datos
    const artistDetails = await response.json();
    // console.log(`Detalles completos del artista cargados en una sola petición.`);
    
    // Procesar el artista utilizando la función auxiliar
    const artist = processArtist(artistDetails);
    
    // Guardar temporalmente las canciones originales para usarlas en el procesamiento de álbumes
    const originalSongs = artistDetails.songs || [];
    
    // Procesar los álbumes utilizando la función auxiliar
    const albums = (artistDetails.albums || []).map((album: any) => 
      processAlbum(album, artist.name, originalSongs)
    );
    
    // Procesar las canciones utilizando la función auxiliar
    const songs = originalSongs.map((song: any) => 
      processSong(song, albums, artist.name)
    );
    
    const result = {
      artist,
      albums,
      songs
    };
    
    // console.log(`Resultado procesado completamente`, result);
    
    return result;
    
  } catch (error) {
    // console.error(`Error obteniendo detalles completos del artista ${artistId}:`, error);
    throw error;
  }
}

// Función auxiliar para procesar canciones y asegurar que tengan todos los campos necesarios
function processSong(song: any, albums: any[], artistName: string): Song {
  // Crear copia para no modificar el original
  const processedSong = { ...song };
  
  // Aplicar valores por defecto para todos los campos necesarios
  processedSong._id = processedSong._id || song.id || String(Math.floor(Math.random() * 10000));
  processedSong.title = processedSong.title || song.name || "Canción sin título";
  processedSong.artist = processedSong.artist || song.artist || artistName || "Artista desconocido";
  
  // Intentar encontrar el álbum correspondiente para usar su portada
  const songAlbum = albums.find((album: any) => album.title === song.album || album.id === song.album_id);
  processedSong.cover_url = processedSong.cover_url || song.imageUrl || song.image_url || 
                          (songAlbum ? songAlbum.coverUrl : null) || "/placeholder.svg";
  
  processedSong.duration = processedSong.duration || song.duration || "0:00";
  
  // Para el álbum: primero intentar por ID, luego por otras propiedades
  if (!processedSong.album) {
    const songAlbumById = albums.find((album: any) => album.id === song.album_id);
    const inferredAlbum = songAlbumById ? 
      songAlbumById.title : 
      albums.find((album: any) => album.coverUrl === song.cover_url)?.title;
    
    processedSong.album = song.album || inferredAlbum || "Álbum desconocido";
  }
  
  // Solo mostrar logs si realmente se hicieron cambios
  // if (processedSong._id !== song._id) console.log("Adaptando ID de canción:", processedSong._id);
  // if (processedSong.title !== song.title) console.log("Adaptando título de canción:", processedSong.title);
  // if (processedSong.artist !== song.artist) console.log("Adaptando artista de canción:", processedSong.artist);
  // if (processedSong.cover_url !== song.cover_url) console.log("Adaptando portada de canción:", processedSong.cover_url);
  // if (processedSong.duration !== song.duration) console.log("Adaptando duración de canción:", processedSong.duration);
  // if (processedSong.album !== song.album) console.log("Adaptando álbum de canción:", processedSong.album);
  
  return processedSong as Song;
}

// Función auxiliar para procesar álbumes y asegurar que tengan todos los campos necesarios
function processAlbum(album: any, artistName: string, songs: any[]): Album {
  // Crear copia para no modificar el original
  const processedAlbum = { ...album };
  
  // Aplicar valores por defecto para todos los campos necesarios
  processedAlbum.id = processedAlbum.id || album._id || String(Math.floor(Math.random() * 10000));
  processedAlbum.title = processedAlbum.title || album.name || "Álbum sin título";
  processedAlbum.artist = processedAlbum.artist || album.artist || artistName || "Artista desconocido";
  processedAlbum.coverUrl = processedAlbum.coverUrl || album.cover_url || album.image_url || 
                         album.imageUrl || album.img_url || "/placeholder.svg";
  
  // Calcular número de canciones relacionadas con este álbum
  if (!processedAlbum.songsCount) {
    const albumSongs = songs?.filter((song: any) => 
      song.album === processedAlbum.title || song.album_id === processedAlbum.id
    );
    processedAlbum.songsCount = albumSongs?.length || 0;
  }
  
  // Solo mostrar logs si realmente se hicieron cambios
  // if (processedAlbum.id !== album.id) console.log("Adaptando ID de álbum:", processedAlbum.id);
  // if (processedAlbum.title !== album.title) console.log("Adaptando título de álbum:", processedAlbum.title);
  // if (processedAlbum.artist !== album.artist) console.log("Adaptando artista de álbum:", processedAlbum.artist);
  // if (processedAlbum.coverUrl !== album.coverUrl) console.log("Adaptando imagen de álbum:", processedAlbum.coverUrl);
  // if (processedAlbum.songsCount !== album.songsCount) console.log("Calculando número de canciones del álbum:", processedAlbum.songsCount);
  
  return processedAlbum as Album;
}

// Función auxiliar para procesar artistas y asegurar que tengan todos los campos necesarios
function processArtist(artistData: any): Artist {
  // Determinar la fuente principal de datos del artista
  let artist: any;

  if (artistData.artist) {
    artist = { ...artistData.artist };
  } else if (artistData.name) {
    artist = { ...artistData };
  } else {
    artist = {};
  }
  
  // Aplicar valores por defecto para todos los campos necesarios
  artist.image_url = artist.image_url || artist.imageUrl || artist.img_url || 
                   artist.image || artistData.image_url || artistData.imageUrl || 
                   "/placeholder.svg";
  
  artist.id = artist.id || artistData.id || artistData.artist?.id || 
            String(Math.floor(Math.random() * 10000));
  
  artist.name = artist.name || artistData.name || artistData.artist?.name || 
              "Artista desconocido";
  
  // Solo mostrar logs si realmente hay cambios
  // console.log("Artista procesado completamente:", artist);
  
  return artist as Artist;
}

// Función para extraer álbumes reales desde las canciones
export function getAlbumsFromSongs(songs: Song[]): Album[] {
  // Usar un mapa para agrupar canciones por álbum y evitar duplicados
  const albumMap = new Map<string, Album>();
  
  songs.forEach(song => {
    if (song.album && !song.album.includes(' - Collection')) {
      // Usar una clave única basada en álbum y artista
      const albumKey = `${song.album}-${song.artist}`;
      
      // Si este álbum ya está en el mapa, incrementamos el contador de canciones
      if (albumMap.has(albumKey)) {
        const existingAlbum = albumMap.get(albumKey)!;
        existingAlbum.songsCount++;
        return;
      }
      
      // Sino, creamos una nueva entrada para el álbum
      albumMap.set(albumKey, {
        id: albumKey,
        title: song.album,
        artist: song.artist,
        coverUrl: song.cover_url,
        releaseDate: song.release_date,
        songsCount: 1
      });
    }
  });
  
  // Convertir el mapa a un array y ordenar por artista y álbum
  return Array.from(albumMap.values())
    .sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));
}

export async function getReviewsAndProfileBySong(id: string): Promise<ReviewsWithProfilesResponse> {
  try {
    const response = await fetch(`${COMPOSED_API_URL}/reviews-with-profile/${id}`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // El backend retorna { reviewsWithProfiles: [ { review: {...}, profile: {...} }, ... ] }
    const data = await response.json();
    // Validación opcional para asegurar estructura
    if (!Array.isArray(data.reviewsWithProfiles)) {
      throw new Error("Formato inesperado en la respuesta del backend");
    }
    return {
      reviewsWithProfiles: data.reviewsWithProfiles
    };
  } catch (error) {
    console.error("Error fetching reviews with profiles:", error);
    return { reviewsWithProfiles: [] };
  }
}
