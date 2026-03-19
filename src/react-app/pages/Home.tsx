import { Link } from "react-router-dom";
import { SearchBarWithAutocomplete } from "../components/SearchBarWithAutocomplete";
import { MapLibreMap } from "../components/MapLibreMap";
import { LocationInfo } from "../components/LocationInfo";
import { Database, Search, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { StatsResponse } from "../types";

export function Home() {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    fetch("/api/v1/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to fetch stats", err));
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-slate-950 overflow-hidden">
        {/* Background Ambient Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[160px] -mr-96 -mt-96"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] -ml-48 -mb-48"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid xl:grid-cols-5 gap-12 lg:gap-20 items-center">
            {/* Left Column: Text Content */}
            <div className="space-y-10 animate-fade-in col-span-2 py-12 lg:py-0">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-semibold backdrop-blur-xl">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  API v1.0 NOW LIVE
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.9]">
                  Cambo <br />
                  <span className="gradient-text premium-gradient">Gazetteer</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed font-medium">
                  The definitive open-source platform for Cambodia's administrative geolocation data and postal codes.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/explore"
                  className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-100 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95"
                >
                  Explore Data
                </Link>
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white/5 text-white rounded-2xl font-bold border border-white/10 hover:bg-white/10 transition-all active:scale-95 backdrop-blur-sm"
                >
                  Developer API
                </a>
              </div>
            </div>

            {/* Right Column: Hero Map */}
            <div className="relative group col-span-3 animate-slide-up">
              <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <MapLibreMap
                  height="550px"
                  zoom={6}
                  enableGeolocation={true}
                />
                <div className="absolute bottom-4 left-4 z-10 w-full max-w-xs sm:max-w-sm">
                  <LocationInfo />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Search Section */}
      <section className="relative -mt-10 z-20 px-4 mb-20 md:mb-32">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-2xl p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-200/50">
            <SearchBarWithAutocomplete />
          </div>
          <p className="text-center text-slate-500 mt-4 text-sm font-medium">
            Search 16,457 provinces, districts, communes, and villages instantly.
          </p>
        </div>
      </section>

      {/* Simplified Stats Section */}
      <section className="py-12 border-b border-slate-100 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-evenly items-center gap-8 md:gap-12 opacity-80">
            <div className="text-xs font-bold text-slate-  uppercase tracking-widest">Live Data Summary</div>
            <div className="flex flex-wrap gap-12 md:gap-16">
              <SimpleStat label="Municipality" label_kh="រាជធានី" value={stats?.byType.municipalities} />
              <SimpleStat label="Provinces" label_kh="ខេត្ត/ក្រុង" value={stats?.byType.provinces} />
              <SimpleStat label="Districts" label_kh="ខណ្ឌ/ស្រុក" value={stats?.byType.districts} />
              <SimpleStat label="Communes" label_kh="ឃុំ/សង្កាត់" value={stats?.byType.communes} />
              <SimpleStat label="Villages" label_kh="ភូមិ" value={stats?.byType.villages} />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Impact Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-8 tracking-tight">
              Building Cambodia's <br />
              <span className="text-indigo-600">Digital Commons.</span>
            </h2>
            <p className="text-slate-600 text-xl md:text-2xl leading-relaxed font-medium max-w-2xl">
              Cambo Gazetteer is a community-driven initiative to make administrative geographic data accessible, free, and accurate for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            <MissionCard
              title="100% Free & Open"
              description="No trackers, no licenses, no paywalls. The data belongs to the public and is free for anyone to use, forever."
              icon={<Database className="w-6 h-6 text-indigo-500" />}
            />
            <MissionCard
              title="Khmer Heritage"
              description="Built with a focus on bilingual accuracy, ensuring Khmer typography and naming conventions are preserved."
              icon={<Search className="w-6 h-6 text-indigo-500" />}
            />
            <MissionCard
              title="Community Verified"
              description="Our data is continuously updated and verified by community contributors to ensure maximum reliability."
              icon={<Package className="w-6 h-6 text-indigo-500" />}
            />
          </div>
        </div>
      </section>

      {/* Community / GitHub Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-slate-200 shadow-sm overflow-hidden relative group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-colors"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl text-center lg:text-left">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                  Help us map Cambodia.
                </h2>
                <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed">
                  Spotted an error? Have more data? Cambo Gazetteer is maintained on GitHub. Your contributions help make this project better for everyone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  to="/datasource"
                  className="px-10 py-5 bg-slate-950 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all text-center"
                >
                  Download Data
                </Link>
                <a
                  href="https://github.com/manethpak/cambo-gazetteer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all text-center"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SimpleStat({ label, label_kh, value }: { label: string; label_kh?: string, value?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-2xl font-black text-slate-900 tracking-tight">
        {value === undefined ? (
          <div className="h-8 w-12 bg-slate-100 animate-pulse rounded" />
        ) : (
          value.toLocaleString()
        )}
      </div>
      <div className="space-y-2">
      <div className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none">{label}</div>
      {label_kh && <div className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none">{label_kh}</div>}
      </div>
    </div>
  );
}

function MissionCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-950">{title}</h3>
      <p className="text-slate-600 leading-relaxed font-medium text-lg">
        {description}
      </p>
    </div>
  );
}
