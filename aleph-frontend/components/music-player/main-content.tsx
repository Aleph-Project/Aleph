"use client"

import { Search, X, ArrowLeft, Play, Heart, Clock, Users, Album as AlbumIcon, ChevronLeft, ChevronRight, Music } from "lucide-react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArtistDetail } from "./artist-detail"
import { GenreDetail } from "./genre-detail"
import { AlbumDetail } from "./album-detail"
import { GenresModal } from "./genres-modal"
import { ArtistCard } from "./ui/artist-card"
import { AlbumCard } from "./ui/album-card"
import { GenreCard } from "./ui/genre-card"
import { SongCard } from "./ui/song-card"
import { useArtists } from "@/hooks/useArtists"
import { useAlbums } from "@/hooks/useAlbums"
import { useSongs } from "@/hooks/useSongs"
import { useGenres } from "@/hooks/useGenres"
import { useWebSocket } from "@/hooks/useWebSocket"
import { getArtistsByGenre } from "@/services/artistByGenreService"
import { getArtistsBasicByGenre } from "@/services/optimizedGenreService"
import type { Song, Album, Artist, Category, Genre } from "./types"

export function MainContent() {
    const [activeTab, setActiveTab] = useState("artistas")
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<"normal" | "artist-detail" | "genre-detail" | "album-detail">("normal")
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [isGenresModalOpen, setIsGenresModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

    // Inicializar WebSocket en el componente principal
    const webSocket = useWebSocket()

    // Hooks personalizados
    const { 
        artists: apiArtists, 
        isLoading: isLoadingArtists,
        error: artistsError,
        selectArtist,
        selectedArtist: selectedArtistFromHook,
        artistAlbums,
        artistSongs
    } = useArtists()

    const { 
        albums: apiAlbums, 
        isLoading: isLoadingAlbums,
        error: albumsError,
        selectAlbum,
        selectedAlbum,
        albumSongs
    } = useAlbums()

    // Comentado para evitar cargar todas las canciones (muy lento)
    // const { 
    //     songs: apiSongs, 
    //     isLoading: isLoadingSongs,
    //     error: songsError 
    // } = useSongs()

    // Hook de géneros simplificado
    const { 
        genres: apiGenres, 
        isLoading: isLoadingGenres,
        error: genresError,
        getGenreDetails 
    } = useGenres()

    const isLoading = isLoadingArtists || isLoadingAlbums || isLoadingGenres
    const loadingError = artistsError || albumsError || genresError

    const tabs = [
        { key: "artistas", label: "Artistas" },
        { key: "albums", label: "Albums" },
        { key: "categorias", label: "Categorías" },
        { key: "canciones", label: "Canciones" },
        { key: "favoritos", label: "Favoritos" },
        { key: "comentarios", label: "Mis comentarios" },
    ]

    const handleArtistSelect = async (artist: Artist) => {
        try {
            await selectArtist(artist)
            setViewMode("artist-detail")
            setActiveTab("artistas")
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (error) {
            console.error("Error al cargar detalles del artista:", error)
            setViewMode("artist-detail")
            setActiveTab("artistas")
        }
    }

    // Función optimizada para ir a detalles del género
    const handleGenreSelect = async (genre: Genre) => {
        try {
            console.log("Seleccionando género:", genre.name)
            
            // Usar la consulta optimizada que no causa timeouts
            const artistsBasic = await getArtistsBasicByGenre(genre.name)
            console.log("Artistas básicos obtenidos:", artistsBasic.length)
            
            // Convertir ArtistBasic a Artist para compatibilidad con GenreDetail
            const artistsConverted = artistsBasic.map(artistBasic => ({
                id: artistBasic.id,
                name: artistBasic.name,
                image_url: artistBasic.image_url,
                genres: artistBasic.genres,
                popularity: artistBasic.popularity,
                spotify_id: "", // Campo requerido por el tipo Artist
                created_at: artistBasic.created_at,
                updated_at: artistBasic.updated_at,
                // Campos vacíos para álbumes y canciones por ahora
                albums: [],
                songs: []
            }))
            
            // Establecer el género seleccionado con los artistas convertidos
            setSelectedGenre({ ...genre, artists: artistsConverted })
            
            // Cambiar a vista de detalles del género
            setViewMode("genre-detail")
            setActiveTab("categorias")
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (error) {
            console.error("Error al cargar detalles del género:", error)
            // En caso de error, aún así ir a la vista de detalles
            setSelectedGenre(genre)
            setViewMode("genre-detail")
            setActiveTab("categorias")
        }
    }

    const handleAlbumSelect = async (album: Album) => {
        try {
            await selectAlbum(album)
            setViewMode("album-detail")
            setActiveTab("albums")
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (error) {
            console.error("Error al cargar detalles del álbum:", error)
            setViewMode("album-detail")
            setActiveTab("albums")
        }
    }

    const handleBackToNormal = () => {
        setViewMode("normal")
        setSelectedArtist(null)
        setSelectedGenre(null)
    }

    // Componentes Skeleton
    const ArtistSkeleton = () => (
        <div className="group">
            <div className="p-3 rounded-lg">
                <Skeleton className="w-full aspect-square rounded-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    )

    return (
        <div className="flex-1 overflow-y-auto">
            {/* Barra de búsqueda */}
            <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm p-4">
                <div className="flex items-center gap-2">
                    {viewMode !== "normal" && (
                        <button
                            onClick={handleBackToNormal}
                            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Buscar artistas, álbumes o canciones..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-800/50 text-white pl-10 pr-10 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-zinc-700"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-700 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {/* Indicador de estado WebSocket */}
                    {webSocket && (
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${webSocket.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-xs text-zinc-400">
                                {webSocket.isConnected ? 'Streaming' : 'Desconectado'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido principal */}
            <div className="p-4 pb-24">
                {/* Mensaje de error si falla la carga del API */}
                {loadingError && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-900/30 rounded-lg text-red-300 text-sm">
                        {loadingError}
                    </div>
                )}

                {/* Vista de detalles del artista */}
                {viewMode === "artist-detail" && selectedArtistFromHook && (
                    <ArtistDetail 
                        artist={selectedArtistFromHook}
                        albums={artistAlbums}
                        songs={artistSongs}
                        isLoading={isLoading}
                        webSocket={webSocket}
                    />
                )}

                {/* Vista de detalles del género */}
                {viewMode === "genre-detail" && selectedGenre && (
                    (() => {
                        // Los artistas devueltos por la consulta GraphQL tienen álbumes y canciones
                        const artistsWithDetails = (selectedGenre.artists || []) as Array<
                            Artist & { albums?: any[]; songs?: any[] }
                        >;
                        
                        // Normalizar álbumes
                        const allAlbums = artistsWithDetails.flatMap(artist =>
                            (artist.albums || []).map(album => ({
                                id: album.id || album._id || '',
                                title: album.title || album.name || '',
                                artist: album.artist || artist.name || '',
                                coverUrl: album.coverUrl || album.cover_url || album.image_url || '',
                                image_url: album.coverUrl || album.cover_url || album.image_url || '',
                                releaseDate: album.releaseDate || album.release_date || '',
                                songsCount: Array.isArray(album.songs) ? album.songs.length : (album.songsCount || album.songs_count || 0),
                            }))
                        );
                        
                        // Normalizar canciones
                        const allSongs = artistsWithDetails.flatMap(artist =>
                            (artist.albums || []).flatMap(album =>
                                (album.songs || []).map((song: any) => ({
                                    _id: song._id || song.id || '',
                                    title: song.title || '',
                                    artist: song.artist || artist.name || '',
                                    authors: song.authors || [],
                                    album: song.album || album.title || '',
                                    release_date: song.release_date || song.releaseDate || '',
                                    duration: song.duration || '',
                                    genre: song.genre || '',
                                    likes: song.likes || 0,
                                    plays: song.plays || 0,
                                    cover_url: song.cover_url || song.coverUrl || album.coverUrl || '',
                                    audio_url: song.audio_url || song.audioUrl || '',
                                    spotify_id: song.spotify_id || song.spotifyId,
                                    album_id: song.album_id || song.albumId,
                                    created_at: song.created_at,
                                    updated_at: song.updated_at,
                                }))
                            )
                        );
                        
                        return (
                            <GenreDetail
                                genre={selectedGenre}
                                artists={artistsWithDetails}
                                albums={allAlbums}
                                songs={allSongs}
                                isLoading={isLoading}
                                onSelectRelatedGenre={(genreName) => {
                                    const relatedGenre = apiGenres.find((g: Genre) => g.name === genreName)
                                    if (relatedGenre) {
                                        handleGenreSelect(relatedGenre)
                                    }
                                }}
                                onArtistSelect={handleArtistSelect}
                            />
                        );
                    })()
                )}

                {/* Vista de detalles del álbum */}
                {viewMode === "album-detail" && selectedAlbum && (
                    <AlbumDetail 
                        album={selectedAlbum}
                        songs={albumSongs}
                        isLoading={isLoading}
                        onBack={handleBackToNormal}
                        webSocket={webSocket}
                    />
                )}

                {/* Vista normal */}
                {viewMode === "normal" && (
                    <div className="space-y-6">
                        {/* Pestañas */}
                        <div className="flex gap-4 border-b border-zinc-800">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`pb-2 px-1 ${
                                        activeTab === tab.key
                                            ? "border-b-2 border-white text-white"
                                            : "text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Contenido de las pestañas */}
                        {activeTab === "artistas" && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Artistas</h2>
                                {isLoading ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                        {[...Array(7)].map((_, index) => (
                                            <ArtistSkeleton key={index} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                        {apiArtists.map((artist) => (
                                            <ArtistCard
                                                key={artist.id}
                                                artist={artist}
                                                onClick={() => handleArtistSelect(artist)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "albums" && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Álbumes</h2>
                                {isLoading ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                        {[...Array(7)].map((_, index) => (
                                            <ArtistSkeleton key={index} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                                        {apiAlbums.map((album) => (
                                            <AlbumCard
                                                key={album.id}
                                                album={album}
                                                onClick={() => handleAlbumSelect(album)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pestaña de Categorías Mejorada */}
                        {activeTab === "categorias" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">Géneros Musicales</h2>
                                <p className="text-zinc-400 text-sm">
                                    Selecciona un género para explorar todos sus artistas, álbumes y canciones
                                </p>

                                {isLoading ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {[...Array(10)].map((_, index) => (
                                            <ArtistSkeleton key={index} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {apiGenres.map((genre) => (
                                            <div
                                                key={genre.id}
                                                className="group cursor-pointer p-4 rounded-lg border border-zinc-700 hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-200"
                                                onClick={() => handleGenreSelect(genre)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <Music className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                            {genre.name}
                                                        </h3>
                                                        <div className="flex items-center space-x-1 text-sm text-zinc-400">
                                                            <Users className="h-3 w-3" />
                                                            <span>{genre.count || 0} artistas</span>
                                                        </div>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowLeft className="h-4 w-4 text-blue-400 rotate-180" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "canciones" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold mb-4">Canciones</h2>
                                <div className="text-center py-12 space-y-4">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-zinc-800 flex items-center justify-center">
                                        <Music className="w-10 h-10 text-zinc-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium text-white">
                                            Explora canciones por artista
                                        </h3>
                                        <p className="text-zinc-400 max-w-md mx-auto">
                                            Para escuchar canciones, navega por géneros o artistas. 
                                            Esto te permitirá descubrir música de manera más organizada.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            onClick={() => setActiveTab("categorias")}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                        >
                                            Explorar géneros
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("artistas")}
                                            className="px-6 py-2 border border-zinc-600 hover:border-zinc-500 text-white rounded-lg transition-colors"
                                        >
                                            Ver artistas
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de géneros */}
            {selectedCategory && (
                <GenresModal
                    isOpen={isGenresModalOpen}
                    onClose={() => setIsGenresModalOpen(false)}
                    category={selectedCategory}
                    onGenreSelect={handleGenreSelect}
                />
            )}
        </div>
    )
}