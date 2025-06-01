"use client"

import { useState, useEffect } from "react"
import { Album, Song } from "@/components/music-player/types"
import { getAllAlbumsGraphQL, getAlbumDetailsGraphQL } from "@/services/songService"

export function useAlbums() {
    const [albums, setAlbums] = useState<Album[]>([])
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
    const [albumSongs, setAlbumSongs] = useState<Song[]>([])
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

    const selectAlbum = async (album: Album) => {
        try {
            setIsLoading(true)
            const details = await getAlbumDetailsGraphQL(album.id)
            setSelectedAlbum(details.album)
            setAlbumSongs(details.songs)
            setError(null)
        } catch (err) {
            setError("Error al cargar los detalles del álbum")
            console.error("Error fetching album details:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const clearSelectedAlbum = () => {
        setSelectedAlbum(null)
        setAlbumSongs([])
    }

    return {
        albums,
        selectedAlbum,
        albumSongs,
        isLoading,
        error,
        selectAlbum,
        clearSelectedAlbum
    }
} 