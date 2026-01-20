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
  className = "",
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
          className="w-full pl-14 pr-36 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          ) : (
            <Search className="w-6 h-6" />
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-95"
        >
          Search
        </button>
      </div>
    </form>
  );
}
