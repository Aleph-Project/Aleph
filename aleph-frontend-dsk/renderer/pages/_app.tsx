// import '../styles/globals.css';
// import type { AppProps } from 'next/app';
// import { ThemeProvider } from '../components/theme-provider';

// function MyApp({ Component, pageProps }: AppProps) {
//   return (
//     <ThemeProvider attribute="class" defaultTheme="dark">
//       <Component {...pageProps} />
//     </ThemeProvider>
//   );
// }

// export default MyApp;

import type { AppProps } from 'next/app'
import { Montserrat } from "next/font/google"
import Head from 'next/head'
import "../styles/globals.css"

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