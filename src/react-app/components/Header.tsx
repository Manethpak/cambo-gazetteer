import { Link } from "react-router-dom";
import { Map, Github } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">(
    "checking",
  );

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <Map className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">
              Cambo Gazetteer
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/provinces"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Provinces
            </Link>
            <a
              href="/api/docs"
              target="_blank"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              API Docs
            </a>
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

          <a
            href="https://github.com/Manethpak/cambo-gazetteer"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
