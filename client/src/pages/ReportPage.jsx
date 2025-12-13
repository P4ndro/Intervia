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
        return 'text-white bg-black border-white';
      case 'medium':
        return 'text-white bg-black border-white';
      case 'low':
        return 'text-white bg-black border-white';
      default:
        return 'text-white bg-black border-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-black rounded-lg shadow-xl p-8 border border-white text-center">
            <p className="text-white">Loading report...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-black rounded-lg shadow-xl p-8 border border-white text-center">
            <p className="text-white mb-4">{error}</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-lg transition-colors"
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
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Interview Report</h1>
            <p className="text-black">
              {reportData?.status === 'completed' ? 'Completed' : 'In Progress'} • {' '}
              {reportData?.createdAt && new Date(reportData.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Link
            to="/home"
            className="px-4 py-2 border border-black hover:border-gray-600 text-black hover:text-gray-600 font-medium rounded-md transition-colors"
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
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Primary Blockers</h2>
            <p className="text-white text-sm mb-4">
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
                      <h3 className="font-semibold text-white">{blocker.issue}</h3>
                      {blocker.questionType && (
                        <span className="text-xs px-2 py-0.5 rounded bg-white text-black">
                          {blocker.questionType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white opacity-80">Question: "{blocker.questionText}"</p>
                    {blocker.impact && (
                      <p className="text-xs mt-1 text-white opacity-60">{blocker.impact}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium uppercase px-2 py-1 rounded bg-white text-black ml-2">
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
            <h2 className="text-xl font-semibold text-white mb-4">Your Answers & Evaluations</h2>
            <div className="space-y-6">
              {reportData.questions?.map((question, index) => {
                const answer = reportData.answers.find(a => a.questionId === question.id);
                const evaluation = answer?.aiEvaluation;
                
                return (
                  <div key={question.id} className="p-5 bg-slate-900 rounded-md border border-slate-700">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-medium text-lg">Q{index + 1}: {question.text}</h3>
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
                        <p className="text-white italic">Skipped</p>
                      ) : (
                        <>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-slate-400 mb-2">Your Answer:</h4>
                            <p className="text-slate-300 whitespace-pre-wrap">{answer.transcript || 'No answer provided'}</p>
                          </div>
                          
                          {evaluation ? (
                            <div className="mt-4 pt-4 border-t border-slate-700">
                              <h4 className="text-sm font-medium text-slate-400 mb-3">AI Evaluation:</h4>
                              
                              {/* Scores Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                <div className="bg-slate-800 rounded p-2 border border-slate-700">
                                  <div className="text-xs text-slate-500 mb-1">Relevance</div>
                                  <div className="text-lg font-semibold text-white">{evaluation.relevanceScore || 0}/100</div>
                                </div>
                                <div className="bg-slate-800 rounded p-2 border border-slate-700">
                                  <div className="text-xs text-slate-500 mb-1">Clarity</div>
                                  <div className="text-lg font-semibold text-white">{evaluation.clarityScore || 0}/100</div>
                                </div>
                                <div className="bg-slate-800 rounded p-2 border border-slate-700">
                                  <div className="text-xs text-slate-500 mb-1">Depth</div>
                                  <div className="text-lg font-semibold text-white">{evaluation.depthScore || 0}/100</div>
                                </div>
                                {evaluation.technicalAccuracy !== null && evaluation.technicalAccuracy !== undefined && (
                                  <div className="bg-slate-800 rounded p-2 border border-slate-700">
                                    <div className="text-xs text-slate-500 mb-1">Technical</div>
                                    <div className="text-lg font-semibold text-white">{evaluation.technicalAccuracy}/100</div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Detailed Feedback */}
                              {evaluation.feedback && (
                                <div className="mb-4">
                                  <h5 className="text-sm font-medium text-slate-400 mb-2">Detailed Feedback:</h5>
                                  <div 
                                    className="text-slate-300 prose prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ 
                                      __html: evaluation.feedback
                                        .replace(/\n/g, '<br />')
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                    }}
                                  />
                                </div>
                              )}
                              
                              {/* Strengths */}
                              {evaluation.strengths && evaluation.strengths.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="text-sm font-medium text-emerald-400 mb-2">Strengths:</h5>
                                  <ul className="list-disc list-inside space-y-1">
                                    {evaluation.strengths.map((strength, idx) => (
                                      <li key={idx} className="text-slate-300 text-sm">{strength}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Detected Issues */}
                              {evaluation.detectedIssues && evaluation.detectedIssues.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="text-sm font-medium text-yellow-400 mb-2">Areas to Improve:</h5>
                                  <ul className="list-disc list-inside space-y-1">
                                    {evaluation.detectedIssues.map((issue, idx) => (
                                      <li key={idx} className="text-slate-300 text-sm">{issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Keywords */}
                              {evaluation.keywords && evaluation.keywords.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-slate-400 mb-2">Key Topics Mentioned:</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {evaluation.keywords.map((keyword, idx) => (
                                      <span key={idx} className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mt-4 pt-4 border-t border-slate-700">
                              <p className="text-slate-500 italic text-sm">Evaluation pending...</p>
                            </div>
                          )}
                        </>
                      )
                    ) : (
                      <p className="text-white italic">Not answered</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strengths & Recommendations */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
            <h2 className="text-xl font-semibold text-white mb-4">Strengths</h2>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((strength, index) => (
                  <li key={index} className="text-white flex items-start">
                    <span className="text-white mr-2">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white italic">Complete more questions to see strengths</p>
            )}
          </div>

          <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
            <h2 className="text-xl font-semibold text-white mb-4">Areas for Improvement</h2>
            {areasForImprovement.length > 0 ? (
              <ul className="space-y-2">
                {areasForImprovement.map((area, index) => (
                  <li key={index} className="text-white flex items-start">
                    <span className="text-white mr-2">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white italic">Great job! Keep practicing</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Recommendations</h2>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-white flex items-start">
                  <span className="text-white mr-2">→</span>
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
            className="px-6 py-3 bg-white hover:bg-gray-200 text-black font-medium rounded-lg transition-colors"
          >
            Start New Interview
          </Link>
          <Link
            to="/profile"
            className="px-6 py-3 border border-black hover:border-gray-600 text-black hover:text-gray-600 font-medium rounded-lg transition-colors"
          >
            View Profile
          </Link>
        </div>
      </main>
    </div>
  );
}
