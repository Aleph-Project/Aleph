import { Skeleton } from "@/components/ui/skeleton"

export function ArtistSkeleton() {
    return (
        <div className="group">
            <div className="p-3 rounded-lg">
                <Skeleton className="w-full aspect-square rounded-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    )
}

export function AlbumSkeleton() {
    return (
        <div className="group">
            <div className="p-3 rounded-lg">
                <Skeleton className="w-full aspect-square rounded-lg mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    )
}

export function CategorySkeleton() {
    return (
        <div className="group">
            <Skeleton className="w-full aspect-square rounded-lg" />
        </div>
    )
}

export function SongSkeleton() {
    return (
        <div className="flex items-center p-3">
            <Skeleton className="h-8 w-8 rounded mr-3" />
            <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-3 w-10" />
        </div>
    )
} 