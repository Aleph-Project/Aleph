import { Artist } from "../../types";
import { useArtists } from "../../hooks/useArtists";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const { selectArtist, selectedArtist } = useArtists();
  const isSelected = selectedArtist?.id === artist.id;

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <Music className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{artist.name}</h3>
            <p className="text-sm text-gray-500">
              {artist.albums?.length || 0} álbumes
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          onClick={() => selectArtist(artist)}
        >
          {isSelected ? "Seleccionado" : "Ver detalles"}
        </Button>
      </CardFooter>
    </Card>
  );
} 