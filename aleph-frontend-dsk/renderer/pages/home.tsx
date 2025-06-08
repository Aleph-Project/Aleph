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
                <span className="text-purple-300/70">Aleph Music</span>
              </h1>
              <h2 className="text-2xl md:text-3xl text-white/90 mb-6">
                Experiencia musical sin compromiso
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mt-4">
                Bienvenido a la plataforma para los verdaderos amantes de la música. 
                Aleph ofrece una biblioteca con tus sonidos favoritos, 
                curada para para satisfacer incluso a los oídos más exigentes. 
                Descubra nuevos artistas y redescubra clásicos.
              </p>
              <div className="flex space-x-4 mt-8">
                <Link href="/auth/login" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors font-medium">
                  Explorar Biblioteca
                </Link>
                <Link href="/auth/login?screen_hint=signup" className="px-6 py-3 border border-white/30 hover:bg-white/10 rounded-md transition-colors font-medium">
                  Crear Cuenta
                </Link>
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
            Su música, su manera
            <br />
            Una experiencia personalizada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white/5 p-6 rounded-lg">
              <h3 className="text-2xl mb-4 font-medium">Perfil personalizado</h3>
              <p className="text-white/80">
                Configure su perfil para reflejar sus gustos y recibir recomendaciones hechas a su medida.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg">
              <h3 className="text-2xl mb-4 font-medium">Descubrimiento de música</h3>
              <p className="text-white/80">
                Explore nuevos géneros y artistas gracias a nuestras herramientas inteligentes de búsqueda.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg">
              <h3 className="text-2xl mb-4 font-medium">Cree sus listas</h3>
              <p className="text-white/80">
                Organice sus canciones favoritas en listas personalizadas para cada ocasión y estado de ánimo.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg">
              <h3 className="text-2xl mb-4 font-medium">Reseñas detalladas</h3>
              <p className="text-white/80">
                Comparta su opinión y descubra críticas que enriquecen su experiencia musical.
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link href="/auth/login" className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors font-medium inline-block">
              Comenzar su viaje musical
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
// import React from 'react'
// import Head from 'next/head'
// import Link from 'next/link'
// import Image from 'next/image'

// export default function NextPage() {
//   return (
//     <React.Fragment>
//       <Head>
//         <title>Next - Nextron (with-tailwindcss)</title>
//       </Head>
//       <div className="grid grid-col-1 text-2xl w-full text-center">
//         <div>
//           <Image
//             className="ml-auto mr-auto"
//             src="/images/logo.png"
//             alt="Logo image"
//             width={256}
//             height={256}
//           />
//         </div>
//         <span>⚡ Nextron ⚡</span>
//       </div>
//       <div className="mt-1 w-full flex-wrap flex justify-center">
//         <Link href="/home">Go to home page</Link>
//       </div>
//     </React.Fragment>
//   )
// }