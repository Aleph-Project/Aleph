"use client"

import { useState, useEffect } from "react"
import { Artist } from "@/components/music-player/types"
import { getAllArtistsGraphQL, getArtistByIdGraphQL } from "@/services/songService"

export function useArtists() {
    const [artists, setArtists] = useState<Artist[]>([])
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

    const getArtistDetails = async (id: string) => {
        try {
            const artistDetails = await getArtistByIdGraphQL(id)
            return artistDetails
        } catch (err) {
            console.error("Error fetching artist details:", err)
            throw err
        }
    }

    return {
        artists,
        isLoading,
        error,
        getArtistDetails
    }
} 