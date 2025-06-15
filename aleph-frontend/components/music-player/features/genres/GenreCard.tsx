import { Genre } from "../../types";
import { useGenres } from "@/hooks/useGenres";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music2, Users } from "lucide-react";

interface GenreCardProps {
  genre: Genre;
}

export function GenreCard({ genre }: GenreCardProps) {
  const { selectGenre, selectedGenre, isLoadingArtists } = useGenres();
  const isSelected = selectedGenre?.id === genre.id;

  const handleSelectGenre = () => {
    selectGenre(genre);
  };

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Music2 className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold truncate">{genre.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="h-3 w-3" />
              <span>
                {genre.count || 0} artista{(genre.count || 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          onClick={handleSelectGenre}
          disabled={isLoadingArtists && isSelected}
        >
          {isLoadingArtists && isSelected 
            ? "Cargando..." 
            : isSelected 
              ? "Seleccionado" 
              : "Ver artistas"
          }
        </Button>
      </CardFooter>
    </Card>
  );
} 