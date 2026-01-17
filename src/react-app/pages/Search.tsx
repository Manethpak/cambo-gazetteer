import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { SearchResult } from "../types";
import { Loader2, Copy, Check, Search } from "lucide-react";
import { TypeLabel } from "@/components/TypeLabel";
import { getEnglishName, getKhmerName } from "@/libs/name";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [paginate, setPaginate] = useState<{ total: number }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-12">
        <SearchBar onSearch={handleSearch} initialValue={query} loading={loading} />
      </div>

      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-medium text-slate-500">
                Found {paginate?.total} results
              </h2>
            </div>
            <div className="grid gap-3">
              {results.map((result) => (
                <div
                  key={result.code}
                  className="group relative flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-xl font-bold font-khmer text-slate-900">
                        {getKhmerName(result)}
                      </h4>
                      <TypeLabel type={result.type} />
                    </div>
                    <h3 className="text-base text-slate-500 font-medium">
                      {getEnglishName(result)}
                    </h3>
                  </div>

                  <div className="flex items-center gap-6 pl-4">
                    <button
                      type="button"
                      onClick={() => handleCopy(result.code)}
                      className="flex items-center gap-2 group/btn px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Copy Code"
                    >
                      <span className={`text-lg font-mono font-semibold transition-colors ${
                        copiedId === result.code ? "text-emerald-600" : "text-brand-600 group-hover:text-brand-700"
                      }`}>
                        {result.code}
                      </span>
                      {copiedId === result.code ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-300 group-hover/btn:text-brand-400 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-20">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No results found</h3>
            <p className="text-slate-500 mt-1">We couldn''t find anything for "{query}"</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
