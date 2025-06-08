import { Artist, Album, Song } from './songService';
import { gql } from '@apollo/client';
import client from './graphqlClient';

// Interface para la información detallada de un género
export interface GenreDetails {
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
}

// URL base del microservicio
const MUSIC_API_URL = '/api/v1/music';

// Función para obtener los detalles de un género
export async function getGenreDetails(genreSlug: string): Promise<GenreDetails> {
  try {
    console.log(`Obteniendo detalles completos del género con slug: ${genreSlug}`);
    
    // Utilizar la ruta correcta del API para obtener un género por slug
    // La ruta correcta es /genres/slug/:slug en lugar de /genres/:slug/details
    const genreResponse = await fetch(`${MUSIC_API_URL}/genres/slug/${genreSlug}`);
    
    if (!genreResponse.ok) {
      throw new Error(`Error en la petición del género: ${genreResponse.status} ${genreResponse.statusText}`);
    }
    
    // Obtener la información básica del género
    const genreData = await genreResponse.json();
    console.log(`Género cargado: ${genreData.name}`);
    
    // Necesitamos hacer peticiones adicionales para obtener las canciones, artistas y álbumes relacionados
    
    // 1. Obtener canciones que pertenecen a este género
    const songsResponse = await fetch(`${MUSIC_API_URL}/songs?genre=${encodeURIComponent(genreData.name)}`);
    const songs = songsResponse.ok ? await songsResponse.json() : [];
    
    console.log(`Canciones cargadas para el género ${genreData.name}: ${Array.isArray(songs) ? songs.length : 0}`);
    
    // 2. Extraer artistas únicos de las canciones
    const artistsMap = new Map();
    const songsArray = Array.isArray(songs) ? songs : [];
    
    songsArray.forEach((song: Song) => {
      if (song.artist && !artistsMap.has(song.artist)) {
        artistsMap.set(song.artist, {
          id: song.artist,
          name: song.artist,
          image_url: song.cover_url
        });
      }
    });
    
    const artists = Array.from(artistsMap.values());
    
    // 3. Extraer álbumes únicos de las canciones
    const albumsMap = new Map();
    
    songsArray.forEach((song: Song) => {
      if (song.album && !albumsMap.has(song.album)) {
        albumsMap.set(song.album, {
          id: song.album_id || song.album,
          title: song.album,
          artist: song.artist,
          coverUrl: song.cover_url,
          releaseDate: song.release_date
        });
      }
    });
    
    const albums = Array.from(albumsMap.values());
    
    // Construir el objeto de detalles del género con todos los datos recopilados
    const genreDetails: GenreDetails = {
      genre: {
        id: genreData.id || "",
        name: genreData.name || "",
        slug: genreSlug,
        category: "",
        count: artists.length
      },
      artists: artists,
      albums: albums,
      songs: songsArray
    };
    
    console.log(`Detalles completos del género procesados: ${genreDetails.songs.length} canciones, ${genreDetails.artists.length} artistas, ${genreDetails.albums.length} álbumes`);
    
    return genreDetails;
    
  } catch (error) {
    console.error(`Error obteniendo detalles completos del género ${genreSlug}:`, error);
    throw error;
  }
}

export const GET_GENRE_BY_ID = gql`
  query GetGenreById($id: ID!) {
    genre(id: $id) {
      id
      name
      slug
      count
    }
  }
`;

// export async function getGenreByIdGraphQL(id: string) {
//   const { data } = await client.query({
//     query: GET_GENRE_BY_ID,
//     variables: { id },
//     fetchPolicy: 'no-cache',
//   });
//   return data.genre;
// }
