import { useState } from "react";
import { Genre } from "../types";
import { getAllGenresGraphQL, getGenreByIdGraphQL } from "@/services/songService";

interface UseGenresResult {
  genres: Genre[];
  loading: boolean;
  error: string | null;
  selectedGenre: Genre | null;
  fetchGenres: () => Promise<void>;
  selectGenre: (genre: Genre) => Promise<void>;
  clearSelectedGenre: () => void;
}

export function useGenres(): UseGenresResult {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

  // Cargar todos los géneros
  const fetchGenres = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllGenresGraphQL();
      setGenres(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError("No se pudieron cargar los géneros");
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar un género y cargar sus detalles
  const selectGenre = async (genre: Genre) => {
    setLoading(true);
    setError(null);
    try {
      const details = await getGenreByIdGraphQL(genre.id);
      setSelectedGenre(details);
    } catch (err: any) {
      setError("No se pudieron cargar los detalles del género");
      setSelectedGenre(genre);
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedGenre = () => {
    setSelectedGenre(null);
  };

  return {
    genres,
    loading,
    error,
    selectedGenre,
    fetchGenres,
    selectGenre,
    clearSelectedGenre,
  };
} 