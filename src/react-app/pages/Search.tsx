import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { SearchResult } from "../types";
import { Loader2, ChevronRight } from "lucide-react";
import { TypeLabel } from "@/components/TypeLabel";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [paginate, setPaginate] = useState<{ total: number }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      setLoading(true);
      setError(null);
      fetch(`/api/search?limit=50&q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setResults(data.data || []);
          setPaginate(data.pagination);
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
          <div className="text-center py-12 text-red-600 bg-red-50 rounded-xl">{error}</div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 px-1">
              Showing {results.length} out of {paginate?.total} results for "{query}"
            </h2>
            <div className="grid gap-4">
              {results.map((result) => (
                <Link
                  key={result.code}
                  to={`/code/${result.code}`}
                  className="group block bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-indigo-300 transition-all overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2">
                        <TypeLabel type={result.type} />
                        <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg">
                          <span className="text-slate-400">#</span>
                          {result.code}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
                        {result.name_en}
                      </h3>
                      <h4 className="text-lg font-khmer text-slate-600 group-hover:text-indigo-600/80 transition-colors">
                        {result.name_km}
                      </h4>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl group-hover:bg-indigo-50/50 transition-colors border border-slate-100 group-hover:border-indigo-100">
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-slate-600 leading-relaxed">
                          {result.path || "Location path not available"}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-slate-600 leading-relaxed font-khmer">
                          {result.pathKm || "Location path not available"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-12 text-slate-500">No results found for "{query}"</div>
        ) : null}
      </div>
    </div>
  );
}
