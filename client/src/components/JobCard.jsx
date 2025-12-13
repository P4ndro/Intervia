import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    try {
      setLoading(true);
      const data = await api.startInterview();
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      console.error('Failed to start interview:', err);
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 hover:border-emerald-500 transition-colors">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white mb-2">{job.title}</h3>
        <p className="text-emerald-400 font-medium">{job.company}</p>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-slate-400 text-sm">
          <span className="mr-2">📍</span>
          {job.location}
        </div>
        <div className="flex items-center text-slate-400 text-sm">
          <span className="mr-2">💼</span>
          {job.type}
        </div>
        <div className="flex items-center text-slate-400 text-sm">
          <span className="mr-2">📅</span>
          {job.posted}
        </div>
      </div>

      <button
        onClick={handleApply}
        disabled={loading}
        className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
      >
        {loading ? 'Starting...' : 'Apply Now'}
      </button>
    </div>
  );
}

