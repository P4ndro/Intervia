import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    try {
      setLoading(true);
      // Use applyToJob for real job applications, startInterview is for practice
      const data = await api.applyToJob(job.id);
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      console.error('Failed to apply to job:', err);
      setLoading(false);
    }
  };

  return (
    <div className="bg-black rounded-lg shadow-xl p-6 border border-white hover:border-white transition-colors">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white mb-2">{job.title}</h3>
        <p className="text-white font-medium">{job.company}</p>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-white text-sm">
          <span className="mr-2">📍</span>
          {job.location}
        </div>
        <div className="flex items-center text-white text-sm">
          <span className="mr-2">💼</span>
          {job.type}
        </div>
        <div className="flex items-center text-white text-sm">
          <span className="mr-2">📅</span>
          {job.posted}
        </div>
      </div>

      <button
        onClick={handleApply}
        disabled={loading}
        className="w-full py-2 px-4 bg-white hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-medium rounded-md transition-colors"
      >
        {loading ? 'Starting...' : 'Apply Now'}
      </button>
    </div>
  );
}

