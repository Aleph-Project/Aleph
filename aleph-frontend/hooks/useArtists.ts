"use client"

import { useState, useEffect } from "react"
import { Artist, Album, Song } from "@/services/songService"
import { getAllArtistsGraphQL, getArtistDetailsGraphQL } from "@/services/songService"

export function useArtists() {
    const [artists, setArtists] = useState<Artist[]>([])
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
    const [artistAlbums, setArtistAlbums] = useState<Album[]>([])
    const [artistSongs, setArtistSongs] = useState<Song[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchArtists() {
            try {
                const artistsData = await getAllArtistsGraphQL()
                setArtists(artistsData)
                setError(null)
            } catch (err) {
                setError("Error al cargar los artistas")
                console.error("Error fetching artists:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchArtists()
    }, [])

    const selectArtist = async (artist: Artist) => {
        try {
            setIsLoading(true)
            const details = await getArtistDetailsGraphQL(artist.id)
            setSelectedArtist(details.artist)
            setArtistAlbums(details.albums)
            setArtistSongs(details.songs)
            setError(null)
        } catch (err) {
            setError("Error al cargar los detalles del artista")
            console.error("Error fetching artist details:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const clearSelectedArtist = () => {
        setSelectedArtist(null)
        setArtistAlbums([])
        setArtistSongs([])
    }

    return {
        artists,
        selectedArtist,
        artistAlbums,
        artistSongs,
        isLoading,
        error,
        selectArtist,
        clearSelectedArtist
    }
} 