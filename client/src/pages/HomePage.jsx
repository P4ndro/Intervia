import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { api } from '../api';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || 'candidate';

  // Redirect company users to company dashboard
  useEffect(() => {
    if (user?.role === 'company') {
      navigate('/company-dashboard', { replace: true });
    }
  }, [user?.role, navigate]);
  const [startingInterview, setStartingInterview] = useState(false);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Fetch jobs from API
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoadingJobs(true);
        const data = await api.listJobs();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setError(err.message || 'Failed to load jobs');
      } finally {
        setLoadingJobs(false);
      }
    }

    if (userRole === 'candidate') {
      fetchJobs();
    } else {
      setLoadingJobs(false);
    }
  }, [userRole]);

  // Candidate View
  if (userRole === 'candidate') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">
              Welcome back, {user?.email?.split('@')[0]}!
            </h1>
            <p className="text-black">Find your next opportunity</p>
          </div>

          <div className="mb-6">
            <button
              onClick={async () => {
                try {
                  setStartingInterview(true);
                  setError('');
                  const data = await api.startInterview();
                  navigate(`/interview/${data.interviewId}`);
                } catch (err) {
                  setError(err.message || 'Failed to start interview');
                  setStartingInterview(false);
                }
              }}
              disabled={startingInterview}
              className="inline-block px-6 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {startingInterview ? 'Starting...' : 'Start Interview'}
            </button>
            {error && (
              <p className="mt-2 text-black text-sm">{error}</p>
            )}
          </div>

          {loadingJobs ? (
            <div className="text-center py-12">
              <p className="text-black">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black">No jobs available at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Organization View
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Organization Dashboard
          </h1>
          <p className="text-black">Manage your hiring process</p>
        </div>

        <div className="bg-black rounded-lg shadow-xl p-6 border border-white mb-6">
          <p className="text-white mb-4">
            Access your company dashboard to manage jobs, view applicants, and analyze interview reports.
          </p>
          <Link
            to="/company-dashboard"
            className="inline-block px-6 py-3 bg-white hover:bg-gray-200 text-black font-medium rounded-lg transition-colors"
          >
            Go to Company Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

