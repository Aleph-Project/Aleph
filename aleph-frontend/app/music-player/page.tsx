import { MusicPlayer } from "@/components/music-player/music-player"
import { Sidebar } from "@/components/music-player/sidebar"
import { MainContent } from "@/components/music-player/main-content"

export default function Home() {
    return (
        <div className="flex flex-col h-screen bg-black text-white pt-16 overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <MainContent />
            </div>
            <MusicPlayer />
        </div>
    )
}
