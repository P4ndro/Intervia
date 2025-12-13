import { useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';
import { api } from '../api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const userRole = user?.role || 'candidate';
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: '',
    bio: '',
    skills: '',
    experience: '',
    // Organization fields
    companyName: '',
    jobsPosted: 0,
  });

  const [candidateStats, setCandidateStats] = useState({
    completedInterviews: 0,
    averageScore: 0,
    totalPracticeTime: '0h 0m',
  });

  const [organizationStats, setOrganizationStats] = useState({
    jobsPosted: 0,
    totalApplicants: 0,
    interviewsCompleted: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch stats from API
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoadingStats(true);
        const data = await api.getMyStats();
        if (userRole === 'candidate') {
          setCandidateStats(data);
        } else {
          setOrganizationStats(data);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, [userRole]);

  const handleSave = async () => {
    // TODO: Update profile via API
    console.log('Saving profile:', formData);
    setEditing(false);
  };

  // Candidate Profile View
  if (userRole === 'candidate') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-black rounded-lg shadow-xl p-8 border border-white">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">My Profile</h1>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-md transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-md transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-white hover:border-gray-300 text-white hover:text-gray-300 font-medium rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Candidate Stats */}
            {loadingStats ? (
              <div className="mb-8 text-center py-4">
                <p className="text-white">Loading stats...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-md p-4 border border-white">
                  <p className="text-black text-sm mb-1">Completed Interviews</p>
                  <p className="text-2xl font-bold text-black">{candidateStats.completedInterviews}</p>
                </div>
                <div className="bg-white rounded-md p-4 border border-white">
                  <p className="text-black text-sm mb-1">Average Score</p>
                  <p className="text-2xl font-bold text-black">{candidateStats.averageScore}%</p>
                </div>
                <div className="bg-white rounded-md p-4 border border-white">
                  <p className="text-black text-sm mb-1">Practice Time</p>
                  <p className="text-2xl font-bold text-black">{candidateStats.totalPracticeTime}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
            <div>
              <label className="block text-sm text-white mb-2">Email</label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white rounded-md text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                />
              ) : (
                <p className="text-white">{formData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-white mb-2">Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white rounded-md text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="Your name"
                />
              ) : (
                <p className="text-white">{formData.name || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-white mb-2">Bio</label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-black border border-white rounded-md text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white resize-none"
                  placeholder="Tell us about yourself"
                />
              ) : (
                <p className="text-white">{formData.bio || 'No bio set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-white mb-2">Skills</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white rounded-md text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="e.g., JavaScript, React, Node.js"
                />
              ) : (
                <p className="text-white">{formData.skills || 'No skills listed'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-white mb-2">Experience</label>
              {editing ? (
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-black border border-white rounded-md text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white resize-none"
                  placeholder="Describe your work experience"
                />
              ) : (
                <p className="text-white">{formData.experience || 'No experience listed'}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
    );
  }

  // Organization Profile View
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-black rounded-lg shadow-xl p-8 border border-white">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Organization Profile</h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-md transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-md transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-white hover:border-gray-300 text-white hover:text-gray-300 font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Organization Stats */}
          {loadingStats ? (
            <div className="mb-8 text-center py-4">
              <p className="text-white">Loading stats...</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-md p-4 border border-white">
                <p className="text-black text-sm mb-1">Jobs Posted</p>
                <p className="text-2xl font-bold text-black">{organizationStats.jobsPosted}</p>
              </div>
              <div className="bg-white rounded-md p-4 border border-white">
                <p className="text-black text-sm mb-1">Total Applicants</p>
                <p className="text-2xl font-bold text-black">{organizationStats.totalApplicants}</p>
              </div>
              <div className="bg-white rounded-md p-4 border border-white">
                <p className="text-black text-sm mb-1">Interviews Completed</p>
                <p className="text-2xl font-bold text-black">{organizationStats.interviewsCompleted}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-white mb-2">Email</label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white rounded-md text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                />
              ) : (
                <p className="text-white">{formData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-white mb-2">Company Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white rounded-md text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="Your company name"
                />
              ) : (
                <p className="text-white">{formData.companyName || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-white mb-2">Access to Applicant Reports</label>
              <p className="text-white">View and analyze candidate interview reports from your company dashboard.</p>
              <a
                href="/company-dashboard"
                className="text-white hover:text-gray-300 mt-2 inline-block underline"
              >
                Go to Company Dashboard →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

