import { Link } from "react-router-dom";
import { Search, Map, MoveLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div
        className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center py-10">
          {/* Large 404 Text */}
          <div className="relative inline-block mb-8">
            <h1 className="text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter">
              <span className="gradient-text premium-gradient">404</span>
            </h1>
            <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl -z-10 group-hover:bg-indigo-500/30 transition-all duration-700"></div>
          </div>

          <div className="space-y-6 mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
              Lost in the <br />
              <span className="text-indigo-400">Digital Void.</span>
            </h2>
            <p className="text-2xl md:text-3xl font-khmer text-slate-400 font-medium">
              អត់មានទំព័រនេះទេ ចូលច្រលំហើយ
            </p>
            <p className="text-slate-400 max-w-lg mx-auto leading-relaxed text-lg"></p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all hover:shadow-[0_0_50px_rgba(79,70,229,0.4)] active:scale-95 group"
            >
              <MoveLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              ទៅផ្ទះវិញ
            </Link>

            <div className="flex gap-4">
              <Link
                to="/explore"
                className="p-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 backdrop-blur-xl"
                title="Explore Units"
              >
                <Map className="size-6" />
              </Link>
              <Link
                to="/search"
                className="p-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 backdrop-blur-xl"
                title="Search Gazetteer"
              >
                <Search className="size-6" />
              </Link>
            </div>
          </div>

          {/* Quick Help */}
          <div className="mt-24 pt-10 border-t border-white/5">
            <p className="text-slate-500 font-medium">
              Need assistance? Explore our{" "}
              <Link
                to="/datasource"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                data sources
              </Link>{" "}
              or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
