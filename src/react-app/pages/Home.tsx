import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { Map, Database, Zap, Search } from "lucide-react";
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
      <section className="relative bg-slate-900 text-white py-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] mix-blend-screen"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Open Source API v1.0
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">
              Cambodia's Modern <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient bg-300%">
                Geographical Data
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto">
              The most comprehensive, open-source API for Cambodia. Access
              provinces, districts, communes, and villages with
              developer-friendly tools.
            </p>

            <div className="max-w-2xl mx-auto mb-12 transform hover:scale-[1.01] transition-transform duration-300">
              <SearchBar onSearch={handleSearch} />
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/provinces"
                className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-indigo-50 transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 hover:pointer"
              >
                Browse Provinces
              </Link>
              <a
                href="/api/docs"
                target="_blank"
                className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all border border-slate-700 hover:border-slate-600 active:scale-95"
              >
                Read Documentation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200 rounded-full blur-3xl mix-blend-multiply"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to build
            </h2>
            <p className="text-lg text-slate-600">
              A complete toolkit for handling Cambodian geographical data,
              designed for modern development workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-amber-500" />}
              title="Lightning Fast"
              description="Powered by Cloudflare Workers, delivering JSON responses in milliseconds from the edge."
              delay={0}
            />
            <FeatureCard
              icon={<Database className="w-6 h-6 text-blue-500" />}
              title="Complete Dataset"
              description="Access over 16,000 administrative units, from provinces down to the village level."
              delay={100}
            />
            <FeatureCard
              icon={<Map className="w-6 h-6 text-emerald-500" />}
              title="Smart Hierarchy"
              description="Traverse the administrative tree with ease using our parent-child relationship model."
              delay={200}
            />
            <FeatureCard
              icon={<Search className="w-6 h-6 text-indigo-500" />}
              title="Bilingual Search"
              description="Powerful full-text search functionality across the entire dataset, with seamless support for both Khmer and English."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Why I'm Building This Section */}
      <section className="py-24 bg-slate-50 relative">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl mix-blend-multiply"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            {/* Left Column: Headline & Impact */}
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                The Motivation
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-[1.1]">
                Building the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  missing piece
                </span>{" "}
                of Cambodia's digital infrastructure.
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Reliable geographical data shouldn't be a luxury. It's a
                fundamental building block for modern applications, yet it has
                been surprisingly hard to access—until now.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4 border-t border-slate-200 pt-8">
                <MotivationStat
                  label="Total Units"
                  value={stats?.total}
                  loading={!stats}
                />
                <MotivationStat
                  label="Capital"
                  value={stats?.byType.municipalities}
                  loading={!stats}
                />
                <MotivationStat
                  label="Provinces"
                  value={stats?.byType.provinces}
                  loading={!stats}
                />
                <MotivationStat
                  label="Districts"
                  value={stats?.byType.districts}
                  loading={!stats}
                />
                <MotivationStat
                  label="Communes"
                  value={stats?.byType.communes}
                  loading={!stats}
                />
                <MotivationStat
                  label="Villages"
                  value={stats?.byType.villages}
                  loading={!stats}
                />
              </div>
            </div>

            {/* Right Column: The Story */}
            <div className="lg:w-1/2 w-full">
              <div className="relative">
                {/* Quote Icon */}
                <div className="absolute -top-6 -left-6 text-6xl text-indigo-100 font-serif leading-none select-none">
                  "
                </div>

                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 relative z-10">
                  <p className="text-slate-700 mb-6 leading-relaxed text-lg">
                    As a developer, I've lost count of how many times I've
                    needed a simple, clean list of Cambodian provinces or
                    districts, only to find broken links, outdated PDFs, or
                    expensive enterprise APIs.
                  </p>
                  <p className="text-slate-700 mb-8 leading-relaxed text-lg">
                    I realized that if I was struggling with this, thousands of
                    other developers were too. Innovation shouldn't be stifled
                    by a lack of basic data. That's why I built this
                    Gazetteer—to provide a free, fast, and reliable standard for
                    everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="group p-8 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 group-hover:scale-110 transition-all duration-300 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function MotivationStat({
  label,
  value,
  loading,
}: {
  label: string;
  value?: number;
  loading: boolean;
}) {
  return (
    <div>
      <div className="text-3xl font-bold text-slate-900 mb-1">
        {loading ? (
          <div className="h-9 w-16 bg-slate-200 rounded animate-pulse"></div>
        ) : (
          value?.toLocaleString()
        )}
      </div>
      <div className="text-sm text-slate-500 font-medium">{label}</div>
    </div>
  );
}
