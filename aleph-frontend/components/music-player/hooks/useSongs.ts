import { useState } from "react";
import { Song } from "../types";
import { getAllSongsGraphQL, getSongByIdGraphQL } from "@/services/songService";

interface UseSongsResult {
  songs: Song[];
  loading: boolean;
  error: string | null;
  selectedSong: Song | null;
  fetchSongs: () => Promise<void>;
  selectSong: (song: Song) => Promise<void>;
  clearSelectedSong: () => void;
}

export function useSongs(): UseSongsResult {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // Cargar todas las canciones
  const fetchSongs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSongsGraphQL();
      setSongs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError("No se pudieron cargar las canciones");
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar una canción y cargar sus detalles
  const selectSong = async (song: Song) => {
    setLoading(true);
    setError(null);
    try {
      const details = await getSongByIdGraphQL(song.id);
      setSelectedSong(details);
    } catch (err: any) {
      setError("No se pudieron cargar los detalles de la canción");
      setSelectedSong(song);
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedSong = () => {
    setSelectedSong(null);
  };

  return {
    songs,
    loading,
    error,
    selectedSong,
    fetchSongs,
    selectSong,
    clearSelectedSong,
  };
} 