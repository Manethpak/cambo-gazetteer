import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { Map, Database, Zap, Search, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { StatsResponse } from "../types";

export function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    fetch("/api/v1/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to fetch stats", err));
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center bg-slate-950 text-white py-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-soft-light"></div>
        <div className="absolute inset-0 bg-linear-to-tr from-slate-950 via-slate-950/95 to-indigo-950/50"></div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div
            className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-semibold mb-12 backdrop-blur-md animate-fade-in">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping"></span>
              API v1.0 NOW LIVE
            </div>

            <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter leading-[0.9] animate-slide-up">
              Cambodia's <br />
              <span className="gradient-text premium-gradient">
                Digital Map
              </span>
            </h1>

            <div className="max-w-3xl mx-auto mb-8 transform hover:scale-[1.01] transition-all duration-500 shadow-2xl shadow-indigo-500/20">
              <SearchBar onSearch={handleSearch} />
            </div>

            <p className="text-sm md:text-base text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto font-medium opacity-80">
              Seamless access to 16,000+ administrative units.{" "}
              <br className="hidden md:block" />
              Built for speed, reliability, and modern developer experience.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/explore"
                className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all hover:shadow-[0_0_40px_rgba(79,70,229,0.3)] active:scale-95"
              >
                Explore data sets
              </Link>
              <a
                href="/api/docs"
                target="_blank"
                className="px-8 py-3.5 bg-white/5 text-white rounded-2xl font-bold border border-white/10 hover:bg-white/10 transition-all active:scale-95 backdrop-blur-sm"
              >
                Developer API
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Quick Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-10">
            <QuickStat
              label="Provinces"
              value={stats?.byType.provinces}
              loading={!stats}
              icon={<Map className="w-5 h-5 text-indigo-500" />}
            />
            <QuickStat
              label="Capital"
              value={stats?.byType.municipalities}
              loading={!stats}
              icon={<Zap className="w-5 h-5 text-amber-500" />}
            />
            <QuickStat
              label="Districts"
              value={stats?.byType.districts}
              loading={!stats}
              icon={<Search className="w-5 h-5 text-blue-500" />}
            />
            <QuickStat
              label="Communes"
              value={stats?.byType.communes}
              loading={!stats}
              icon={<Database className="w-5 h-5 text-emerald-500" />}
            />
            <QuickStat
              label="Villages"
              value={stats?.byType.villages}
              loading={!stats}
              icon={<Zap className="w-5 h-5 text-purple-500" />}
            />
            <QuickStat
              label="Total Units"
              value={stats?.total}
              loading={!stats}
              icon={<Search className="w-5 h-5 text-rose-500" />}
            />
          </div>
        </div>
      </section>

      {/* Modern Features Grid */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
            <div className="max-w-lg">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Engineered for <br />
                <span className="text-indigo-600">Performance.</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                We've handled the complexity of Cambodian administrative
                boundaries so you don't have to.
              </p>
            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Global Edge Network"
              description="Low-latency responses served directly from Cloudflare's global edge network."
              icon={<Zap className="w-6 h-6 text-amber-500" />}
            />
            <FeatureCard
              title="Bilingual Engine"
              description="Native support for Khmer and English search queries out of the box."
              icon={<Search className="w-6 h-6 text-indigo-500" />}
            />
            <FeatureCard
              title="Unified Schema"
              description="Standardized administrative codes make data mapping effortless across any system."
              icon={<Package className="w-6 h-6 text-emerald-500" />}
            />
          </div>
        </div>
      </section>

      {/* Simplified Motivation CTA */}
      <section className="py-24 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-700 to-purple-700 opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight">
            Built for developers, by developers.
          </h2>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Open source, free, and community-driven. Join us in building a
            better digital infrastructure for Cambodia.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/datasource"
              className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Download Full Dataset
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickStat({
  label,
  value,
  loading,
  icon,
}: {
  label: string;
  value?: number;
  loading: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="group">
      <div className="mb-4 p-3 bg-slate-50 rounded-xl w-fit group-hover:bg-indigo-50 transition-colors">
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">
        {loading ? (
          <div className="h-8 w-20 bg-slate-100 animate-pulse rounded" />
        ) : (
          value?.toLocaleString()
        )}
      </div>
      <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 group">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}
