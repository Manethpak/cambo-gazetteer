function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-900">
            Cambodia Gazetteer
          </h1>
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
