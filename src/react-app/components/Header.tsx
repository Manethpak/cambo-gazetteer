import { Link } from "react-router-dom";
import { Github, Search, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group" onClick={handleLinkClick}>
            <img src="/assets/logo.png" alt="Cambo Gazetteer Logo" className="w-9 h-9 rounded-lg" />
            <span className="font-bold text-xl text-slate-900">Cambo Gazetteer</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/why"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Why?
            </Link>
            <Link
              to="/provinces"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Provinces
            </Link>
            <Link
              to="/datasource"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Data Source
            </Link>
            <Link
              to="/api/docs"
              target="_blank"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              API Docs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
            <div
              className={`w-2 h-2 rounded-full ${
                apiStatus === "online"
                  ? "bg-emerald-500"
                  : apiStatus === "offline"
                    ? "bg-red-500"
                    : "bg-amber-500"
              }`}
            />
            <span className="text-xs font-medium text-slate-600">
              {apiStatus === "online"
                ? "API Online"
                : apiStatus === "offline"
                  ? "API Offline"
                  : "Checking..."}
            </span>
          </div>

          {/* Search Button */}
          <Link
            to="/search"
            className="p-2 text-slate-500 hover:text-indigo-600 transition-colors hover:bg-indigo-50 rounded-lg hidden lg:block"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Link>

          <Link
            to="https://github.com/Manethpak/cambo-gazetteer"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Github className="w-5 h-5" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link
              to="/search"
              onClick={handleLinkClick}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
            <Link
              to="/why"
              onClick={handleLinkClick}
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Why?
            </Link>
            <Link
              to="/provinces"
              onClick={handleLinkClick}
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Provinces
            </Link>
            <Link
              to="/datasource"
              onClick={handleLinkClick}
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Data Source
            </Link>
            <Link
              to="/api/docs"
              target="_blank"
              onClick={handleLinkClick}
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              API Docs
            </Link>

            {/* API Status in Mobile Menu */}
            <div className="sm:hidden flex items-center gap-2 px-4 py-3 mt-2 bg-slate-50 rounded-lg border border-slate-200">
              <div
                className={`w-2 h-2 rounded-full ${
                  apiStatus === "online"
                    ? "bg-emerald-500"
                    : apiStatus === "offline"
                      ? "bg-red-500"
                      : "bg-amber-500"
                }`}
              />
              <span className="text-xs font-medium text-slate-600">
                {apiStatus === "online"
                  ? "API Online"
                  : apiStatus === "offline"
                    ? "API Offline"
                    : "Checking..."}
              </span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
