import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReportCard from '../components/ReportCard';
import PlaceholderChart from '../components/PlaceholderChart';

export default function ReportPage() {
  // Mock report data - replace with actual API calls
  const [report] = useState({
    overallScore: 78,
    failureModes: [
      { mode: 'Filler Words', count: 23, severity: 'high' },
      { mode: 'Answer Length', issues: 'Too short', severity: 'medium' },
      { mode: 'Structure', issues: 'Lacks clear organization', severity: 'medium' },
      { mode: 'Eye Contact', issues: 'Looking away frequently', severity: 'low' },
      { mode: 'Pause Frequency', count: 15, severity: 'high' },
    ],
    metrics: {
      answerLength: 145, // words
      fillerWords: 23,
      pauses: 15,
      structureScore: 6.5,
    },
    strengths: [
      'Strong technical knowledge',
      'Clear communication when focused',
      'Good problem-solving approach',
    ],
    areasForImprovement: [
      'Reduce filler words (um, uh, like)',
      'Provide more detailed examples',
      'Improve answer structure and organization',
    ],
    recommendations: [
      'Practice speaking without filler words',
      'Structure answers: Situation, Task, Action, Result (STAR method)',
      'Work on maintaining eye contact',
    ],
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-900/20 border-red-800';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'low':
        return 'text-blue-400 bg-blue-900/20 border-blue-800';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Interview Report</h1>
          <p className="text-slate-400">Your performance analysis and failure modes</p>
        </div>

        {/* Overall Score Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <ReportCard
            title="Overall Score"
            value={`${report.overallScore}%`}
            description="Based on your interview performance"
          />
          <ReportCard
            title="Answer Length"
            value={`${report.metrics.answerLength} words`}
            description="Average words per answer"
          />
          <ReportCard
            title="Filler Words"
            value={report.metrics.fillerWords}
            description="Instances detected"
          />
          <ReportCard
            title="Structure Score"
            value={`${report.metrics.structureScore}/10`}
            description="Answer organization quality"
          />
        </div>

        {/* Failure Modes List */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Failure Modes Detected</h2>
          <div className="space-y-3">
            {report.failureModes.map((mode, index) => (
              <div
                key={index}
                className={`p-4 rounded-md border ${getSeverityColor(mode.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">{mode.mode}</h3>
                    {mode.count && <p className="text-sm">Count: {mode.count}</p>}
                    {mode.issues && <p className="text-sm">{mode.issues}</p>}
                  </div>
                  <span className="text-xs font-medium uppercase px-2 py-1 rounded bg-slate-900/50">
                    {mode.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Answer Length Analysis</h2>
            <PlaceholderChart />
            <p className="text-xs text-slate-400 mt-2">Words per answer over time</p>
          </div>
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Filler Words Trend</h2>
            <PlaceholderChart />
            <p className="text-xs text-slate-400 mt-2">Filler word frequency by question</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Answer Structure Analysis</h2>
          <PlaceholderChart />
          <p className="text-xs text-slate-400 mt-2">Structure quality score per answer</p>
        </div>

        {/* Practice Areas */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Practice Areas</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {report.areasForImprovement.map((area, index) => (
              <Link
                key={index}
                to="/interview"
                className="p-4 bg-slate-900 rounded-md border border-slate-700 hover:border-emerald-500 transition-colors"
              >
                <h3 className="text-white font-medium mb-2">{area.split(':')[0]}</h3>
                <p className="text-sm text-slate-400">Practice this area →</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Strengths & Recommendations */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Strengths</h2>
            <ul className="space-y-2">
              {report.strengths.map((strength, index) => (
                <li key={index} className="text-slate-300 flex items-start">
                  <span className="text-emerald-400 mr-2">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Recommendations</h2>
            <ul className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="text-slate-300 flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

