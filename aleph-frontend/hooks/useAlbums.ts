"use client"

import { useState, useEffect } from "react"
import { Album } from "@/components/music-player/types"
import { getAllAlbumsGraphQL } from "@/services/songService"

export function useAlbums() {
    const [albums, setAlbums] = useState<Album[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchAlbums() {
            try {
                const albumsData = await getAllAlbumsGraphQL()
                setAlbums(albumsData)
                setError(null)
            } catch (err) {
                setError("Error al cargar los álbumes")
                console.error("Error fetching albums:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAlbums()
    }, [])

    return {
        albums,
        isLoading,
        error
    }
} 