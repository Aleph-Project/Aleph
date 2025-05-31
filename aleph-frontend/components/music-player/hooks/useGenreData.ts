import { useState, useCallback } from 'react'
import { Artist, Album, Song, Category } from '../types'

export function useGenreData() {
    const [genres, setGenres] = useState<Category[]>([])
    const [selectedGenre, setSelectedGenre] = useState<Category | null>(null)
    const [genreArtists, setGenreArtists] = useState<Artist[]>([])
    const [genreAlbums, setGenreAlbums] = useState<Album[]>([])
    const [genreSongs, setGenreSongs] = useState<Song[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadGenres = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('http://localhost:3000/api/v1/music/genres')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            if (Array.isArray(data)) {
                // Asegurarnos de que las URLs de las imágenes sean absolutas
                const formattedGenres = data.map(genre => ({
                    ...genre,
                    image_url: genre.image_url?.startsWith('http') 
                        ? genre.image_url 
                        : `http://localhost:3000${genre.image_url}`
                }))
                setGenres(formattedGenres)
            } else {
                console.error('La respuesta no es un array:', data)
                setGenres([])
            }
        } catch (error) {
            console.error('Error loading genres:', error)
            setError(error instanceof Error ? error.message : 'Error al cargar géneros')
            setGenres([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    const selectGenre = useCallback(async (genre: Category) => {
        setSelectedGenre(genre)
        setIsLoading(true)
        setError(null)
        try {
            // Cargar artistas del género
            const artistsResponse = await fetch(`http://localhost:3000/api/v1/music/genres/${genre.id}/artists`)
            if (!artistsResponse.ok) {
                throw new Error(`HTTP error! status: ${artistsResponse.status}`)
            }
            const artistsData = await artistsResponse.json()
            const formattedArtists = Array.isArray(artistsData) ? artistsData.map(artist => ({
                ...artist,
                image_url: artist.image_url?.startsWith('http') 
                    ? artist.image_url 
                    : `http://localhost:3000${artist.image_url}`
            })) : []
            setGenreArtists(formattedArtists)

            // Cargar álbumes del género
            const albumsResponse = await fetch(`http://localhost:3000/api/v1/music/genres/${genre.id}/albums`)
            if (!albumsResponse.ok) {
                throw new Error(`HTTP error! status: ${albumsResponse.status}`)
            }
            const albumsData = await albumsResponse.json()
            const formattedAlbums = Array.isArray(albumsData) ? albumsData.map(album => ({
                ...album,
                cover_url: album.cover_url?.startsWith('http') 
                    ? album.cover_url 
                    : `http://localhost:3000${album.cover_url}`
            })) : []
            setGenreAlbums(formattedAlbums)

            // Cargar canciones del género
            const songsResponse = await fetch(`http://localhost:3000/api/v1/music/genres/${genre.id}/songs`)
            if (!songsResponse.ok) {
                throw new Error(`HTTP error! status: ${songsResponse.status}`)
            }
            const songsData = await songsResponse.json()
            const formattedSongs = Array.isArray(songsData) ? songsData.map(song => ({
                ...song,
                cover_url: song.cover_url?.startsWith('http') 
                    ? song.cover_url 
                    : `http://localhost:3000${song.cover_url}`
            })) : []
            setGenreSongs(formattedSongs)
        } catch (error) {
            console.error('Error loading genre details:', error)
            setError(error instanceof Error ? error.message : 'Error al cargar detalles del género')
            setGenreArtists([])
            setGenreAlbums([])
            setGenreSongs([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    const clearGenreSelection = useCallback(() => {
        setSelectedGenre(null)
        setGenreArtists([])
        setGenreAlbums([])
        setGenreSongs([])
        setError(null)
    }, [])

    return {
        genres,
        selectedGenre,
        genreArtists,
        genreAlbums,
        genreSongs,
        isLoading,
        error,
        loadGenres,
        selectGenre,
        clearGenreSelection
    }
}

// Función auxiliar para agrupar géneros por primera letra
function groupGenresByFirstLetter(genres: any[]): Category[] {
    const genreMap = new Map<string, any[]>()
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
    ]
    
    genres.forEach(genre => {
        if (!genre.name) return
        const firstLetter = genre.name.charAt(0).toUpperCase()
        if (!genreMap.has(firstLetter)) {
            genreMap.set(firstLetter, [])
        }
        genreMap.get(firstLetter)?.push(genre)
    })
    
    let colorIndex = 0
    const categories: Category[] = []
    
    genreMap.forEach((genresInCategory, letter) => {
        categories.push({
            id: letter,
            name: letter,
            image_url: `/placeholder.svg?text=${letter}`,
            color: colors[colorIndex % colors.length],
            genres: genresInCategory
        })
        colorIndex++
    })
    
    return categories.sort((a, b) => a.name.localeCompare(b.name))
} 