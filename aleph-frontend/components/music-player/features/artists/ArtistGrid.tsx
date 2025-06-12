import { Artist } from "../../types";
import { ArtistCard } from "./ArtistCard";
import { useArtists } from "../../hooks/useArtists";
import { useEffect } from "react";

export function ArtistGrid() {
  const { artists, loading, error, fetchArtists } = useArtists();

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

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
        <p>Error al cargar los artistas: {error}</p>
      </div>
    );
  }

  if (!artists.length) {
    return (
      <div className="text-center text-gray-500">
        <p>No se encontraron artistas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {artists.map((artist) => (
        <ArtistCard key={artist.id} artist={artist} />
      ))}
    </div>
  );
} 