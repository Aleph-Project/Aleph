"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Play, TrendingUp, Headphones, Volume2, Crown } from "lucide-react"

type TopSong = {
    title: string
    album_image_url: string
    plays: number
}

export default function Top10Page() {
  const [topSongs, setTopSongs] = useState<TopSong[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  useEffect(() => {
    const fetchTopSongs = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/v1/analytics/top-songs")
        const data = await response.json()
        setTopSongs(data)
      } catch (error) {
        console.error("Error al cargar el top 10:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopSongs()

    
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cabecera con imagen de fondo difuminada */}
      <div className="relative">
        {/* Fondo difuminado */}
        <div className="absolute inset-0 overflow-hidden h-80">
          <div className="relative w-full h-full">
            <Image
              src={topSongs[0]?.album_image_url || "/placeholder.svg"}
              alt="Top song background"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black backdrop-blur-xl"></div>

            {/* Efecto de partículas */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-purple-500"
                  style={{
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.3,
                    animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido sobre la imagen */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-block mb-4 relative">
            <TrendingUp className="h-16 w-16 mx-auto mb-2 text-purple-500" />
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
              TOP 10
            </h1>
            
          </div>
          <p className="text-zinc-300 text-xl max-w-2xl mx-auto mt-4">
            Las canciones más escuchadas en Aleph esta semana
          </p>
        </div>
      </div>

      {/* Lista del top 10 */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        <div className="space-y-8">
          {topSongs.map((song, index) => (
            <div key={index} className="flex items-center justify-center pt-4 pb-8 space-x-4">
              {/* Número grande en blanco intenso */}
              <div className="w-32 md:w-40 flex items-center justify-center">
                <div
                  className="text-8xl md:text-[10rem] font-extrabold text-white opacity-60 select-none leading-none"
                  style={{
                    textShadow: "0 0 20px rgba(255,255,255,0.4)",
                    WebkitTextStroke: "1px rgba(255,255,255,0.2)",
                  }}
                >
                  {index + 1}
                </div>
              </div>

              {/* Tarjeta de canción (más compacta) */}
              <div className="relative group w-[400px]">
                <div
                  className={`relative bg-zinc-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl transition-all duration-300 group-hover:scale-[1.01] border border-zinc-800 max-w-md mx-auto ${
                    index === 0
                      ? "border-yellow-500/50 shadow-yellow-500/20"
                      : index === 1
                        ? "border-zinc-400/50 shadow-zinc-400/20"
                        : index === 2
                          ? "border-amber-700/50 shadow-amber-700/20"
                          : "hover:border-purple-900/30 hover:shadow-purple-900/20"
                  }`}
                >
                  <div className="flex items-center p-4">
                    {/* Imagen del álbum */}
                    <div className="w-16 h-16 md:w-20 md:h-20 relative mr-4 flex-shrink-0 shadow-lg">
                      <Image
                        src={song.album_image_url || "/placeholder.svg"}
                        alt={song.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                        <div className="bg-purple-600 rounded-full p-2 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                          <Play className="h-5 w-5 text-white" fill="white" />
                        </div>
                      </div>
                    </div>

                    {/* Información de la canción */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg md:text-xl mb-1 group-hover:text-purple-400 transition-colors duration-300 truncate">
                        {song.title}
                      </h3>
                      <div className="flex items-center text-sm text-zinc-400">
                        <Headphones className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{song.plays.toLocaleString()} reproducciones</span>
                      </div>
                    </div>

                    {/* Visualizador de audio (sorpresa) */}
                    {activeIndex === index && (
                      <div className="hidden md:flex items-center space-x-1 ml-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-purple-500 rounded-full"
                            style={{
                              height: `${12 + Math.random() * 16}px`,
                              animation: `equalizer ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          ></div>
                        ))}
                      </div>
                    )}

                    {/* Icono de audio */}
                    {activeIndex === index && <Volume2 className="h-5 w-5 text-purple-500 ml-2 animate-pulse" />}
                  </div>

                  {/* Barra de color según posición */}
                  <div
                    className={`h-1 w-full ${
                      index === 0
                        ? "bg-gradient-to-r from-yellow-400 to-amber-600" // Oro
                        : index === 1
                          ? "bg-gradient-to-r from-zinc-300 to-slate-400" // Plata
                          : index === 2
                            ? "bg-gradient-to-r from-amber-700 to-orange-600" // Bronce
                            : "bg-purple-600/30"
                    }`}
                  ></div>

                  {/* Efecto de brillo para el top 3*/}
                  {index < 3 && (
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"
                      style={{
                        backgroundSize: "200% 100%",
                      }}
                    ></div>
                  )}

                  {/* Medalla para el top 3*/}
                  {index < 3 && (
                    <div
                      className={`absolute -right-2 -top-2 w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                        index === 0 ? "bg-yellow-500" : index === 1 ? "bg-zinc-300" : "bg-amber-700"
                      }`}
                    >
                      <span className="text-black font-bold text-sm">{index + 1}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de estadísticas */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-8 border border-zinc-800">
          <h2 className="text-2xl font-bold mb-6 text-center">Estadísticas de reproducción</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-800/70 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="bg-purple-600/20 p-4 rounded-full mb-4">
                <Headphones className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-sm text-zinc-400 mb-1">Total de reproducciones</p>
              <p className="text-3xl font-bold">
                {topSongs.reduce((sum, song) => sum + song.plays, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-zinc-800/70 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="bg-purple-600/20 p-4 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-sm text-zinc-400 mb-1">Canción más popular</p>
              <p className="text-xl font-bold truncate max-w-full">{topSongs[0]?.title || "Cargando..."}</p>
            </div>
            <div className="bg-zinc-800/70 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="bg-purple-600/20 p-4 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-500"
                >
                  <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 2v2" />
                  <path d="M12 6v14" />
                  <path d="M16 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M16 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M16 9v2" />
                  <path d="M16 13v2" />
                  <path d="M8 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M8 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M8 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M8 5v2" />
                  <path d="M8 9v2" />
                  <path d="M8 13v2" />
                </svg>
              </div>
              <p className="text-sm text-zinc-400 mb-1">Actualizado</p>
              <p className="text-xl font-bold">Hoy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS para animaciones */}
      {/* <style global jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
        
        @keyframes equalizer {
          0% {
            height: 5px;
          }
          100% {
            height: 20px;
          }
        }
      `}</style> */}
    </div>
  )
}