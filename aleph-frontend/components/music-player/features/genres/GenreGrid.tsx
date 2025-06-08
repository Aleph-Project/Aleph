import { Genre } from "../../types";
import { GenreCard } from "./GenreCard";
import { useGenres } from "../../hooks/useGenres";
import { useEffect } from "react";

export function GenreGrid() {
  const { genres, loading, error, fetchGenres } = useGenres();

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-full h-48 bg-gray-200 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error al cargar los géneros: {error}</p>
      </div>
    );
  }

  if (!genres.length) {
    return (
      <div className="text-center text-gray-500">
        <p>No se encontraron géneros</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {genres.map((genre) => (
        <GenreCard key={genre.id} genre={genre} />
      ))}
    </div>
  );
} 