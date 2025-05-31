import { useState, useEffect, useCallback } from 'react'
import { Song as SongType, Album as AlbumType, Artist as ArtistType } from '@/services/songService'
import { Artist, Album, Song, SearchResults } from '../types'

interface SearchResults {
    artists: { id: number | string; name: string; imageUrl: string }[];
    albums: { id: number | string; title: string; artist: string; coverUrl: string }[];
    songs: SongType[];
}

export function useSearch(
    apiSongs: SongType[],
    apiAlbums: AlbumType[],
    staticArtists: { id: number; name: string; imageUrl: string }[],
    staticAlbums: { id: number; title: string; artist: string; coverUrl: string }[]
) {
    const [searchTerm, setSearchTerm] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<SearchResults>({
        artists: [],
        albums: [],
        songs: []
    })

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term)
        setIsSearching(term.trim() !== '')

        if (term.trim() === '') {
            setSearchResults({
                artists: [],
                albums: [],
                songs: []
            })
            return
        }

        // Filtrar artistas
        const filteredArtists = staticArtists.filter((artist) => 
            artist.name.toLowerCase().includes(term)
        )

        // Filtrar álbumes
        const staticFilteredAlbums = staticAlbums.filter(
            (album) => album.title.toLowerCase().includes(term) || 
                      album.artist.toLowerCase().includes(term)
        )
        
        const dynamicAlbums = apiAlbums.filter(
            (album) => album.title.toLowerCase().includes(term) || 
                      album.artist.toLowerCase().includes(term)
        )
        
        const allAlbums = [...staticFilteredAlbums, ...dynamicAlbums]

        // Filtrar canciones
        const filteredSongs = apiSongs.filter(
            (song) =>
                song.title.toLowerCase().includes(term) ||
                song.artist.toLowerCase().includes(term) ||
                (song.album && song.album.toLowerCase().includes(term))
        )

        setSearchResults({
            artists: filteredArtists,
            albums: allAlbums,
            songs: filteredSongs
        })
    }, [apiSongs, apiAlbums, staticArtists, staticAlbums])

    const clearSearch = useCallback(() => {
        setSearchTerm('')
        setIsSearching(false)
        setSearchResults({
            artists: [],
            albums: [],
            songs: []
        })
    }, [])

    return {
        searchTerm,
        isSearching,
        searchResults,
        handleSearch,
        clearSearch
    }
} 