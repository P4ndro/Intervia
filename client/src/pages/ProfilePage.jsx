import { useState } from 'react';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  // TODO: Get role from user object or context when backend is integrated
  const [userRole] = useState(localStorage.getItem('userRole') || 'candidate');
  
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

  // Mock data - replace with actual API calls
  const candidateStats = {
    completedInterviews: 5,
    averageScore: 78,
    totalPracticeTime: '2h 30m',
  };

  const organizationStats = {
    jobsPosted: 12,
    totalApplicants: 45,
    interviewsCompleted: 38,
  };

  const handleSave = async () => {
    // TODO: Update profile via API
    console.log('Saving profile:', formData);
    setEditing(false);
  };

  // Candidate Profile View
  if (userRole === 'candidate') {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">My Profile</h1>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Candidate Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-900 rounded-md p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Completed Interviews</p>
                <p className="text-2xl font-bold text-white">{candidateStats.completedInterviews}</p>
              </div>
              <div className="bg-slate-900 rounded-md p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Average Score</p>
                <p className="text-2xl font-bold text-white">{candidateStats.averageScore}%</p>
              </div>
              <div className="bg-slate-900 rounded-md p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Practice Time</p>
                <p className="text-2xl font-bold text-white">{candidateStats.totalPracticeTime}</p>
              </div>
            </div>

            <div className="space-y-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-white">{formData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Your name"
                />
              ) : (
                <p className="text-white">{formData.name || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Bio</label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                  placeholder="Tell us about yourself"
                />
              ) : (
                <p className="text-white">{formData.bio || 'No bio set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Skills</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g., JavaScript, React, Node.js"
                />
              ) : (
                <p className="text-white">{formData.skills || 'No skills listed'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Experience</label>
              {editing ? (
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
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
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Organization Profile</h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Organization Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900 rounded-md p-4 border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Jobs Posted</p>
              <p className="text-2xl font-bold text-white">{organizationStats.jobsPosted}</p>
            </div>
            <div className="bg-slate-900 rounded-md p-4 border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Total Applicants</p>
              <p className="text-2xl font-bold text-white">{organizationStats.totalApplicants}</p>
            </div>
            <div className="bg-slate-900 rounded-md p-4 border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Interviews Completed</p>
              <p className="text-2xl font-bold text-white">{organizationStats.interviewsCompleted}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-white">{formData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Company Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Your company name"
                />
              ) : (
                <p className="text-white">{formData.companyName || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Access to Applicant Reports</label>
              <p className="text-white">View and analyze candidate interview reports from your company dashboard.</p>
              <a
                href="/company-dashboard"
                className="text-emerald-400 hover:text-emerald-300 mt-2 inline-block"
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

