import { useState } from "react";
import { Song, Album, Artist } from "../types";
import { searchSongsGraphQL, searchAlbumsGraphQL, searchArtistsGraphQL } from "@/services/songService";

interface UseSearchResult {
  searchResults: {
    songs: Song[];
    albums: Album[];
    artists: Artist[];
  };
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export function useSearch(): UseSearchResult {
  const [searchResults, setSearchResults] = useState<{
    songs: Song[];
    albums: Album[];
    artists: Artist[];
  }>({
    songs: [],
    albums: [],
    artists: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      clearSearch();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [songs, albums, artists] = await Promise.all([
        searchSongsGraphQL(query),
        searchAlbumsGraphQL(query),
        searchArtistsGraphQL(query),
      ]);

      setSearchResults({
        songs: Array.isArray(songs) ? songs : [],
        albums: Array.isArray(albums) ? albums : [],
        artists: Array.isArray(artists) ? artists : [],
      });
    } catch (err: any) {
      setError("Error al realizar la búsqueda");
      setSearchResults({
        songs: [],
        albums: [],
        artists: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults({
      songs: [],
      albums: [],
      artists: [],
    });
    setError(null);
  };

  return {
    searchResults,
    loading,
    error,
    search,
    clearSearch,
  };
} 