import { Album } from "../../types";
import { AlbumCard } from "./AlbumCard";
import { useAlbums } from "../../hooks/useAlbums";
import { useEffect } from "react";

export function AlbumGrid() {
  const { albums, loading, error, fetchAlbums } = useAlbums();

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

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
        <p>Error al cargar los álbumes: {error}</p>
      </div>
    );
  }

  if (!albums.length) {
    return (
      <div className="text-center text-gray-500">
        <p>No se encontraron álbumes</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} />
      ))}
    </div>
  );
} 