import { useState, useEffect } from "react";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  // Check API health on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults({ error: "Failed to search" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-indigo-900">
              Cambodia Gazetteer
            </h1>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                apiStatus === "online"
                  ? "bg-green-100 text-green-700"
                  : apiStatus === "offline"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {apiStatus === "online" ? "🟢 API Online" : apiStatus === "offline" ? "🔴 API Offline" : "⏳ Checking..."}
            </span>
          </div>
          <a
            href="https://github.com/manethpak/cambo-geo-index"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-1 mb-6 text-sm font-semibold text-indigo-700 bg-indigo-200 rounded-full">
              Open Source API
            </span>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Cambodia Geographical Index Open API
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              A comprehensive Open API for Cambodia's geographical data,
              providing easy access to information about provinces, districts,
              communes, and villages.
            </p>
          </div>

          {/* Search Demo */}
          <div className="mb-12">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a location (e.g., Phnom Penh, Siem Reap)..."
                  className="flex-1 px-4 py-3 text-lg border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "..." : "Search"}
                </button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults && (
              <div className="mt-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
                {searchResults.error ? (
                  <p className="text-red-600">{searchResults.error}</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Found {searchResults.count} result(s) for "{searchResults.query}"
                    </p>
                    <div className="space-y-3">
                      {searchResults.results?.slice(0, 5).map((result: any) => (
                        <div
                          key={result.code}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {result.name_en}
                                {result.name_km && (
                                  <span className="ml-2 text-gray-600">({result.name_km})</span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">{result.path}</p>
                            </div>
                            <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded">
                              {result.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="/api"
              className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Explore API
            </a>
            <a
              href="https://github.com/manethpak/cambo-geo-index#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 text-lg font-semibold text-indigo-600 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Documentation
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fast & Lightweight
              </h3>
              <p className="text-sm text-gray-600">
                Built with Hono framework for optimal performance
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Type Safe
              </h3>
              <p className="text-sm text-gray-600">
                Written in TypeScript for reliability
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🌏</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Complete Data
              </h3>
              <p className="text-sm text-gray-600">
                Covers all administrative divisions
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Open Source
              </h3>
              <p className="text-sm text-gray-600">
                MIT licensed and free to use
              </p>
            </div>
          </div>

          {/* Quick Start Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-left max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Quick Start
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Installation
                </h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>
                    git clone https://github.com/manethpak/cambo-geo-index.git
                    {"\n"}cd cambo-geo-index{"\n"}pnpm install
                  </code>
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Development
                </h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>pnpm run dev</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 mt-16">
        <div className="text-center text-gray-600">
          <p className="mb-2">Built with ❤️ for Cambodia</p>
          <p className="text-sm">
            Licensed under MIT • Created by{" "}
            <a
              href="mailto:manethpak.dev@gmail.com"
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Maneth PAK
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
