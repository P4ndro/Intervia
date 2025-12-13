import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.applyToJob(job.id);
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      console.error('Failed to apply:', err);
      setError(err.message || 'Failed to apply');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-black transition-colors p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
        <p className="text-gray-600 font-medium">{job.company}</p>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-500 text-sm">
          <span className="mr-2">📍</span>
          {job.location}
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <span className="mr-2">💼</span>
          {job.type || job.employmentType || 'Full-time'}
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <span className="mr-2">📅</span>
          {job.posted}
        </div>
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {job.skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="text-xs text-gray-500">+{job.skills.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-2">{error}</p>
      )}

      <button
        onClick={handleApply}
        disabled={loading}
        className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {loading ? 'Applying...' : 'Apply Now'}
      </button>
    </div>
  );
}
