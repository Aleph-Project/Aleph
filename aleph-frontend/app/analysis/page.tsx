"use client"
import Link from "next/link"
import { TrendingUp, Users, Globe, BarChart3, Crown, Play } from "lucide-react"

export default function AnalisisPage() {

  // Opciones de análisis disponibles
  const analysisOptions = [
    {
      title: "Top 10 Canciones",
      description: "Las canciones más escuchadas en ALEPH esta semana",
      icon: <TrendingUp className="h-12 w-12" />,
      href: "/top-songs",
      gradient: "from-purple-600 to-pink-600",
      preview: "🎵 Descubre los hits del momento",
    },
    {
      title: "Top Artistas",
      description: "Los artistas más populares y escuchados",
      icon: <Users className="h-12 w-12" />,
      href: "/top-artists",
      gradient: "from-blue-600 to-purple-600",
      preview: "🎤 Conoce a los artistas favoritos",
    },
    {
      title: "Rankings por País",
      description: "Explora las tendencias musicales por región",
      icon: <Globe className="h-12 w-12" />,
      href: "/top-songs-country/Colombia",
      gradient: "from-green-600 to-blue-600",
      preview: "🌍 Música sin fronteras",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cabecera principal */}
      <div className="relative">
        {/* Fondo con gradiente y efectos */}
        <div className="absolute inset-0 overflow-hidden h-80">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30"></div>

          {/* Efectos de partículas flotantes */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{
                  width: `${Math.random() * 15 + 5}px`,
                  height: `${Math.random() * 15 + 5}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.7 + 0.3,
                  animation: `float ${Math.random() * 15 + 10}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              ></div>
            ))}
          </div>

          {/* Ondas decorativas */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" className="w-full h-20 fill-purple-600/20">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"></path>
            </svg>
          </div>
        </div>

        {/* Contenido de la cabecera */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-block mb-6 relative">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="h-20 w-20 text-purple-500 mr-4" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-transparent bg-clip-text">
              ANÁLISIS
            </h1>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
          </div>
          <p className="text-zinc-300 text-xl max-w-3xl mx-auto mt-6">
            Descubre las tendencias musicales, artistas populares y rankings por país en ALEPH
          </p>
        </div>
      </div>


      {/* Opciones de análisis */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Explora nuestros análisis</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {analysisOptions.map((option, index) => (
            <Link key={index} href={option.href}>
              <div className="group relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
                {/* Gradiente de fondo */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                {/* Contenido */}
                <div className="relative p-8">
                  {/* Icono */}
                  <div className="mb-6">
                    <div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${option.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {option.icon}
                    </div>
                  </div>

                  {/* Título y descripción */}
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-zinc-400 mb-4 leading-relaxed">{option.description}</p>

                  {/* Preview */}
                  <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-zinc-300">{option.preview}</p>
                  </div>

                  {/* Estadísticas
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">{option.stats}</span>
                    <div className="flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                      <span className="text-sm font-medium mr-2">Explorar</span>
                      <Play className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div> */}
                </div>

                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-5 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Estilos CSS para animaciones */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) translateX(10px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) translateX(-10px) rotate(240deg);
          }
          100% {
            transform: translateY(0) translateX(0) rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
