import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { api } from '../api';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingInterview, setStartingInterview] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsData, statsData] = await Promise.all([
          api.listJobs(),
          api.getMyStats(),
        ]);
        setJobs(jobsData.jobs || []);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleStartPractice = async () => {
    try {
      setStartingInterview(true);
      setError('');
      const data = await api.startInterview();
      if (data && data.interviewId) {
        navigate(`/interview/${data.interviewId}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError(err.message || 'Failed to start interview. Please try again.');
      setStartingInterview(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-lg text-gray-600">
            Practice interviews and improve your skills with AI-powered feedback.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Start Practice Interview Card */}
          <div className="bg-white rounded-lg p-8 shadow-sm border-2 border-gray-200 hover:border-black transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎤</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Practice Interview</h3>
                <p className="text-gray-600">Start a mock interview session</p>
              </div>
            </div>
            <button
              onClick={handleStartPractice}
              disabled={startingInterview}
              className="w-full px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {startingInterview ? 'Starting...' : 'Start Practice Interview'}
            </button>
          </div>

          {/* View Reports Card */}
          <div className="bg-white rounded-lg p-8 shadow-sm border-2 border-gray-200 hover:border-black transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">View Reports</h3>
                <p className="text-gray-600">Check your interview performance</p>
              </div>
            </div>
            <Link
              to="/report"
              className="block w-full text-center px-6 py-3 bg-white text-black border-2 border-black rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              View All Reports
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.completedInterviews || 0}
              </div>
              <div className="text-gray-600">Completed Interviews</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.averageScore ? `${stats.averageScore}%` : 'N/A'}
              </div>
              <div className="text-gray-600">Average Score</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalPracticeTime || '0m'}
              </div>
              <div className="text-gray-600">Practice Time</div>
            </div>
          </div>
        )}

        {/* Available Jobs Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Available Jobs</h2>
            <span className="text-gray-600">{jobs.length} jobs available</span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">No jobs available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
