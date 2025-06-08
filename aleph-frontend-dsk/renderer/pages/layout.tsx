// import type React from "react"
// import Providers from "./Providers";
// import type { Metadata } from "next"
// import { Montserrat } from "next/font/google"
// import "../styles/globals.css"

// import Navbar from "../components/layout/Nav/Navbar"
// import ConditionalFooter from "../components/layout/ConditionalFooter"

// const montserrat = Montserrat({ subsets: ["latin"] })

// // export const metadata: Metadata = {
// //   title: "Aleph - Música y Cultura",
// //   description: "Descubre las últimas novedades en música y cultura",
// //   generator: 'v0.dev'
// // }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="es">
//       <body className={`${montserrat.className} min-h-screen flex flex-col`}>
//         <Providers>
//           <Navbar />
//           <div className="h-20"></div> {/* Espaciador para compensar el navbar fijo */}
//           <main className="flex-1">
//             {children}
//           </main>
//           <ConditionalFooter />
//         </Providers>
//       </body>
//     </html>
//   )
// }
import type { AppProps } from 'next/app'
import { Montserrat } from "next/font/google"
import Head from 'next/head'
// import "../styles/globals.css"

import Providers from "./Providers"
import Navbar from "../components/layout/Nav/Navbar"
import ConditionalFooter from "../components/layout/ConditionalFooter"

const montserrat = Montserrat({ subsets: ["latin"] })

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Aleph - Música y Cultura</title>
        <meta name="description" content="Descubre las últimas novedades en música y cultura" />
        <meta name="generator" content="v0.dev" />
      </Head>
      <div className={`${montserrat.className} min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <div className="h-20"></div> {/* Espaciador para compensar el navbar fijo */}
          <main className="flex-1">
            <Component {...pageProps} />
          </main>
          <ConditionalFooter />
        </Providers>
      </div>
    </>
  )
}