import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            <span className="text-emerald-400">FailProof</span>
          </h1>
          <p className="text-2xl text-slate-300 mb-2 font-semibold">
            AI-powered Interview Analysis
          </p>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Master your interviews with real-time AI feedback. Identify failure modes, improve your answers, and land your dream job.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-medium rounded-lg transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white text-lg font-medium rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Demo Placeholder */}
        <div className="mt-16 bg-slate-800 border border-slate-700 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-4 text-center">See It In Action</h2>
          <div className="bg-slate-900 rounded-lg p-12 border border-slate-700 text-center">
            <p className="text-slate-400">Demo video placeholder - Add your demo here</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">Identify Failure Modes</h3>
            <p className="text-slate-400">
              Get instant feedback on filler words, answer structure, and communication patterns.
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Detailed Analytics</h3>
            <p className="text-slate-400">
              Visualize your performance with charts and metrics to track improvement over time.
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Questions</h3>
            <p className="text-slate-400">
              Practice with AI-generated interview questions tailored to your role and industry.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-500">
          FailProof - Master your interviews with AI
        </div>
      </footer>
    </div>
  );
}

