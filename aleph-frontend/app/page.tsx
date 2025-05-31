import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <>
      {/* Fondo fijo con gradiente */}
      <div className="gradient-background"></div>
      
      {/* Efecto de destello central fijo */}
      <div className="light-glow"></div>
      
      {/* Contenido scrolleable */}
      <div className="content-wrapper">
        {/* Hero Section */}
        <main className="flex-grow flex flex-col justify-center w-full px-8 sm:px-12 md:px-16 py-24 pt-32 relative z-10">
          <div className="flex justify-between items-start">
            <div className="max-w-3xl">
              <h1 className="hero-title text-6xl md:text-7xl lg:text-8xl mb-6">
                Hola
                <br />
                espero
                <br />
                <span className="text-purple-300/70">que estés</span> 
                <br />
                <span className="text-purple-300/70">bien</span>
              </h1>
              {/* Esto de acá abajo lo pueden borrar */}
              <div className="flex space-x-2 mt-6">
                {[0, 1, 2, 3,4].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="hidden lg:block">
              <p className="text-sm text-white/70 max-w-xs">
                We believe good design is key to building strong connections.
              </p>
            </div> */}
          </div>
          
          <div className="mt-auto flex justify-between items-center">
            
            {/* <div className="flex gap-2">
              <div className="w-24 h-16 rounded-md overflow-hidden bg-gray-800/50">
                <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-transparent"></div>
              </div>
              <div className="w-24 h-16 rounded-md overflow-hidden bg-gray-800/50">
                <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-transparent"></div>
              </div>
              <div className="w-24 h-16 rounded-md overflow-hidden bg-gray-800/50">
                <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-transparent"></div>
              </div>
            </div> */}
            {/* acá abajo un scroll down por si nos sirve */}
            {/* <div className="flex flex-col items-center">
              <span className="text-sm uppercase mb-1">Scroll Now</span>
              <div className="border border-white/30 w-8 h-8 rounded-full flex items-center justify-center scroll-indicator">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7"></path>
                </svg>
              </div>
            </div> */}
          </div>
        </main>

        {/* Inicio de la sección "At Aleph" similar a la sección "At oxaley" */}
        <section className="w-full px-8 sm:px-12 md:px-16 py-24 border-t border-white/10 relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl hero-title mb-8">
            Hola de nuevo
            <br />
            Primero la música
          </h2>
          {/* Resto del contenido se añadiría aquí */}
        </section>
      </div>
    </>
  )
}