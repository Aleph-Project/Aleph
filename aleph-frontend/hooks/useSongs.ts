"use client"

import { useState, useEffect } from "react"
import { Song } from "@/components/music-player/types"
import { getAllSongsGraphQL } from "@/services/songService"

export function useSongs() {
    const [songs, setSongs] = useState<Song[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchSongs() {
            try {
                const songsData = await getAllSongsGraphQL()
                setSongs(songsData)
                setError(null)
            } catch (err) {
                setError("Error al cargar las canciones")
                console.error("Error fetching songs:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSongs()
    }, [])

    return {
        songs,
        isLoading,
        error
    }
} 