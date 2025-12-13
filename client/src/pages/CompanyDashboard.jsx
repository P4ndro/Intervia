import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PlaceholderChart from '../components/PlaceholderChart';
import { api } from '../api';

export default function CompanyDashboard() {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    activePositions: 0,
    candidatesThisMonth: 0,
  });

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', description: '', location: '', type: 'full-time' });

  const recentCandidates = [
    { id: 1, name: 'John Doe', position: 'Software Engineer', score: 85, date: '2024-01-15', jobId: 1 },
    { id: 2, name: 'Jane Smith', position: 'Frontend Developer', score: 92, date: '2024-01-14', jobId: 2 },
    { id: 3, name: 'Bob Johnson', position: 'Backend Engineer', score: 76, date: '2024-01-13', jobId: 3 },
  ];

  // Common failure modes analytics - TODO: Replace with actual analytics from backend
  const commonFailureModes = [
    { mode: 'Filler Words', count: 45, percentage: 36 },
    { mode: 'Answer Length', count: 32, percentage: 26 },
    { mode: 'Structure Issues', count: 28, percentage: 23 },
    { mode: 'Eye Contact', count: 15, percentage: 12 },
  ];

  // Fetch jobs on mount
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoadingJobs(true);
        setError('');
        const data = await api.listJobs();
        setJobs(data.jobs || []);
        // Update stats based on fetched jobs
        setStats(prev => ({
          ...prev,
          activePositions: data.jobs?.length || 0,
        }));
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setError(err.message || 'Failed to load jobs');
      } finally {
        setLoadingJobs(false);
      }
    }
    fetchJobs();
  }, []);

  const handleAddJob = async () => {
    try {
      setError('');
      const newJob = await api.createJob({
        title: jobForm.title,
        description: jobForm.description,
        location: jobForm.location,
        type: jobForm.type,
      });
      setJobs([...jobs, newJob]);
      setJobForm({ title: '', description: '', location: '', type: 'full-time' });
      setShowJobForm(false);
      // Update stats
      setStats(prev => ({
        ...prev,
        activePositions: prev.activePositions + 1,
      }));
    } catch (err) {
      setError(err.message || 'Failed to create job');
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobForm({ 
      title: job.title, 
      description: job.description || '',
      location: job.location || '',
      type: job.type || 'full-time',
    });
    setShowJobForm(true);
  };

  const handleUpdateJob = async () => {
    try {
      setError('');
      const updatedJob = await api.updateJob(editingJob.id, {
        title: jobForm.title,
        description: jobForm.description,
        location: jobForm.location,
        type: jobForm.type,
      });
      setJobs(jobs.map(job => 
        job.id === editingJob.id ? updatedJob : job
      ));
      setEditingJob(null);
      setJobForm({ title: '', description: '', location: '', type: 'full-time' });
      setShowJobForm(false);
    } catch (err) {
      setError(err.message || 'Failed to update job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        setError('');
        await api.deleteJob(jobId);
        setJobs(jobs.filter(job => job.id !== jobId));
        // Update stats
        setStats(prev => ({
          ...prev,
          activePositions: Math.max(0, prev.activePositions - 1),
        }));
      } catch (err) {
        setError(err.message || 'Failed to delete job');
      }
    }
  };

  const handleViewApplicants = (jobId) => {
    // TODO: Navigate to applicants list for this job
    console.log('View applicants for job:', jobId);
  };

  const handleViewReport = (candidateId) => {
    // TODO: Navigate to candidate report
    console.log('View report for candidate:', candidateId);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Company Dashboard</h1>
          <p className="text-black">Overview of your hiring process</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
            <p className="text-white text-sm mb-1">Total Interviews</p>
            <p className="text-3xl font-bold text-white">{stats.totalInterviews}</p>
          </div>
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
            <p className="text-white text-sm mb-1">Average Score</p>
            <p className="text-3xl font-bold text-white">{stats.averageScore}%</p>
          </div>
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
            <p className="text-white text-sm mb-1">Active Positions</p>
            <p className="text-3xl font-bold text-white">{stats.activePositions}</p>
          </div>
          <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
            <p className="text-white text-sm mb-1">Candidates This Month</p>
            <p className="text-3xl font-bold text-white">{stats.candidatesThisMonth}</p>
          </div>
        </div>

        {/* Job Management Section */}
        <div className="bg-black rounded-lg shadow-xl p-6 border border-white mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Job Descriptions</h2>
            <button
              onClick={() => {
                setShowJobForm(true);
                setEditingJob(null);
                setJobForm({ title: '', description: '', location: '', type: 'full-time' });
              }}
              className="px-4 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-md transition-colors"
            >
              Add Job
            </button>
          </div>

          {/* Job Form */}
          {showJobForm && (
            <div className="mb-6 p-4 bg-white rounded-md border border-white">
              <h3 className="text-lg font-semibold text-black mb-4">
                {editingJob ? 'Edit Job' : 'Add New Job'}
              </h3>
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-white border border-black rounded-md">
                    <p className="text-black text-sm">{error}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-white mb-2">Job Title</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-black rounded-md text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white mb-2">Description</label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-black rounded-md text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                    placeholder="Job description and requirements"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white mb-2">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-black rounded-md text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="e.g., Remote, New York, NY"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white mb-2">Job Type</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-black rounded-md text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingJob ? handleUpdateJob : handleAddJob}
                    className="px-4 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-md transition-colors"
                  >
                    {editingJob ? 'Update' : 'Add'} Job
                  </button>
                  <button
                    onClick={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                      setJobForm({ title: '', description: '', location: '', type: 'full-time' });
                      setError('');
                    }}
                    className="px-4 py-2 border border-white hover:border-gray-300 text-white hover:text-gray-300 font-medium rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Jobs List */}
          {loadingJobs ? (
            <div className="text-center py-8">
              <p className="text-white">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white">No jobs posted yet. Create your first job posting!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
              <div key={job.id} className="p-4 bg-white rounded-md border border-white flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-black font-semibold mb-1">{job.title}</h3>
                  <p className="text-black text-sm mb-2">{job.description}</p>
                  <p className="text-black text-xs">Applicants: {job.applicants || 0}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditJob(job)}
                    className="px-3 py-1 text-sm border border-black hover:border-gray-600 text-black hover:text-gray-600 rounded-md transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewApplicants(job.id)}
                    className="px-3 py-1 text-sm bg-black hover:bg-gray-800 text-white rounded-md transition-colors"
                  >
                    View Applicants ({job.applicants || 0})
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="px-3 py-1 text-sm border border-black hover:border-gray-600 text-black hover:text-gray-600 rounded-md transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart Section */}
        <div className="bg-black rounded-lg shadow-xl p-6 border border-white mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Interview Trends</h2>
          <PlaceholderChart />
          <p className="text-xs text-white mt-2">Analytics placeholder - Add real charts here</p>
        </div>

        {/* Common Failure Modes Analytics */}
        <div className="bg-black rounded-lg shadow-xl p-6 border border-white mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Common Failure Modes</h2>
          <div className="space-y-3">
            {commonFailureModes.map((mode, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{mode.mode}</span>
                    <span className="text-white text-sm">{mode.count} instances ({mode.percentage}%)</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full"
                      style={{ width: `${mode.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white mt-4">Analytics placeholder - Replace with real failure mode data</p>
        </div>

        {/* Recent Candidates */}
        <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Candidates</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white">
                  <th className="text-left text-white font-medium py-3 px-4">Name</th>
                  <th className="text-left text-white font-medium py-3 px-4">Position</th>
                  <th className="text-left text-white font-medium py-3 px-4">Score</th>
                  <th className="text-left text-white font-medium py-3 px-4">Date</th>
                  <th className="text-left text-white font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentCandidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b border-white">
                    <td className="text-white py-3 px-4">{candidate.name}</td>
                    <td className="text-white py-3 px-4">{candidate.position}</td>
                    <td className="text-white py-3 px-4">{candidate.score}%</td>
                    <td className="text-white py-3 px-4">{candidate.date}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewReport(candidate.id)}
                        className="text-white hover:text-gray-300 text-sm underline"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

