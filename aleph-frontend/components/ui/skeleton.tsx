import { cn } from "@/lib/utils"
import { Artist as ArtistType, Album as AlbumType, Song as SongType } from "@/services/songService"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
export interface ArtistDetailProps {
  artist: ArtistType;
  albums: AlbumType[];
  songs: SongType[];
  isLoading: boolean;
}
