import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearch } from "../../hooks/useSearch";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const { search, loading } = useSearch();

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await search(query);
    },
    [query, search]
  );

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
      <Input
        type="text"
        placeholder="Buscar canciones, artistas o álbumes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
        </div>
      )}
    </form>
  );
} 