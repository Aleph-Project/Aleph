import { ArrowLeft } from "lucide-react"
import { ViewMode, Tab } from '../../types'

interface NavigationTabsProps {
    activeTab: Tab;
    viewMode: ViewMode;
    onTabChange: (tab: Tab) => void;
    onBackClick: () => void;
}

const tabs: { id: Tab; label: string }[] = [
    { id: 'artists', label: 'Artistas' },
    { id: 'albums', label: 'Álbumes' },
    { id: 'songs', label: 'Canciones' },
    { id: 'categories', label: 'Categorías' },
    { id: 'favorites', label: 'Favoritos' },
    { id: 'comments', label: 'Comentarios' }
]

export function NavigationTabs({
    activeTab,
    viewMode,
    onTabChange,
    onBackClick
}: NavigationTabsProps) {
    return (
        <div className="mb-6">
            <div className="flex space-x-6 border-b border-zinc-700 overflow-x-auto custom-scrollbar pb-1">
                {viewMode === 'artist-detail' ? (
                    <div className="flex items-center">
                        <button 
                            onClick={onBackClick}
                            className="mr-4 p-1 rounded-full hover:bg-zinc-800 transition-colors flex items-center"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Volver</span>
                        </button>
                        <span className="text-sm font-medium text-white border-b-2 border-purple-500 pb-2 px-1">
                            Detalles del artista
                        </span>
                    </div>
                ) : viewMode === 'genre-detail' ? (
                    <div className="flex items-center">
                        <button 
                            onClick={onBackClick}
                            className="mr-4 p-1 rounded-full hover:bg-zinc-800 transition-colors flex items-center"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Volver</span>
                        </button>
                        <span className="text-sm font-medium text-white border-b-2 border-indigo-500 pb-2 px-1">
                            Detalles del género
                        </span>
                    </div>
                ) : (
                    tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`pb-2 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
                                activeTab === tab.id 
                                    ? "text-white border-b-2 border-green-500" 
                                    : "text-zinc-400 hover:text-white"
                            }`}
                            onClick={() => onTabChange(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))
                )}
            </div>
        </div>
    )
} 