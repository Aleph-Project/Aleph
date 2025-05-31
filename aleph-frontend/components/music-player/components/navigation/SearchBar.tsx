import { Search, X } from "lucide-react"

interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onClearSearch: () => void;
}

export function SearchBar({ searchTerm, onSearchChange, onClearSearch }: SearchBarProps) {
    return (
        <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Busca canciones, artistas o albums"
                className="w-full py-3 pl-10 pr-10 bg-zinc-900 rounded-full text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {searchTerm && (
                <button onClick={onClearSearch} className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <X className="h-5 w-5 text-zinc-400 hover:text-white" />
                </button>
            )}
        </div>
    )
} 