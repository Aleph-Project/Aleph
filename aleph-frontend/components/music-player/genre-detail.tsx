"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Heart, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Settings } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Song as SongType, Album as AlbumType, Artist as ArtistType } from "@/services/songService"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface GenreDetailProps {
  genre: {
    id: string;
    name: string;
    slug: string;
    category: string;
    count: number;
  };
  artists: ArtistType[];
  albums: AlbumType[];
  songs: SongType[];
  isLoading: boolean;
  onSelectRelatedGenre?: (genreName: string) => void;
  onArtistSelect?: (artist: ArtistType) => void;
}

export function GenreDetail({ genre, artists, albums, songs, isLoading, onSelectRelatedGenre, onArtistSelect }: GenreDetailProps) {
  // Ref para el contenedor principal para animaciones
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Estado para controlar animaciones de transición
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Estado para guardar géneros visitados
  const [visitedGenres, setVisitedGenres] = useState<string[]>([]);
  
  // Estado para paginación avanzada
  const [showPaginationDropdown, setShowPaginationDropdown] = useState<{
    artists: boolean;
    albums: boolean;
    songs: boolean;
  }>({
    artists: false,
    albums: false,
    songs: false
  });
  
  // Estados para paginación
  const [currentArtistPage, setCurrentArtistPage] = useState(0);
  const [currentAlbumPage, setCurrentAlbumPage] = useState(0);
  const [currentSongPage, setCurrentSongPage] = useState(0);
  
  // Estados para filtrado
  const [artistFilter, setArtistFilter] = useState("");
  const [albumFilter, setAlbumFilter] = useState("");
  const [songFilter, setSongFilter] = useState("");
  
  // Efecto para registrar el género actual como visitado
  useEffect(() => {
    if (genre?.name && !isLoading) {
      setVisitedGenres(prev => {
        if (!prev.includes(genre.name)) {
          // Guardar en localStorage para persistencia entre sesiones
          const updatedGenres = [...prev, genre.name];
          try {
            localStorage.setItem('visitedGenres', JSON.stringify(updatedGenres));
          } catch (error) {
            console.error('Error al guardar en localStorage:', error);
          }
          return updatedGenres;
        }
        return prev;
      });
    }
  }, [genre?.name, isLoading]);

  // Efecto para cargar géneros visitados desde localStorage
  useEffect(() => {
    try {
      const storedGenres = localStorage.getItem('visitedGenres');
      if (storedGenres) {
        setVisitedGenres(JSON.parse(storedGenres));
      }
    } catch (error) {
      console.error('Error al cargar de localStorage:', error);
    }
  }, []);
  
  // Efecto para animar la entrada y salida del componente
  useEffect(() => {
    if (!isLoading && containerRef.current) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [genre?.id, isLoading]);
  
  // Configuración de paginación
  const ARTISTS_PER_PAGE = 6;
  const ALBUMS_PER_PAGE = 6;
  const SONGS_PER_PAGE = 5;
  
  // Aplicar filtros a las listas
  const filteredArtists = artists.filter(artist => 
    artist.name.toLowerCase().includes(artistFilter.toLowerCase())
  );
  
  const filteredAlbums = albums.filter(album => 
    album.title.toLowerCase().includes(albumFilter.toLowerCase())
  );
  
  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(songFilter.toLowerCase()) || 
    song.artist.toLowerCase().includes(songFilter.toLowerCase())
  );
  
  // Calculamos el número de páginas para cada sección
  const artistsPages = Math.ceil(filteredArtists.length / ARTISTS_PER_PAGE);
  const albumsPages = Math.ceil(filteredAlbums.length / ALBUMS_PER_PAGE);
  const songsPages = Math.ceil(filteredSongs.length / SONGS_PER_PAGE);
  
  // Obtenemos los elementos para la página actual
  const paginatedArtists = filteredArtists.slice(
    currentArtistPage * ARTISTS_PER_PAGE,
    (currentArtistPage + 1) * ARTISTS_PER_PAGE
  );
  
  const paginatedAlbums = filteredAlbums.slice(
    currentAlbumPage * ALBUMS_PER_PAGE,
    (currentAlbumPage + 1) * ALBUMS_PER_PAGE
  );
  
  const paginatedSongs = filteredSongs.slice(
    currentSongPage * SONGS_PER_PAGE,
    (currentSongPage + 1) * SONGS_PER_PAGE
  );
  
  // Funciones para navegar entre páginas
  const nextArtistPage = () => {
    if (currentArtistPage < artistsPages - 1) {
      setCurrentArtistPage(currentArtistPage + 1);
    }
  };
  
  const prevArtistPage = () => {
    if (currentArtistPage > 0) {
      setCurrentArtistPage(currentArtistPage - 1);
    }
  };
  
  const nextAlbumPage = () => {
    if (currentAlbumPage < albumsPages - 1) {
      setCurrentAlbumPage(currentAlbumPage + 1);
    }
  };
  
  const prevAlbumPage = () => {
    if (currentAlbumPage > 0) {
      setCurrentAlbumPage(currentAlbumPage - 1);
    }
  };
  
  const nextSongPage = () => {
    if (currentSongPage < songsPages - 1) {
      setCurrentSongPage(currentSongPage + 1);
    }
  };
  
  const prevSongPage = () => {
    if (currentSongPage > 0) {
      setCurrentSongPage(currentSongPage - 1);
    }
  };

  const ArtistSkeleton = () => (
    <div className="group">
      <div className="p-3 rounded-lg">
        <Skeleton className="w-full aspect-square rounded-full mb-3" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
  
  const AlbumSkeleton = () => (
    <div className="group">
      <div className="p-3 rounded-lg">
        <Skeleton className="w-full aspect-square rounded-lg mb-3" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )

  const SongSkeleton = () => (
    <div className="flex items-center p-3">
      <Skeleton className="h-8 w-8 rounded mr-3" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-10" />
    </div>
  )

  const GenreHeaderSkeleton = () => (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-indigo-900/40 to-zinc-900/0 p-6 mb-8">
      <div className="flex flex-col relative z-10">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-4" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6 w-full">
      {/* Cabecera del género */}
      {isLoading ? (
        <GenreHeaderSkeleton />
      ) : (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-indigo-900/40 to-zinc-900/0 p-6 mb-8">
          <div className="flex flex-col relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white">{genre.name}</h1>
              {/* Indicador de género visitado */}
              {visitedGenres.includes(genre.name) && (
                <div className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Visitado
                </div>
              )}
            </div>
            <p className="text-zinc-300 mb-4">
              {filteredArtists.length === 1
                ? `1 artista`
                : `${filteredArtists.length} artistas`}
            </p>
          </div>
          
          {/* Fondo con efecto gradient */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-indigo-800/30 to-purple-900/20" 
            style={{ 
              filter: 'blur(8px)'
            }}
          ></div>
        </div>
      )}
      
      {/* Sección de artistas del género */}
      <div>
        <div className="flex flex-col space-y-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Artistas de {genre.name}</h2>
            {filteredArtists && filteredArtists.length > ARTISTS_PER_PAGE && (
              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={prevArtistPage}
                  disabled={currentArtistPage === 0}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Anterior</span>
                </Button>
                <span className="text-xs text-zinc-400">{currentArtistPage + 1}/{artistsPages}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={nextArtistPage}
                  disabled={currentArtistPage >= artistsPages - 1}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Siguiente</span>
                </Button>
              </div>
            )}
          </div>
          {/* Campo de búsqueda de artistas */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={artistFilter}
              onChange={(e) => {
                setArtistFilter(e.target.value);
                setCurrentArtistPage(0); // Reiniciar a la primera página al filtrar
              }}
              placeholder="Buscar artistas..."
              className="w-full py-2 pl-8 pr-4 bg-zinc-800 rounded-md text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {artistFilter && (
              <button 
                className="absolute inset-y-0 right-0 flex items-center pr-2.5"
                onClick={() => {
                  setArtistFilter("");
                  setCurrentArtistPage(0);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <ArtistSkeleton key={index} />
            ))}
          </div>
        ) : artists && artists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {paginatedArtists.map((artist) => (
              <div 
                key={artist.id} 
                className="group cursor-pointer"
                onClick={() => {
                  if (onArtistSelect) {
                    onArtistSelect(artist);
                  }
                }}
              >
                <div className="relative group-hover:bg-zinc-800 p-3 rounded-lg transition-colors">
                  <img
                    src={artist.image_url || "/placeholder.svg"}
                    alt={artist.name}
                    className="w-full aspect-square rounded-full object-cover mb-2"
                  />
                  <h3 className="font-bold text-sm text-white truncate">{artist.name}</h3>
                  <p className="text-xs text-zinc-400 truncate">
                    {artist.genres && artist.genres.length > 0 ? artist.genres[0] : "Artista"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-zinc-900/40 rounded-lg">
            <p className="text-zinc-400">No hay artistas disponibles para este género.</p>
          </div>
        )}
      </div>
      {/* Sección de álbumes de los artistas del género */}
      <div>
        <div className="flex flex-col space-y-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Álbumes</h2>
            {filteredAlbums && filteredAlbums.length > ALBUMS_PER_PAGE && (
              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={prevAlbumPage}
                  disabled={currentAlbumPage === 0}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Anterior</span>
                </Button>
                <span className="text-xs text-zinc-400">{currentAlbumPage + 1}/{albumsPages}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={nextAlbumPage}
                  disabled={currentAlbumPage >= albumsPages - 1}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Siguiente</span>
                </Button>
              </div>
            )}
          </div>
          {/* Campo de búsqueda de álbumes */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={albumFilter}
              onChange={(e) => {
                setAlbumFilter(e.target.value);
                setCurrentAlbumPage(0); // Reiniciar a la primera página al filtrar
              }}
              placeholder="Buscar álbumes..."
              className="w-full py-2 pl-8 pr-4 bg-zinc-800 rounded-md text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {albumFilter && (
              <button 
                className="absolute inset-y-0 right-0 flex items-center pr-2.5"
                onClick={() => {
                  setAlbumFilter("");
                  setCurrentAlbumPage(0);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <AlbumSkeleton key={index} />
            ))}
          </div>
        ) : albums && albums.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {paginatedAlbums.map((album) => (
              <div 
                key={album.id} 
                className="group cursor-pointer" 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    const event = new CustomEvent('selectAlbum', { detail: album });
                    window.dispatchEvent(event);
                  }
                }}
              >
                <div className="relative group-hover:bg-zinc-800 p-3 rounded-lg transition-colors">
                  <img
                    src={album.coverUrl || "/placeholder.svg"}
                    alt={album.title}
                    className="w-full aspect-square rounded-lg object-cover mb-2"
                  />
                  <h3 className="font-bold text-sm text-white truncate">{album.title}</h3>
                  <p className="text-xs text-zinc-400 truncate">
                    Álbum • {album.artist || "Artista desconocido"}
                  </p>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button className="bg-green-500 text-white p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-zinc-900/40 rounded-lg">
            <p className="text-zinc-400">No hay álbumes disponibles para artistas de este género.</p>
          </div>
        )}
      </div>
    </div>
  );
}
