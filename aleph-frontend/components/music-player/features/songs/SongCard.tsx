import { Song } from "../../types";
import { useSongs } from "../../hooks/useSongs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface SongCardProps {
  song: Song;
}

export function SongCard({ song }: SongCardProps) {
  const { selectSong, selectedSong } = useSongs();
  const isSelected = selectedSong?.id === song.id;

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
            <Play className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{song.title}</h3>
            <p className="text-sm text-gray-500">
              {song.artist || "Artista desconocido"}
            </p>
            <p className="text-sm text-gray-500">
              {song.album || "Álbum desconocido"}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          onClick={() => selectSong(song)}
        >
          {isSelected ? "Reproduciendo" : "Reproducir"}
        </Button>
      </CardFooter>
    </Card>
  );
} 