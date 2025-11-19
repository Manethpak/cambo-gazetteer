export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-slate-600 mb-2">Built with ❤️ for Cambodia</p>
        <p className="text-sm text-slate-500">
          Licensed under MIT • Created by{" "}
          <a
            href="mailto:manethpak.dev@gmail.com"
            className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
          >
            Maneth PAK
          </a>
        </p>
      </div>
    </footer>
  );
}
