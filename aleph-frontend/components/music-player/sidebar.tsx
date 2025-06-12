"use client"
// Por ahora no usaremos este sidebar :)

// import { Home, Users, Music, Plus } from "lucide-react"
// import { playlists } from "@/data/playlists"
// import { useState, useEffect } from "react"
// import { Skeleton } from "@/components/ui/skeleton"

export function Sidebar() {
    // const [isLoading, setIsLoading] = useState(true)

    // // Simular carga de datos
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setIsLoading(false)
    //     }, 250)

    //     return () => clearTimeout(timer)
    // }, [])

    // // Componentes Skeleton
    // const NavItemSkeleton = () => (
    //     <div className="flex items-center gap-3 py-2">
    //         <Skeleton className="h-5 w-5 rounded" />
    //         <Skeleton className="h-4 w-24" />
    //     </div>
    // )

    // const PlaylistSkeleton = () => (
    //     <div className="flex items-center gap-3 p-2">
    //         <Skeleton className="h-12 w-12 rounded-md" />
    //         <div className="flex flex-col gap-1.5">
    //             <Skeleton className="h-4 w-24" />
    //             <Skeleton className="h-3 w-16" />
    //         </div>
    //     </div>
    // )

    // return (
    //     <div className="w-64 flex-shrink-0 h-full overflow-y-auto bg-black p-4">
    //         {/* Navigation Menu */}
    //         <div className="bg-zinc-900 rounded-lg p-4 mb-4">
    //             {isLoading ? (
    //                 <div className="space-y-3">
    //                     <NavItemSkeleton />
    //                     <NavItemSkeleton />
    //                     <NavItemSkeleton />
    //                 </div>
    //             ) : (
    //                 <ul className="space-y-3">
    //                     <li>
    //                         <a href="#" className="flex items-center gap-3 text-zinc-200 hover:text-white">
    //                             <Home className="h-5 w-5" />
    //                             <span>Inicio</span>
    //                         </a>
    //                     </li>
    //                     <li>
    //                         <a href="#" className="flex items-center gap-3 text-zinc-200 hover:text-white">
    //                             <Users className="h-5 w-5" />
    //                             <span>Comunidades</span>
    //                         </a>
    //                     </li>
    //                     <li>
    //                         <a href="#" className="flex items-center gap-3 text-zinc-200 hover:text-white">
    //                             <Music className="h-5 w-5" />
    //                             <span>Mis canciones</span>
    //                         </a>
    //                     </li>
    //                 </ul>
    //             )}
    //         </div>

    //         {/* Library */}
    //         <div className="bg-zinc-900 rounded-lg p-4">
    //             <div className="flex items-center justify-between mb-4">
    //                 <h2 className="font-semibold text-zinc-200">Tu biblioteca</h2>
    //                 {!isLoading && (
    //                     <button className="p-1 rounded-full hover:bg-zinc-800">
    //                         <Plus className="h-5 w-5" />
    //                     </button>
    //                 )}
    //             </div>

    //             <div className="space-y-3">
    //                 {isLoading ? (
    //                     <>
    //                         <PlaylistSkeleton />
    //                         <PlaylistSkeleton />
    //                         <PlaylistSkeleton />
    //                         <PlaylistSkeleton />
    //                         <PlaylistSkeleton />
    //                     </>
    //                 ) : (
    //                     playlists.map((playlist) => (
    //                         <div key={playlist.id} className="flex items-center gap-3 hover:bg-zinc-800 p-2 rounded-md">
    //                             <img
    //                                 src={playlist.coverUrl || "/placeholder.svg"}
    //                                 alt={playlist.title}
    //                                 className="h-12 w-12 rounded-md object-cover"
    //                             />
    //                             <div>
    //                                 <h3 className="font-bold text-sm">{playlist.title}</h3>
    //                                 <p className="text-xs text-zinc-400">{playlist.songCount} canciones</p>
    //                             </div>
    //                         </div>
    //                     ))
    //                 )}
    //             </div>
    //         </div>
    //     </div>
    // )
    return null;
}
