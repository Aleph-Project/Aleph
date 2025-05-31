import { useState, useCallback } from 'react'
import { Artist, Album, Song } from '../types'

export function useArtistData() {
    const [artists, setArtists] = useState<Artist[]>([])
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
    const [artistAlbums, setArtistAlbums] = useState<Album[]>([])
    const [artistSongs, setArtistSongs] = useState<Song[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadArtists = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('http://localhost:3000/api/v1/music/artists')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            if (Array.isArray(data)) {
                // Asegurarnos de que las URLs de las imágenes sean absolutas
                const formattedArtists = data.map(artist => ({
                    ...artist,
                    imageUrl: artist.image_url?.startsWith('http') 
                        ? artist.image_url 
                        : `http://localhost:3000${artist.image_url}`
                }))
                setArtists(formattedArtists)
            } else {
                console.error('La respuesta no es un array:', data)
                setArtists([])
            }
        } catch (error) {
            console.error('Error loading artists:', error)
            setError(error instanceof Error ? error.message : 'Error al cargar artistas')
            setArtists([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    const selectArtist = useCallback(async (artist: Artist) => {
        setSelectedArtist(artist)
        setIsLoading(true)
        setError(null)
        try {
            // Cargar detalles del artista
            const detailsResponse = await fetch(`http://localhost:3000/api/v1/music/artists/${artist.id}/details`)
            if (!detailsResponse.ok) {
                throw new Error(`HTTP error! status: ${detailsResponse.status}`)
            }
            const artistDetails = await detailsResponse.json()
            
            // Actualizar el artista seleccionado con los detalles
            setSelectedArtist({
                ...artist,
                ...artistDetails,
                image_url: artistDetails.image_url?.startsWith('http') 
                    ? artistDetails.image_url 
                    : `http://localhost:3000${artistDetails.image_url}`
            })

            // Procesar los álbumes de la respuesta
            const formattedAlbums = artistDetails.albums.map((album: any) => ({
                ...album,
                coverUrl: album.image_url?.startsWith('http') 
                    ? album.image_url 
                    : `http://localhost:3000${album.image_url}`,
                artist_id: artist.id,
                artist_name: artist.name
            }))
            setArtistAlbums(formattedAlbums)

            // Procesar las canciones de la respuesta
            const formattedSongs = artistDetails.songs.map((song: any) => {
                const album = artistDetails.albums.find((a: any) => a.id === song.album_id)
                const cover = album?.image_url?.startsWith('http')
                    ? album.image_url
                    : album?.image_url
                        ? `http://localhost:3000${album.image_url}`
                        : undefined
                return {
                    ...song,
                    coverUrl: cover,
                    cover_url: cover,
                    album: album?.title || 'Desconocido',
                    artist_id: artist.id,
                    artist_name: artist.name
                }
            })
            setArtistSongs(formattedSongs)

        } catch (error) {
            console.error('Error loading artist details:', error)
            setError(error instanceof Error ? error.message : 'Error al cargar detalles del artista')
            setArtistAlbums([])
            setArtistSongs([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    const clearArtistSelection = useCallback(() => {
        setSelectedArtist(null)
        setArtistAlbums([])
        setArtistSongs([])
        setError(null)
    }, [])

    return {
        artists,
        selectedArtist,
        artistAlbums,
        artistSongs,
        isLoading,
        error,
        loadArtists,
        selectArtist,
        clearArtistSelection
    }
}