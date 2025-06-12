import { useState } from "react"
import type { Artist } from "../types"

export function useArtistsByGenre() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchArtistsByGenre = async (genreName: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query($genre: String!) {
              artistsByGenre(genre: $genre) {
                id
                name
                image_url
                genres
              }
            }
          `,
          variables: { genre: genreName }
        })
      })
      const json = await res.json()
      setArtists(json.data.artistsByGenre)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { artists, loading, error, fetchArtistsByGenre }
} 