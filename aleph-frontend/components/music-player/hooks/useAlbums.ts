import { useState } from "react";
import { Album } from "../types";
import { getAllAlbumsGraphQL, getAlbumByIdGraphQL } from "@/services/songService";

interface UseAlbumsResult {
  albums: Album[];
  loading: boolean;
  error: string | null;
  selectedAlbum: Album | null;
  fetchAlbums: () => Promise<void>;
  selectAlbum: (album: Album) => Promise<void>;
  clearSelectedAlbum: () => void;
}

export function useAlbums(): UseAlbumsResult {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // Cargar todos los álbumes
  const fetchAlbums = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAlbumsGraphQL();
      setAlbums(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError("No se pudieron cargar los álbumes");
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar un álbum y cargar sus detalles
  const selectAlbum = async (album: Album) => {
    setLoading(true);
    setError(null);
    try {
      const details = await getAlbumByIdGraphQL(album.id);
      setSelectedAlbum(details);
    } catch (err: any) {
      setError("No se pudieron cargar los detalles del álbum");
      setSelectedAlbum(album);
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedAlbum = () => {
    setSelectedAlbum(null);
  };

  return {
    albums,
    loading,
    error,
    selectedAlbum,
    fetchAlbums,
    selectAlbum,
    clearSelectedAlbum,
  };
} 