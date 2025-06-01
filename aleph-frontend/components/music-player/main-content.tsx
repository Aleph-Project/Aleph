"use client"

import { Search, X, ArrowLeft, Play, Heart, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
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

    const { 
        songs: apiSongs, 
        isLoading: isLoadingSongs,
        error: songsError 
    } = useSongs()

    const { 
        genres: apiGenres, 
        isLoading: isLoadingGenres,
        error: genresError,
        getGenreDetails 
    } = useGenres()

    const isLoading = isLoadingArtists || isLoadingAlbums || isLoadingSongs || isLoadingGenres
    const loadingError = artistsError || albumsError || songsError || genresError

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

    const handleGenreSelect = async (genre: Genre) => {
        try {
            if (viewMode === "genre-detail" && selectedGenre?.id === genre.id) {
                return;
            }
            
            const genreDetails = await getGenreDetails(genre.slug)
            setSelectedGenre(genreDetails)
            setViewMode("genre-detail")
            setActiveTab("categorias")
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (error) {
            console.error("Error al cargar detalles del género:", error)
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
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                </div>
            </div>

            {/* Contenido principal */}
            <div className="p-4">
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
                    />
                )}

                {/* Vista de detalles del género */}
                {viewMode === "genre-detail" && selectedGenre && (
                    <GenreDetail 
                        genre={selectedGenre}
                        artists={apiArtists.filter(artist => artist.genres?.includes(selectedGenre.name))}
                        albums={apiAlbums.filter(album => album.genres?.includes(selectedGenre.name))}
                        songs={apiSongs.filter(song => song.genre === selectedGenre.name)}
                        isLoading={isLoading}
                        onSelectRelatedGenre={(genreName) => {
                            const relatedGenre = apiGenres.find(g => g.name === genreName)
                            if (relatedGenre) {
                                handleGenreSelect(relatedGenre)
                            }
                        }}
                    />
                )}

                {/* Vista de detalles del álbum */}
                {viewMode === "album-detail" && selectedAlbum && (
                    <AlbumDetail 
                        album={selectedAlbum}
                        songs={albumSongs}
                        isLoading={isLoading}
                        onBack={handleBackToNormal}
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

                        {activeTab === "categorias" && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Categorías</h2>
                                {isLoading ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {[...Array(8)].map((_, index) => (
                                            <ArtistSkeleton key={index} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {apiGenres.map((genre) => (
                                            <GenreCard
                                                key={genre.id}
                                                genre={genre}
                                                onClick={() => handleGenreSelect(genre)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "canciones" && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">Canciones</h2>
                                {isLoading ? (
                                    <div className="space-y-2">
                                        {[...Array(5)].map((_, index) => (
                                            <div key={index} className="flex items-center gap-4 p-2">
                                                <Skeleton className="w-12 h-12 rounded" />
                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                                    <Skeleton className="h-3 w-1/2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {apiSongs.map((song) => (
                                            <SongCard
                                                key={song.id}
                                                song={song}
                                                onClick={() => {
                                                    const artist = apiArtists.find(a => a.id === song.artist_id)
                                                    if (artist) {
                                                        handleArtistSelect(artist)
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
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
                    onSelectGenre={handleGenreSelect}
                />
            )}
        </div>
    )
} 