import type React from "react"
import Providers from "./Providers";
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "../styles/globals.css"

import Navbar from "../components/layout/Nav/Navbar"
import ConditionalFooter from "../components/layout/ConditionalFooter"

const montserrat = Montserrat({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Aleph - Música y Cultura",
  description: "Descubre las últimas novedades en música y cultura",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${montserrat.className} min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <div className="h-20"></div> {/* Espaciador para compensar el navbar fijo */}
          <main className="flex-1">
            {children}
          </main>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  )
}
