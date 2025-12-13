import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // TODO: Get role from user object or context when backend is integrated
  const [userRole] = useState(localStorage.getItem('userRole') || 'candidate');

  // Mock job data - replace with actual API calls
  const jobs = [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      type: 'Full-time',
      posted: '2 days ago',
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'StartupXYZ',
      location: 'San Francisco, CA',
      type: 'Full-time',
      posted: '5 days ago',
    },
    {
      id: 3,
      title: 'Backend Engineer',
      company: 'Cloud Services Inc',
      location: 'New York, NY',
      type: 'Contract',
      posted: '1 week ago',
    },
  ];

  // Candidate View
  if (userRole === 'candidate') {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.email?.split('@')[0]}!
            </h1>
            <p className="text-slate-400">Find your next opportunity</p>
          </div>

          <div className="mb-6">
            <Link
              to="/interview"
              className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
            >
              Start Interview
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">No jobs available at the moment.</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Organization View
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Organization Dashboard
          </h1>
          <p className="text-slate-400">Manage your hiring process</p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-6">
          <p className="text-slate-300 mb-4">
            Access your company dashboard to manage jobs, view applicants, and analyze interview reports.
          </p>
          <Link
            to="/company-dashboard"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
          >
            Go to Company Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

