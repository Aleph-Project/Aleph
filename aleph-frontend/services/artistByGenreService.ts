import { gql } from '@apollo/client';
import client from './graphqlClient';
import { Artist } from './songService';

export const ARTISTS_BY_GENRE_QUERY = gql`
  query ArtistsByGenre($genre: String!) {
    artistsByGenre(genre: $genre) {
      id
      name
      image_url
      albums {
        id
        title
        image_url
        songs {
          id
          title
          duration
        }
      }
      songs {
        id
        title
        duration
      }
    }
  }
`;

export async function getArtistsByGenre(genreName: string): Promise<Artist[]> {
  const { data } = await client.query({
    query: ARTISTS_BY_GENRE_QUERY,
    variables: { genre: genreName },
    fetchPolicy: 'no-cache',
  });
  return data.artistsByGenre;
}
