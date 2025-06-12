import { Album } from "../../types";
import { useAlbums } from "../../hooks/useAlbums";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disc } from "lucide-react";

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const { selectAlbum, selectedAlbum } = useAlbums();
  const isSelected = selectedAlbum?.id === album.id;

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
            <Disc className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{album.title}</h3>
            <p className="text-sm text-gray-500">
              {album.artist?.name || "Artista desconocido"}
            </p>
            <p className="text-sm text-gray-500">
              {album.songs?.length || 0} canciones
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          onClick={() => selectAlbum(album)}
        >
          {isSelected ? "Seleccionado" : "Ver detalles"}
        </Button>
      </CardFooter>
    </Card>
  );
} 