"use client"

import { useState, useEffect } from "react"
import { Genre } from "@/components/music-player/types"
import { getAllGenresGraphQL } from "@/services/songService"
import { getGenreDetails } from "@/services/genreService"

export function useGenres() {
    const [genres, setGenres] = useState<Genre[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchGenres() {
            try {
                const genresData = await getAllGenresGraphQL()
                setGenres(genresData)
                setError(null)
            } catch (err) {
                setError("Error al cargar los géneros")
                console.error("Error fetching genres:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchGenres()
    }, [])

    const getGenreDetails = async (slug: string) => {
        try {
            const genreDetails = await getGenreDetails(slug)
            return genreDetails
        } catch (err) {
            console.error("Error fetching genre details:", err)
            throw err
        }
    }

    return {
        genres,
        isLoading,
        error,
        getGenreDetails
    }
} 