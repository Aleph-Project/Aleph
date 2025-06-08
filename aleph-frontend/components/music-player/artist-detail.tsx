"use client"

import * as React from "react";
import { useState } from "react";
import { Heart, Play, MoreHorizontal, Clock, ExternalLink, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Album, 
  Song, 
  Artist 
} from "@/services/songService";
import { AlbumDetail } from "@/components/music-player/album-detail";

// Propiedades esperadas para el componente ArtistDetail
interface ArtistDetailProps {
  artist: Artist;
  albums: Album[];
  songs: Song[];
  isLoading: boolean;
}

export function ArtistDetail({ artist, albums, songs, isLoading }: ArtistDetailProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  
  // Depuración mejorada - mostrar los datos recibidos en la consola con información detallada
  // console.log("============ ARTIST DETAIL COMPONENT - PROPS RECIBIDOS =============");
  // console.log("Artist:", artist);
  // console.log("Artist Image URL:", artist?.image_url);
  // console.log("Artist Name:", artist?.name);
  
  // console.log("Albums recibidos:", albums);
  // console.log("¿Hay álbumes?", albums?.length > 0);
  // if (albums && albums.length > 0) {
  //   console.log("Primer álbum:", albums[0]);
  //   console.log("Propiedades del álbum:", Object.keys(albums[0]));
  //   console.log("¿Los álbumes tienen coverUrl?", albums.every(a => Boolean(a.coverUrl)));
  // }
  
  // console.log("Songs recibidos:", songs);
  // console.log("¿Hay canciones?", songs?.length > 0);
  // if (songs && songs.length > 0) {
  //   console.log("Primera canción:", songs[0]);
  //   console.log("Propiedades de la canción:", Object.keys(songs[0]));
  //   console.log("¿Las canciones tienen cover_url?", songs.every(s => Boolean(s.cover_url)));
  // }
  
  // console.log("isLoading:", isLoading);
  // console.log("============================================================");
  
  // Componente Skeleton para cuando está cargando
  const ArtistHeaderSkeleton = () => (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-purple-900/40 to-zinc-900/0 p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center w-full relative z-10">
        <Skeleton className="w-32 h-32 md:w-48 md:h-48 rounded-full mb-4 md:mb-0 md:mr-6" />
        <div className="w-full">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );

  const AlbumSkeleton = () => (
    <div className="group">
      <div className="p-3 rounded-lg">
        <Skeleton className="w-full aspect-square rounded-lg mb-3" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );

  const SongSkeleton = () => (
    <div className="flex items-center p-3">
      <Skeleton className="h-8 w-8 rounded mr-3" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-10" />
    </div>
  );
  
  return (
    <div>
      <div className="space-y-6">
        {isLoading ? (
          <ArtistHeaderSkeleton />
        ) : (
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-purple-900/40 to-zinc-900/0 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center w-full relative z-10">
              <img 
                src={artist && artist.image_url ? artist.image_url : "/placeholder.svg"} 
                alt={artist?.name || "Artista"}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover mb-4 md:mb-0 md:mr-6 border-4 border-white/10 shadow-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/placeholder.svg";
                  console.log("Error al cargar la imagen del artista, usando placeholder", artist);
                }}
              />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  {artist?.name || "Artista"}
                </h1>
                <p className="text-zinc-300 mb-4">
                  {artist?.genres && artist.genres.length > 0 
                    ? `Género: ${artist.genres.join(', ')}` 
                    : 'Artista'}
                </p>
                <button 
                  className="bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-lg"
                >
                  Seguir
                </button>
              </div>
            </div>
            
            <div 
              className="absolute inset-0 bg-no-repeat bg-cover opacity-20 blur-xl" 
              style={{ 
                backgroundImage: `url(${artist?.image_url || "/placeholder.svg"})`,
                backgroundPosition: 'center 30%',
                filter: 'blur(50px)'
              }}
            ></div>
          </div>
        )}

        {/* Álbumes y canciones */}
        {!selectedAlbum ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Álbumes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {isLoading ? (
                [...Array(6)].map((_, index) => <AlbumSkeleton key={`album-skeleton-${index}`} />)
              ) : albums && albums.length > 0 ? (
                albums.map((album, index) => (
                  <div
                    key={`artist-album-${album.id}-${index}`}
                    className="group cursor-pointer"
                    onClick={() => setSelectedAlbum(album)}
                  >
                    <div className="relative group-hover:bg-zinc-800 p-3 rounded-lg transition-colors">
                      <img
                        src={album.image_url || "/placeholder.svg"}
                        alt={album.title}
                        className="w-full aspect-square rounded-lg object-cover mb-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/placeholder.svg";
                          console.log("Error al cargar la imagen del álbum, usando placeholder", album);
                        }}
                      />
                      <h3 className="font-bold text-sm text-white truncate">{album.title}</h3>
                      <p className="text-xs text-zinc-400 truncate">Álbum • {album.songsCount} canciones</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-6">
                  <p className="text-zinc-400">No hay álbumes disponibles</p>
                </div>
              )}
            </div>

            {/*Todas las canciones del artista*/}
            <h2 className="text-2xl font-bold mb-4">Canciones del artista</h2>
            <div className="bg-zinc-900/40 rounded-md overflow-hidden">
              {isLoading ? (
                [...Array(5)].map((_, index) => <SongSkeleton key={`song-skeleton-${index}`} />)
              ) : songs && songs.length > 0 ? (
                songs.map((song, index) => (
                  <div
                    key={`artist-song-${song._id}-${index}`}
                    className={`flex items-center p-3 hover:bg-zinc-800 ${index % 2 === 0 ? "bg-zinc-900/60" : "bg-zinc-900/30"}`}
                  >
                    <div className="mr-3 text-zinc-400 w-6 text-center">{index + 1}</div>
                    <img
                      src={song.image_url || "/placeholder.svg"}
                      alt={song.title}
                      className="h-12 w-12 rounded object-cover mr-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/placeholder.svg";
                        console.log("Error al cargar la imagen de la canción, usando placeholder", song);
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">{song.title}</h3>
                      <p className="text-xs text-zinc-400 truncate">
                        {song.album || "Álbum desconocido"}
                        {song.release_date && ` (${new Date(song.release_date).getFullYear()})`}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 text-zinc-400 hover:text-white mr-4 cursor-pointer" />
                      <div className="text-xs text-zinc-400">{song.duration}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-zinc-400">No hay canciones disponibles</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          (() => {
            // Procesar canciones para formato mm:ss y autor correcto
            const albumSongs = songs
              .filter(song => song.album === selectedAlbum.title)
              .map(song => ({
                ...song,
                duration: formatDuration(song.duration),
                artist: song.artist || artist.name
              }));
            return (
              <AlbumDetail
                album={selectedAlbum}
                songs={albumSongs}
                isLoading={isLoading}
                onBack={() => setSelectedAlbum(null)}
              />
            );
          })()
        )}
      </div>
    </div>
  );
}

// Función auxiliar para formatear duración
function formatDuration(duration: string | number): string {
  let seconds = typeof duration === 'string' ? parseInt(duration, 10) : duration;
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
