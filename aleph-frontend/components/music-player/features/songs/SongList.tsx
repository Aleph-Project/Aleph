import { Song } from "../../types";
import { SongCard } from "./SongCard";
import { useSongs } from "../../hooks/useSongs";
import { useEffect } from "react";

export function SongList() {
  const { songs, loading, error, fetchSongs } = useSongs();

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-full h-24 bg-gray-200 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error al cargar las canciones: {error}</p>
      </div>
    );
  }

  if (!songs.length) {
    return (
      <div className="text-center text-gray-500">
        <p>No se encontraron canciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
} 