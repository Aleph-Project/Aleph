import { useState } from "react";
import { Artist, Album, Song } from "../types";
import { getAllArtistsGraphQL, getArtistByIdGraphQL } from "@/services/songService";

interface UseArtistsResult {
  artists: Artist[];
  loading: boolean;
  error: string | null;
  selectedArtist: Artist | null;
  artistAlbums: Album[];
  artistSongs: Song[];
  fetchArtists: () => Promise<void>;
  selectArtist: (artist: Artist) => Promise<void>;
  clearSelectedArtist: () => void;
}

export function useArtists(): UseArtistsResult {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistAlbums, setArtistAlbums] = useState<Album[]>([]);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);

  // Cargar todos los artistas
  const fetchArtists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllArtistsGraphQL();
      setArtists(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError("No se pudieron cargar los artistas");
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar un artista y cargar sus detalles
  const selectArtist = async (artist: Artist) => {
    setLoading(true);
    setError(null);
    try {
      const details = await getArtistByIdGraphQL(artist.id);
      setSelectedArtist(details);
      setArtistAlbums(details.albums || []);
      setArtistSongs(details.songs || []);
    } catch (err: any) {
      setError("No se pudieron cargar los detalles del artista");
      setSelectedArtist(artist);
      setArtistAlbums([]);
      setArtistSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedArtist = () => {
    setSelectedArtist(null);
    setArtistAlbums([]);
    setArtistSongs([]);
  };

  return {
    artists,
    loading,
    error,
    selectedArtist,
    artistAlbums,
    artistSongs,
    fetchArtists,
    selectArtist,
    clearSelectedArtist,
  };
} 