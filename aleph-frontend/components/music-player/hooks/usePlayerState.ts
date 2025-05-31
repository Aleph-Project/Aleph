import { useState, useCallback } from 'react'
import { Song } from '../types'

export function usePlayerState() {
    const [currentlyPlaying, setCurrentlyPlaying] = useState<Song | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(1)
    const [progress, setProgress] = useState(0)

    const playSong = useCallback((song: Song) => {
        setCurrentlyPlaying(song)
        setIsPlaying(true)
    }, [])

    const pauseSong = useCallback(() => {
        setIsPlaying(false)
    }, [])

    const resumeSong = useCallback(() => {
        setIsPlaying(true)
    }, [])

    const stopSong = useCallback(() => {
        setCurrentlyPlaying(null)
        setIsPlaying(false)
        setProgress(0)
    }, [])

    const updateProgress = useCallback((newProgress: number) => {
        setProgress(newProgress)
    }, [])

    const updateVolume = useCallback((newVolume: number) => {
        setVolume(newVolume)
    }, [])

    return {
        currentlyPlaying,
        isPlaying,
        volume,
        progress,
        playSong,
        pauseSong,
        resumeSong,
        stopSong,
        updateProgress,
        updateVolume
    }
} 