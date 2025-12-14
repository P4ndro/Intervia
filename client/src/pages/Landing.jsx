import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-white">
          Intervia
        </div>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Welcome to <span className="text-emerald-400">Intervia</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Your AI-powered holiday companion. Build something magical with modern web technologies.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-medium rounded-lg transition-colors"
            >
              Start Building
            </Link>
            <a
              href="https://github.com/P4ndro/Santa-Claude"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white text-lg font-medium rounded-lg transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-white mb-2">Secure Auth</h3>
            <p className="text-slate-400">
              JWT authentication with refresh tokens. HttpOnly cookies for maximum security.
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Ready</h3>
            <p className="text-slate-400">
              Provider-agnostic AI layer. Easily integrate OpenAI, Claude, or Gemini.
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">Modern Stack</h3>
            <p className="text-slate-400">
              React + Vite frontend. Express + MongoDB backend. Tailwind CSS styling.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-500">
          Built with ❤️ for the holidays
        </div>
      </footer>
    </div>
  );
}

