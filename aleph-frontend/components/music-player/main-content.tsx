"use client"

import { Search, X, ArrowLeft, Heart } from "lucide-react"
import Link from "next/link"
import { artists as staticArtists } from "@/data/artists"
import { albums } from "@/data/albums"
import { categories } from "@/data/categories"
// Importamos el servicio con las nuevas interfaces y funciones
import { 
    getAllSongs, 
    getSongById, 
    getAllArtists,
    getAllAlbums,
    getAllGenres,
    getAlbumsFromSongs,
    getSongsByArtist,
    getAlbumsByArtist,
    getArtistDetails,
    Song as SongType, 
    Album as AlbumType,
    Artist as ArtistType,
    Category as CategoryType,
    Genre as GenreType,
    ArtistDetails
} from "@/services/songService"
import { getGenreDetails, GenreDetails } from "@/services/genreService"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ArtistDetail } from "./artist-detail"
import { GenreDetail } from "./genre-detail"
import { GenresModal } from "./genres-modal"
import { usePlayerState } from './hooks/usePlayerState'
import { useArtistData } from './hooks/useArtistData'
import { useGenreData } from './hooks/useGenreData'
import { useSearch } from './hooks/useSearch'
import { SearchBar } from './components/navigation/SearchBar'
import { NavigationTabs } from './components/navigation/NavigationTabs'
import { ArtistGrid } from './components/listings/ArtistGrid'
import { AlbumGrid } from './components/listings/AlbumGrid'
import { SongList } from './components/listings/SongList'
import { SongDetail } from './components/details/SongDetail'
import { ViewMode, Tab } from './types'

// Función para agrupar géneros por primera letra (simulando categorías)
function groupGenresByFirstLetter(genres: GenreType[]): CategoryType[] {
    // Crear un mapa para agrupar géneros por la primera letra
    const genreMap = new Map<string, GenreType[]>();
    
    // Colores para las categorías
    const colors = [
        'from-pink-500 to-purple-500',
        'from-yellow-500 to-orange-500',
        'from-red-500 to-red-800',
        'from-blue-400 to-indigo-600',
        'from-purple-400 to-purple-800',
        'from-green-400 to-emerald-600',
        'from-amber-500 to-yellow-800',
        'from-gray-400 to-gray-700',
        'from-teal-400 to-cyan-600'
    ];
    
    // Agrupar los géneros por su primera letra
    genres.forEach(genre => {
        if (!genre.name) return;
        
        const firstLetter = genre.name.charAt(0).toUpperCase();
        if (!genreMap.has(firstLetter)) {
            genreMap.set(firstLetter, []);
        }
        genreMap.get(firstLetter)?.push(genre);
    });
    
    // Convertir el mapa en un array de categorías
    let colorIndex = 0;
    const categories: CategoryType[] = [];
    
    genreMap.forEach((genresInCategory, letter) => {
        categories.push({
            id: letter,
            name: letter,
            image_url: `/placeholder.svg?text=${letter}`,
            color: colors[colorIndex % colors.length],
            genres: genresInCategory
        });
        colorIndex++;
    });
    
    // Ordenar las categorías alfabéticamente
    return categories.sort((a, b) => a.name.localeCompare(b.name));
}

export function MainContent() {
    // Hooks
    const {
        currentlyPlaying,
        isPlaying,
        volume,
        progress,
        playSong,
        pauseSong,
        resumeSong,
        stopSong,
        updateProgress,
        updateVolume
    } = usePlayerState()

    const {
        artists,
        selectedArtist,
        artistAlbums,
        artistSongs,
        isLoading: isLoadingArtists,
        error: artistError,
        loadArtists,
        selectArtist,
        clearArtistSelection
    } = useArtistData()

    const {
        genres,
        selectedGenre,
        genreArtists,
        genreAlbums,
        genreSongs,
        isLoading: isLoadingGenres,
        error: genreError,
        loadGenres,
        selectGenre,
        clearGenreSelection
    } = useGenreData()

    const {
        searchTerm,
        isSearching,
        searchResults,
        handleSearch,
        clearSearch
    } = useSearch(artists, artistAlbums, [], [])

    // Estado local
    const [activeTab, setActiveTab] = useState<Tab>('artists')
    const [viewMode, setViewMode] = useState<ViewMode>('normal')
    const [allAlbums, setAllAlbums] = useState<Album[]>([])
    const [allSongs, setAllSongs] = useState<Song[]>([])
    const [isLoadingAlbums, setIsLoadingAlbums] = useState(false)
    const [isLoadingSongs, setIsLoadingSongs] = useState(false)

    // Efectos
    useEffect(() => {
        loadArtists()
        loadGenres()
    }, [loadArtists, loadGenres])

    useEffect(() => {
        const loadAllAlbums = async () => {
            setIsLoadingAlbums(true)
            try {
                const response = await fetch('http://localhost:3000/api/v1/music/albums')
                if (!response.ok) throw new Error('Error al cargar álbumes')
                const data = await response.json()
                const formattedAlbums = Array.isArray(data) ? data.map(album => ({
                    ...album,
                    cover_url: album.cover_url?.startsWith('http') 
                        ? album.cover_url 
                        : `http://localhost:3000${album.cover_url}`
                })) : []
                setAllAlbums(formattedAlbums)
            } catch (error) {
                console.error('Error loading albums:', error)
            } finally {
                setIsLoadingAlbums(false)
            }
        }

        const loadAllSongs = async () => {
            setIsLoadingSongs(true)
            try {
                const response = await fetch('http://localhost:3000/api/v1/music/songs')
                if (!response.ok) throw new Error('Error al cargar canciones')
                const data = await response.json()
                const formattedSongs = Array.isArray(data) ? data.map(song => ({
                    ...song,
                    cover_url: song.cover_url?.startsWith('http') 
                        ? song.cover_url 
                        : `http://localhost:3000${song.cover_url}`
                })) : []
                setAllSongs(formattedSongs)
            } catch (error) {
                console.error('Error loading songs:', error)
            } finally {
                setIsLoadingSongs(false)
            }
        }

        loadAllAlbums()
        loadAllSongs()
    }, [])

    // Manejadores
    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab)
        setViewMode('normal')
        clearArtistSelection()
        clearGenreSelection()
        clearSearch()
    }

    const handleArtistClick = (artist: Artist) => {
        selectArtist(artist)
        setViewMode('artist-detail')
    }

    const handleGenreClick = (genre: Category) => {
        selectGenre(genre)
        setViewMode('genre-detail')
    }

    const handleAlbumClick = (album: Album) => {
        // Aquí podrías implementar la lógica para mostrar los detalles del álbum
        console.log('Album clicked:', album)
    }

    const handleBackClick = () => {
        setViewMode('normal')
        clearArtistSelection()
        clearGenreSelection()
    }

    const handleSongClick = (song: Song) => {
        if (currentlyPlaying?.id === song.id) {
            if (isPlaying) {
                pauseSong()
            } else {
                resumeSong()
            }
        } else {
            playSong(song)
        }
    }

    // Renderizado condicional
    const renderContent = () => {
        if (artistError || genreError) {
            return (
                <div className="text-red-500 p-4 rounded-lg bg-red-100">
                    <p className="font-medium">Error al cargar los datos:</p>
                    {artistError && <p>{artistError}</p>}
                    {genreError && <p>{genreError}</p>}
                </div>
            )
        }

        if (isSearching) {
            return (
                <div className="space-y-8">
                    <ArtistGrid
                        artists={searchResults.artists}
                        isLoading={false}
                        onArtistClick={handleArtistClick}
                    />
                    <AlbumGrid
                        albums={searchResults.albums}
                        isLoading={false}
                        onAlbumClick={handleAlbumClick}
                    />
                    <SongList
                        songs={searchResults.songs}
                        isLoading={false}
                        onSongClick={handleSongClick}
                        currentlyPlaying={currentlyPlaying}
                        isPlaying={isPlaying}
                    />
                </div>
            )
        }

        switch (viewMode) {
            case 'artist-detail':
                return selectedArtist && (
                    <ArtistDetail
                        artist={selectedArtist}
                        albums={artistAlbums}
                        songs={artistSongs}
                        isLoading={isLoadingArtists}
                        onAlbumClick={handleAlbumClick}
                        onSongClick={handleSongClick}
                        currentlyPlaying={currentlyPlaying}
                        isPlaying={isPlaying}
                    />
                )
            case 'genre-detail':
                return selectedGenre && (
                    <GenreDetail
                        genre={selectedGenre}
                        artists={genreArtists}
                        albums={genreAlbums}
                        songs={genreSongs}
                        isLoading={isLoadingGenres}
                        onArtistClick={handleArtistClick}
                        onAlbumClick={handleAlbumClick}
                        onSongClick={handleSongClick}
                        currentlyPlaying={currentlyPlaying}
                        isPlaying={isPlaying}
                    />
                )
            default:
                return (
                    <div className="space-y-8">
                        {activeTab === 'artists' && (
                            <ArtistGrid
                                artists={artists}
                                isLoading={isLoadingArtists}
                                onArtistClick={handleArtistClick}
                            />
                        )}
                        {activeTab === 'albums' && (
                            <AlbumGrid
                                albums={allAlbums}
                                isLoading={isLoadingAlbums}
                                onAlbumClick={handleAlbumClick}
                            />
                        )}
                        {activeTab === 'songs' && (
                            <SongList
                                songs={allSongs}
                                isLoading={isLoadingSongs}
                                onSongClick={handleSongClick}
                                currentlyPlaying={currentlyPlaying}
                                isPlaying={isPlaying}
                            />
                        )}
                    </div>
                )
        }
    }

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Barra de búsqueda */}
                <SearchBar
                    searchTerm={searchTerm}
                    onSearch={handleSearch}
                    onClear={clearSearch}
                />

                {/* Navegación */}
                <NavigationTabs
                    activeTab={activeTab}
                    viewMode={viewMode}
                    onTabChange={handleTabChange}
                    onBackClick={handleBackClick}
                />

                {/* Contenido principal */}
                {renderContent()}

                {/* Reproductor */}
                {currentlyPlaying && (
                    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4">
                        <SongDetail
                            song={currentlyPlaying}
                            isPlaying={isPlaying}
                            onPlayClick={resumeSong}
                            onPauseClick={pauseSong}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}