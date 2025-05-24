"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Search, Play, Heart, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

type Song = {
  _id: string
  title: string
  artist: string
  album: string
  album_id: string
  cover_url: string
  duration: string
  likes: number
  plays: number
  release_date: string
  genre: string
}

export default function BuscarCanciones() {
  const [searchTerm, setSearchTerm] = useState("")
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (searchTerm.trim() === "") {
      setSongs([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/v1/music/songs/search?name=${encodeURIComponent(searchTerm)}`)
        const data = await response.json()
        setSongs(data)
      } catch (error) {
        console.error("Error al buscar canciones:", error)
        setSongs([])
      } finally {
        setLoading(false)
      }
    }, 400) // 400ms debounce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  // Enfocar el input de búsqueda al cargar la página
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Formatear número de reproducciones
  const formatPlays = (plays: number) => {
    if (plays >= 1000000) {
      return `${(plays / 1000000).toFixed(1)}M`
    } else if (plays >= 1000) {
      return `${(plays / 1000).toFixed(1)}K`
    }
    return plays.toString()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Buscar</h1>

        {/* Barra de búsqueda */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar canciones..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {!loading && searchTerm && songs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">No se encontraron canciones con "{searchTerm}"</p>
          </div>
        )}

        {/* Resultados de la búsqueda */}
        {songs.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-12 text-sm text-zinc-400 px-4 py-2 border-b border-zinc-800">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Título</div>
              <div className="col-span-3">Álbum</div>
              <div className="col-span-2">Fecha</div>
              <div className="col-span-1 flex justify-end">
                <Clock className="h-4 w-4" />
              </div>
            </div>

            {songs.map((song, index) => (
              <div
                key={song._id}
                className="grid grid-cols-12 items-center px-4 py-3 rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/reviews/song/${song._id}`)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    router.push(`/reviews/song/${song._id}`)
                  }
                }}
              >
                <div className="col-span-1 text-zinc-400">{index + 1}</div>
                <div className="col-span-5 flex items-center space-x-4">
                  <div className="relative flex-shrink-0 w-12 h-12">
                    <Image
                      src={song.cover_url || "/placeholder.svg"}
                      alt={song.album}
                      fill
                      className="object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{song.title}</h3>
                    <p className="text-sm text-zinc-400">{song.artist}</p>
                  </div>
                </div>
                <div className="col-span-3 text-zinc-400 truncate">{song.album}</div>
                <div className="col-span-2 text-zinc-400 text-sm">
                  {new Date(song.release_date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="col-span-1 flex items-center justify-end space-x-4">
                  <div className="flex items-center text-zinc-400 text-sm">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>{formatPlays(song.likes)}</span>
                  </div>
                  <span className="text-zinc-400 text-sm">{song.duration}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mensaje inicial cuando no hay búsqueda */}
        {!searchTerm && !loading && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-purple-600 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-medium mb-2">Busca tu música favorita</h2>
            <p className="text-zinc-400">Escribe el título de una canción para comenzar a buscar</p>
          </div>
        )}
      </div>
    </div>
  )
}