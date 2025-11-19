import { Search, Loader2 } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  initialValue?: string;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  onSearch, 
  loading = false, 
  initialValue = "", 
  placeholder = "Search for a location...",
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl shadow-sm text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Search className="w-6 h-6" />
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
