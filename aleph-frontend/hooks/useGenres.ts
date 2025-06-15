"use client"

import { useState, useEffect } from "react"
import { Genre } from "@/components/music-player/types"
import { getAllGenresGraphQL } from "@/services/songService"
import { getGenreDetails } from "@/services/genreService"
import { 
    getAllGenresOptimized, 
    getArtistsByGenreOptimized, 
    ArtistBasic 
} from "@/services/optimizedGenreService"

export function useGenres() {
    const [genres, setGenres] = useState<Genre[]>([])
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null)
    const [artistsByGenre, setArtistsByGenre] = useState<ArtistBasic[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingArtists, setIsLoadingArtists] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const ARTISTS_PER_PAGE = 20;

    useEffect(() => {
        async function fetchGenres() {
            try {
                setIsLoading(true)
                setError(null)
                // Usar la nueva consulta optimizada
                const genresData = await getAllGenresOptimized()
                setGenres(genresData)
            } catch (err) {
                setError("Error al cargar los géneros")
                console.error("Error fetching genres:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchGenres()
    }, [])

    const selectGenre = async (genre: Genre, page: number = 1) => {
        try {
            setIsLoadingArtists(true)
            setError(null)
            setSelectedGenre(genre)
            setCurrentPage(page)

            // Usar la nueva consulta optimizada para obtener artistas
            const result = await getArtistsByGenreOptimized(
                genre.name, 
                page, 
                ARTISTS_PER_PAGE
            )
            
            setArtistsByGenre(result.artists)
            setTotalCount(result.totalCount)
            setHasNextPage(result.hasNextPage)
            setCurrentPage(result.currentPage)
        } catch (err) {
            setError(`Error al cargar artistas del género ${genre.name}`)
            console.error("Error fetching artists by genre:", err)
        } finally {
            setIsLoadingArtists(false)
        }
    }

    const loadNextPage = () => {
        if (selectedGenre && hasNextPage) {
            selectGenre(selectedGenre, currentPage + 1)
        }
    }

    const loadPreviousPage = () => {
        if (selectedGenre && currentPage > 1) {
            selectGenre(selectedGenre, currentPage - 1)
        }
    }

    const clearSelection = () => {
        setSelectedGenre(null)
        setArtistsByGenre([])
        setCurrentPage(1)
        setTotalCount(0)
        setHasNextPage(false)
    }

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
        // Estados de géneros
        genres,
        isLoading,
        error,
        
        // Estados de artistas por género
        selectedGenre,
        artistsByGenre,
        isLoadingArtists,
        currentPage,
        totalCount,
        hasNextPage,
        
        // Funciones
        selectGenre,
        loadNextPage,
        loadPreviousPage,
        clearSelection,
        getGenreDetails,
        
        // Funciones legacy (para compatibilidad)
        fetchGenres: () => {},
    }
} 