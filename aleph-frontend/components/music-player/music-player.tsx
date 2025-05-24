"use client"

import { Play, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Pause } from "lucide-react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function MusicPlayer() {
    const [isLoading, setIsLoading] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)

    // Simular carga de datos
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 250)

        return () => clearTimeout(timer)
    }, [])

    const togglePlay = () => {
        setIsPlaying(!isPlaying)
    }

    return (
        <div className="h-20 bg-zinc-900 border-t border-zinc-800 flex items-center px-4">
            {/* Song Info */}
            <div className="flex items-center w-1/3">
                {isLoading ? (
                    <div className="flex items-center">
                        <Skeleton className="h-14 w-14 rounded mr-3" />
                        <div>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ) : (
                    <>
                        <img
                            src="/placeholder.svg?height=56&width=56"
                            alt="Album cover"
                            className="h-14 w-14 rounded object-cover mr-3"
                        />
                        <div>
                            <h4 className="text-sm font-medium">Blinding Lights</h4>
                            <p className="text-xs text-zinc-400">The Weeknd</p>
                        </div>
                    </>
                )}
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center w-1/3">
                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </>
                    ) : (
                        <>
                            <button className="text-zinc-400 hover:text-white">
                                <Shuffle className="h-4 w-4" />
                            </button>
                            <button className="text-zinc-400 hover:text-white">
                                <SkipBack className="h-5 w-5" />
                            </button>
                            <button onClick={togglePlay} className="bg-white text-black rounded-full p-2 hover:scale-105 transition">
                                {isPlaying ? <Pause className="h-5 w-5 fill-black" /> : <Play className="h-5 w-5 fill-black" />}
                            </button>
                            <button className="text-zinc-400 hover:text-white">
                                <SkipForward className="h-5 w-5" />
                            </button>
                            <button className="text-zinc-400 hover:text-white">
                                <Repeat className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
                <div className="w-full flex items-center gap-2 mt-2">
                    {isLoading ? (
                        <div className="w-full flex items-center gap-2">
                            <Skeleton className="h-3 w-8" />
                            <Skeleton className="h-1 flex-1 rounded-full" />
                            <Skeleton className="h-3 w-8" />
                        </div>
                    ) : (
                        <>
                            <span className="text-xs text-zinc-400">1:23</span>
                            <div className="h-1 flex-1 bg-zinc-700 rounded-full">
                                <div className="h-1 w-1/3 bg-white rounded-full"></div>
                            </div>
                            <span className="text-xs text-zinc-400">3:45</span>
                        </>
                    )}
                </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-end w-1/3">
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-1 w-24 rounded-full" />
                    </div>
                ) : (
                    <>
                        <Volume2 className="h-5 w-5 text-zinc-400 mr-2" />
                        <div className="h-1 w-24 bg-zinc-700 rounded-full">
                            <div className="h-1 w-2/3 bg-white rounded-full"></div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
