import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchFilterProps {
  onFilterChange: (query: string) => void;
}

export function SearchFilter({ onFilterChange }: SearchFilterProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onFilterChange]);

  return (
    <div className="relative mt-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search songs, artists, or albums..."
        className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent"
      />
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
}
