"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Genre } from "@/services/songService"

interface GenresModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    id: string;
    name: string;
    color?: string;
    genres?: Genre[];
  };
  onGenreSelect: (genre: {id: string, name: string, slug: string, category: string, count: number}) => void;
}

export function GenresModal({ isOpen, onClose, category, onGenreSelect }: GenresModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Géneros en {category.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {category.genres && category.genres.map((genre) => (
            <button 
              key={genre.id} 
              className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors"
              onClick={() => {
                onGenreSelect({
                  id: genre.id,
                  name: genre.name,
                  slug: genre.slug,
                  category: category.name,
                  count: genre.count
                });
                onClose();
              }}
            >
              <p className="font-medium text-white">{genre.name}</p>
              <p className="text-xs text-zinc-400">{genre.count} {genre.count === 1 ? 'artista' : 'artistas'}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
