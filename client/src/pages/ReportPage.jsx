import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReportCard from '../components/ReportCard';
import { api } from '../api';

export default function ReportPage() {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const data = await api.getReport(interviewId);
        setReportData(data);
      } catch (err) {
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    }

    if (interviewId) {
      fetchReport();
    }
  }, [interviewId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700 text-center">
            <p className="text-slate-400">Loading report...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  const report = reportData?.report || {};
  const metrics = report.metrics || {};
  const primaryBlockers = report.primaryBlockers || [];
  const strengths = report.strengths || [];
  const areasForImprovement = report.areasForImprovement || [];
  const recommendations = report.recommendations || [];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Interview Report</h1>
            <p className="text-slate-400">
              {reportData?.status === 'completed' ? 'Completed' : 'In Progress'} • {' '}
              {reportData?.createdAt && new Date(reportData.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Link
            to="/home"
            className="px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-md transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Overall Score Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <ReportCard
            title="Overall Score"
            value={`${report.overallScore || 0}%`}
            description="Weighted average of all responses"
          />
          <ReportCard
            title="Technical Score"
            value={report.technicalScore !== null ? `${report.technicalScore}%` : 'N/A'}
            description="Technical question performance"
          />
          <ReportCard
            title="Behavioral Score"
            value={report.behavioralScore !== null ? `${report.behavioralScore}%` : 'N/A'}
            description="Behavioral question performance"
          />
        </div>

        {/* Metrics Row */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <ReportCard
            title="Avg Answer Length"
            value={`${metrics.averageAnswerLength || 0} words`}
            description="Average words per answer"
          />
          <ReportCard
            title="Questions Answered"
            value={metrics.questionsAnswered || 0}
            description={`of ${metrics.totalQuestions || reportData?.questions?.length || 0} total`}
          />
          <ReportCard
            title="Questions Skipped"
            value={metrics.questionsSkipped || 0}
            description="Skipped questions"
          />
        </div>

        {/* Primary Blockers */}
        {primaryBlockers.length > 0 && (
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Primary Blockers</h2>
            <p className="text-slate-400 text-sm mb-4">
              These areas held your readiness back the most. Focus on these in your next practice session.
            </p>
            <div className="space-y-3">
            {primaryBlockers.map((blocker, index) => (
              <div
                key={index}
                className={`p-4 rounded-md border ${getSeverityColor(blocker.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{blocker.issue}</h3>
                      {blocker.questionType && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          blocker.questionType === 'technical' 
                            ? 'bg-blue-900/50 text-blue-400' 
                            : 'bg-emerald-900/50 text-emerald-400'
                        }`}>
                          {blocker.questionType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm opacity-80">Question: "{blocker.questionText}"</p>
                    {blocker.impact && (
                      <p className="text-xs mt-1 opacity-60">{blocker.impact}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium uppercase px-2 py-1 rounded bg-slate-900/50 ml-2">
                    {blocker.severity}
                  </span>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}

        {/* Answers Review */}
        {reportData?.answers && reportData.answers.length > 0 && (
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Your Answers</h2>
            <div className="space-y-4">
              {reportData.questions?.map((question, index) => {
                const answer = reportData.answers.find(a => a.questionId === question.id);
                return (
                  <div key={question.id} className="p-4 bg-slate-900 rounded-md border border-slate-700">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium">Q{index + 1}: {question.text}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        question.type === 'technical' 
                          ? 'bg-blue-900/50 text-blue-400' 
                          : 'bg-emerald-900/50 text-emerald-400'
                      }`}>
                        {question.type}
                      </span>
                    </div>
                    {answer ? (
                      answer.skipped ? (
                        <p className="text-yellow-400 italic">Skipped</p>
                      ) : (
                        <p className="text-slate-300">{answer.transcript || 'No answer provided'}</p>
                      )
                    ) : (
                      <p className="text-slate-500 italic">Not answered</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strengths & Recommendations */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Strengths</h2>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((strength, index) => (
                  <li key={index} className="text-slate-300 flex items-start">
                    <span className="text-emerald-400 mr-2">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">Complete more questions to see strengths</p>
            )}
          </div>

          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Areas for Improvement</h2>
            {areasForImprovement.length > 0 ? (
              <ul className="space-y-2">
                {areasForImprovement.map((area, index) => (
                  <li key={index} className="text-slate-300 flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">Great job! Keep practicing</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Recommendations</h2>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-slate-300 flex items-start">
                  <span className="text-blue-400 mr-2">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Link
            to="/home"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
          >
            Start New Interview
          </Link>
          <Link
            to="/profile"
            className="px-6 py-3 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-lg transition-colors"
          >
            View Profile
          </Link>
        </div>
      </main>
    </div>
  );
}
