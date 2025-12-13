import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';
import { api } from '../api';

export default function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: reportId } = useParams();
  
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        if (reportId) {
          // Fetch specific report
          const reportData = await api.getReport(reportId);
          const formattedReport = formatReportForUI(reportData);
          setSelectedReport(formattedReport);
          setReports([formattedReport]);
        } else {
          // Fetch list of all interviews/reports
          const interviewsData = await api.listInterviews();
          const interviews = interviewsData.interviews || [];
          
          // Filter to only completed ones and format for UI
          const formattedReports = interviews
            .filter(i => i.status === 'completed')
            .map((i, index) => formatInterviewListForUI(i, index));
          
          setReports(formattedReports);
          if (formattedReports.length > 0) {
            setSelectedReport(formattedReports[0]);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [reportId]);

  function formatReportForUI(data) {
    const report = data.report || {};
    return {
      id: data.interviewId,
      date: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : 'N/A',
      company: data.companyName || 'Practice Interview',
      position: data.jobTitle || 'General',
      level: 'Mid',
      overallScore: report.overallScore || 0,
      technicalScore: report.technicalScore || null,
      behavioralScore: report.behavioralScore || null,
      readinessBand: report.readinessBand || 'N/A',
      duration: data.completedAt && data.createdAt 
        ? `${Math.round((new Date(data.completedAt) - new Date(data.createdAt)) / 60000)} min`
        : 'N/A',
      status: data.status || 'completed',
      primaryBlockers: report.primaryBlockers || [],
      metrics: {
        answerLength: report.metrics?.averageAnswerLength || 0,
        questionsAnswered: report.metrics?.questionsAnswered || 0,
        questionsSkipped: report.metrics?.questionsSkipped || 0,
        totalQuestions: report.metrics?.totalQuestions || 0
      },
      strengths: report.strengths || ['Participated in interview'],
      recommendations: report.recommendations || ['Keep practicing'],
    };
  }

  function formatInterviewListForUI(interview, index) {
    return {
      id: interview.interviewId,
      date: interview.createdAt ? new Date(interview.createdAt).toISOString().split('T')[0] : 'N/A',
      company: interview.companyName || 'Practice Interview',
      position: interview.jobTitle || 'General',
      level: 'Mid',
      overallScore: interview.overallScore || 0,
      technicalScore: interview.technicalScore || null,
      behavioralScore: interview.behavioralScore || null,
      readinessBand: interview.readinessBand || 'N/A',
      duration: interview.durationMinutes ? `${interview.durationMinutes} min` : 'N/A',
      status: interview.status || 'completed',
      primaryBlockers: [],
      metrics: {
        answerLength: 0,
        questionsAnswered: interview.answersCount || 0,
        questionsSkipped: 0,
        totalQuestions: interview.questionsCount || 0
      },
      strengths: [],
      recommendations: []
    };
  }

  const handleSelectReport = async (report) => {
    // If we don't have full details, fetch them
    if (report.primaryBlockers.length === 0 && report.strengths.length === 0) {
      try {
        const fullReport = await api.getReport(report.id);
        const formatted = formatReportForUI(fullReport);
        setSelectedReport(formatted);
        setReports(prev => prev.map(r => r.id === report.id ? formatted : r));
      } catch (err) {
        console.error('Failed to load report details:', err);
        setSelectedReport(report);
      }
    } else {
      setSelectedReport(report);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
      case 'medium': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' };
      case 'low': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error && !selectedReport) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Reports Yet</h2>
            <p className="text-gray-600 mb-8">Complete an interview to see your report here.</p>
            <Link
              to="/interview"
              className="inline-block px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              Start Practice Interview
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Reports</h1>
          <p className="text-lg text-gray-600">Review your performance and improve your skills</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Reports ({reports.length})</h2>
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleSelectReport(report)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedReport?.id === report.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{report.position}</h3>
                    <span className={`text-lg font-bold ${getScoreColor(report.overallScore)}`}>
                      {report.overallScore}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{report.company}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📅 {report.date}</span>
                    <span>⏱️ {report.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Details */}
          {selectedReport && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedReport.position}</h2>
                    <p className="text-gray-600">{selectedReport.company}</p>
                  </div>
                  <div className={`text-4xl font-bold ${getScoreColor(selectedReport.overallScore)}`}>
                    {selectedReport.overallScore}%
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                    <div className={`text-2xl font-bold ${getScoreColor(selectedReport.overallScore)} mb-1`}>
                      {selectedReport.overallScore}%
                    </div>
                    <div className="text-xs text-gray-600">Overall</div>
                  </div>
                  {selectedReport.technicalScore !== null && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                      <div className={`text-2xl font-bold ${getScoreColor(selectedReport.technicalScore)} mb-1`}>
                        {selectedReport.technicalScore}%
                      </div>
                      <div className="text-xs text-gray-600">Technical</div>
                    </div>
                  )}
                  {selectedReport.behavioralScore !== null && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                      <div className={`text-2xl font-bold ${getScoreColor(selectedReport.behavioralScore)} mb-1`}>
                        {selectedReport.behavioralScore}%
                      </div>
                      <div className="text-xs text-gray-600">Behavioral</div>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedReport.metrics.questionsAnswered}/{selectedReport.metrics.totalQuestions}
                    </div>
                    <div className="text-xs text-gray-600">Answered</div>
                  </div>
                </div>

                {/* Primary Blockers */}
                {selectedReport.primaryBlockers && selectedReport.primaryBlockers.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Blockers</h3>
                    <div className="space-y-3">
                      {selectedReport.primaryBlockers.map((blocker, index) => {
                        const colors = getSeverityColor(blocker.severity);
                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">
                                  {blocker.questionText?.substring(0, 80)}...
                                </h4>
                                <p className="text-sm text-gray-600">{blocker.issue}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase bg-white ${colors.text}`}>
                                {blocker.severity}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Strengths & Recommendations */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-700 mb-4">Strengths</h3>
                    <ul className="space-y-2">
                      {selectedReport.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-green-800">
                          <span className="text-green-600">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-700 mb-4">Recommendations</h3>
                    <ul className="space-y-2">
                      {selectedReport.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-blue-800">
                          <span className="text-blue-600">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-4">
                  <Link
                    to="/interview"
                    className="flex-1 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-center"
                  >
                    Practice Again
                  </Link>
                  <Link
                    to="/home"
                    className="flex-1 px-6 py-3 bg-white text-black border-2 border-black rounded-md hover:bg-gray-50 transition-colors font-medium text-center"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
