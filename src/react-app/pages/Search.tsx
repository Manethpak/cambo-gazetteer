import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { SearchResult } from "../types";
import { Loader2, MapPin } from "lucide-react";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      setLoading(true);
      setError(null);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setResults(data.data || []);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to fetch search results");
        })
        .finally(() => setLoading(false));
    }
  }, [query]);

  const handleSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <SearchBar onSearch={handleSearch} initialValue={query} loading={loading} />
      </div>

      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600 bg-red-50 rounded-xl">
            {error}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Found {results.length} results for "{query}"
            </h2>
            {results.map((result) => (
              <Link
                key={result.code}
                to={`/code/${result.code}`}
                className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {result.name_en}
                        <span className="ml-2 text-slate-500 font-normal font-khmer">
                          {result.name_km}
                        </span>
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{result.path}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">
                    {result.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12 text-slate-500">
            No results found for "{query}"
          </div>
        ) : null}
      </div>
    </div>
  );
}
