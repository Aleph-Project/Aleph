import { Genre } from "../../types";
import { useGenres } from "../../hooks/useGenres";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";

interface GenreCardProps {
  genre: Genre;
}

export function GenreCard({ genre }: GenreCardProps) {
  const { selectGenre, selectedGenre } = useGenres();
  const isSelected = selectedGenre?.id === genre.id;

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
            <Music2 className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{genre.name}</h3>
            <p className="text-sm text-gray-500">
              {genre.songs?.length || 0} canciones
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          onClick={() => selectGenre(genre)}
        >
          {isSelected ? "Seleccionado" : "Ver canciones"}
        </Button>
      </CardFooter>
    </Card>
  );
} 