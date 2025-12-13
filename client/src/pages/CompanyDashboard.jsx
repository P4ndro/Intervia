import { useState } from 'react';
import Navbar from '../components/Navbar';
import PlaceholderChart from '../components/PlaceholderChart';

export default function CompanyDashboard() {
  // Mock data - replace with actual API calls
  const [stats] = useState({
    totalInterviews: 124,
    averageScore: 78,
    activePositions: 8,
    candidatesThisMonth: 45,
  });

  const [jobs, setJobs] = useState([
    { id: 1, title: 'Software Engineer', description: 'Full-stack developer needed', applicants: 12 },
    { id: 2, title: 'Frontend Developer', description: 'React/TypeScript expert', applicants: 8 },
    { id: 3, title: 'Backend Engineer', description: 'Node.js/Python developer', applicants: 15 },
  ]);

  const [editingJob, setEditingJob] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', description: '' });

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

  const handleAddJob = () => {
    // TODO: Add job via API
    const newJob = {
      id: jobs.length + 1,
      title: jobForm.title,
      description: jobForm.description,
      applicants: 0,
    };
    setJobs([...jobs, newJob]);
    setJobForm({ title: '', description: '' });
    setShowJobForm(false);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobForm({ title: job.title, description: job.description });
    setShowJobForm(true);
  };

  const handleUpdateJob = () => {
    // TODO: Update job via API
    setJobs(jobs.map(job => 
      job.id === editingJob.id 
        ? { ...job, title: jobForm.title, description: jobForm.description }
        : job
    ));
    setEditingJob(null);
    setJobForm({ title: '', description: '' });
    setShowJobForm(false);
  };

  const handleDeleteJob = (jobId) => {
    // TODO: Delete job via API
    if (window.confirm('Are you sure you want to delete this job?')) {
      setJobs(jobs.filter(job => job.id !== jobId));
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
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Company Dashboard</h1>
          <p className="text-slate-400">Overview of your hiring process</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Total Interviews</p>
            <p className="text-3xl font-bold text-white">{stats.totalInterviews}</p>
          </div>
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Average Score</p>
            <p className="text-3xl font-bold text-white">{stats.averageScore}%</p>
          </div>
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Active Positions</p>
            <p className="text-3xl font-bold text-white">{stats.activePositions}</p>
          </div>
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Candidates This Month</p>
            <p className="text-3xl font-bold text-white">{stats.candidatesThisMonth}</p>
          </div>
        </div>

        {/* Job Management Section */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Job Descriptions</h2>
            <button
              onClick={() => {
                setShowJobForm(true);
                setEditingJob(null);
                setJobForm({ title: '', description: '' });
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors"
            >
              Add Job
            </button>
          </div>

          {/* Job Form */}
          {showJobForm && (
            <div className="mb-6 p-4 bg-slate-900 rounded-md border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingJob ? 'Edit Job' : 'Add New Job'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Description</label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                    placeholder="Job description and requirements"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingJob ? handleUpdateJob : handleAddJob}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors"
                  >
                    {editingJob ? 'Update' : 'Add'} Job
                  </button>
                  <button
                    onClick={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                      setJobForm({ title: '', description: '' });
                    }}
                    className="px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Jobs List */}
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 bg-slate-900 rounded-md border border-slate-700 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{job.title}</h3>
                  <p className="text-slate-400 text-sm mb-2">{job.description}</p>
                  <p className="text-slate-500 text-xs">Applicants: {job.applicants}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditJob(job)}
                    className="px-3 py-1 text-sm border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-md transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewApplicants(job.id)}
                    className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
                  >
                    View Applicants ({job.applicants})
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="px-3 py-1 text-sm border border-red-600 hover:border-red-500 text-red-400 hover:text-red-300 rounded-md transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Interview Trends</h2>
          <PlaceholderChart />
          <p className="text-xs text-slate-400 mt-2">Analytics placeholder - Add real charts here</p>
        </div>

        {/* Common Failure Modes Analytics */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Common Failure Modes</h2>
          <div className="space-y-3">
            {commonFailureModes.map((mode, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{mode.mode}</span>
                    <span className="text-slate-400 text-sm">{mode.count} instances ({mode.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${mode.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">Analytics placeholder - Replace with real failure mode data</p>
        </div>

        {/* Recent Candidates */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Candidates</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Name</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Position</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Score</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Date</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentCandidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b border-slate-700">
                    <td className="text-white py-3 px-4">{candidate.name}</td>
                    <td className="text-slate-300 py-3 px-4">{candidate.position}</td>
                    <td className="text-slate-300 py-3 px-4">{candidate.score}%</td>
                    <td className="text-slate-300 py-3 px-4">{candidate.date}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewReport(candidate.id)}
                        className="text-emerald-400 hover:text-emerald-300 text-sm"
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

