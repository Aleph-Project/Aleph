import { gql } from '@apollo/client';
import client from './graphqlClient';

// Interface para artista básico optimizado
export interface ArtistBasic {
  id: string;
  name: string;
  image_url?: string;
  genres: string[];
  popularity?: number;
  album_count?: number;
  song_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Interface para género
export interface Genre {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

// Consulta optimizada para obtener todos los géneros
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

// Consulta optimizada para obtener artistas básicos por género
export const GET_ARTISTS_BY_GENRE_BASIC = gql`
  query GetArtistsByGenreBasic($genre: String!, $limit: Int, $offset: Int) {
    artistsByGenreBasic(genre: $genre, limit: $limit, offset: $offset) {
      id
      name
      image_url
      genres
      popularity
      album_count
      song_count
      created_at
      updated_at
    }
  }
`;

// Consulta para obtener el conteo de artistas por género
export const GET_ARTISTS_BY_GENRE_COUNT = gql`
  query GetArtistsByGenreCount($genre: String!) {
    artistsByGenreCount(genre: $genre)
  }
`;

// Función optimizada para obtener todos los géneros
export async function getAllGenresOptimized(): Promise<Genre[]> {
  try {
    const { data } = await client.query({
      query: GET_ALL_GENRES,
      fetchPolicy: 'cache-first', // Usar caché para géneros ya que cambian poco
    });
    return data.genres;
  } catch (error) {
    console.error('Error obteniendo géneros:', error);
    throw error;
  }
}

// Función optimizada para obtener artistas básicos por género
export async function getArtistsByGenreOptimized(
  genreName: string, 
  page: number = 1, 
  limit: number = 20
): Promise<{
  artists: ArtistBasic[];
  totalCount: number;
  hasNextPage: boolean;
  currentPage: number;
}> {
  try {
    const offset = (page - 1) * limit;

    // Ejecutar ambas consultas en paralelo
    const [artistsResult, countResult] = await Promise.all([
      client.query({
        query: GET_ARTISTS_BY_GENRE_BASIC,
        variables: { 
          genre: genreName, 
          limit, 
          offset 
        },
        fetchPolicy: 'cache-and-network',
      }),
      client.query({
        query: GET_ARTISTS_BY_GENRE_COUNT,
        variables: { genre: genreName },
        fetchPolicy: 'cache-and-network',
      })
    ]);

    const artists = artistsResult.data.artistsByGenreBasic;
    const totalCount = countResult.data.artistsByGenreCount;
    const hasNextPage = offset + limit < totalCount;

    return {
      artists,
      totalCount,
      hasNextPage,
      currentPage: page
    };
  } catch (error) {
    console.error(`Error obteniendo artistas para el género ${genreName}:`, error);
    throw error;
  }
}

// Función para obtener solo el conteo de artistas por género
export async function getArtistCountByGenre(genreName: string): Promise<number> {
  try {
    const { data } = await client.query({
      query: GET_ARTISTS_BY_GENRE_COUNT,
      variables: { genre: genreName },
      fetchPolicy: 'cache-first',
    });
    return data.artistsByGenreCount;
  } catch (error) {
    console.error(`Error obteniendo conteo de artistas para ${genreName}:`, error);
    throw error;
  }
}

// Función simplificada usando fetch (alternativa sin Apollo Client)
export async function getArtistsBasicByGenreFetch(genreName: string): Promise<ArtistBasic[]> {
  try {
    const query = `
      query GetArtistsByGenreBasic($genre: String!, $limit: Int, $offset: Int) {
        artistsByGenreBasic(genre: $genre, limit: $limit, offset: $offset) {
          id
          name
          image_url
          genres
          popularity
          album_count
          song_count
          created_at
          updated_at
        }
      }
    `;

    const response = await fetch('/api/v1/music/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          genre: genreName,
          limit: 100,
          offset: 0
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data?.artistsByGenreBasic || [];
  } catch (error) {
    console.error(`Error obteniendo artistas básicos para el género ${genreName}:`, error);
    return []; // Devolver array vacío en caso de error
  }
}

// Función simplificada para obtener artistas básicos para mostrar en la página de género
export async function getArtistsBasicByGenre(genreName: string): Promise<ArtistBasic[]> {
  // Usar la versión con fetch como alternativa a Apollo Client
  return getArtistsBasicByGenreFetch(genreName);
}

export default {
  getAllGenresOptimized,
  getArtistsByGenreOptimized,
  getArtistCountByGenre,
  getArtistsBasicByGenre,
  getArtistsBasicByGenreFetch
}; 