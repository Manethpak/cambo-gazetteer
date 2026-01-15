export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-bold text-slate-900">Cambo Gazetteer</span>
          </div>

          <p className="text-sm text-slate-500 font-medium text-center">
            Built with ❤️ for Cambodia • Licensed under MIT
          </p>

          <a
            href="mailto:manethpak.dev@gmail.com"
            className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
          >
            manethpak.dev@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
