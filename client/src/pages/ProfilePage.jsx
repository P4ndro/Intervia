import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';
import { api } from '../api';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const [reports, setReports] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);

  // Fetch profile data (includes stats and reports)
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoadingStats(true);
        setLoadingReports(true);
        const profileData = await api.getProfile();
        
        if (userRole === 'candidate') {
          setCandidateStats(profileData.stats);
          setReports(profileData.reports || []);
        } else {
          setOrganizationStats(profileData.stats);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        // Fallback to stats only
        try {
          const statsData = await api.getMyStats();
          if (userRole === 'candidate') {
            setCandidateStats(statsData);
          } else {
            setOrganizationStats(statsData);
          }
        } catch (statsErr) {
          console.error('Failed to load stats:', statsErr);
        }
      } finally {
        setLoadingStats(false);
        setLoadingReports(false);
      }
    }

    fetchProfile();
  }, [userRole]);

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
            {loadingStats ? (
              <div className="mb-8 text-center py-4">
                <p className="text-slate-400">Loading stats...</p>
              </div>
            ) : (
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
            )}

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

          {/* Interview Reports Section */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Interview Reports</h2>
            
            {loadingReports ? (
              <div className="text-center py-8">
                <p className="text-slate-400">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 bg-slate-900 rounded-lg border border-slate-700">
                <p className="text-slate-400 mb-2">No completed interviews yet</p>
                <p className="text-slate-500 text-sm">Complete an interview to see your reports here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.interviewId}
                    className="bg-slate-900 rounded-lg p-6 border border-slate-700 hover:border-emerald-600 transition-colors cursor-pointer"
                    onClick={() => navigate(`/report/${report.interviewId}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {report.jobTitle || 'Practice Interview'}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          {report.jobLevel && (
                            <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">
                              {report.jobLevel}
                            </span>
                          )}
                          <span>
                            {report.interviewType === 'practice' ? 'Practice' : 'Application'}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(report.completedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      {report.report && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white mb-1">
                            {report.report.overallScore || 0}%
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            report.report.readinessBand === 'Ready'
                              ? 'bg-emerald-900/50 text-emerald-400'
                              : report.report.readinessBand === 'Almost Ready'
                              ? 'bg-yellow-900/50 text-yellow-400'
                              : 'bg-red-900/50 text-red-400'
                          }`}>
                            {report.report.readinessBand || 'Not Ready'}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {report.report && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {report.report.technicalScore !== null && report.report.technicalScore !== undefined && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Technical</p>
                              <p className="text-lg font-semibold text-white">{report.report.technicalScore}%</p>
                            </div>
                          )}
                          {report.report.behavioralScore !== null && report.report.behavioralScore !== undefined && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Behavioral</p>
                              <p className="text-lg font-semibold text-white">{report.report.behavioralScore}%</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Questions</p>
                            <p className="text-lg font-semibold text-white">{report.questionsCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Answered</p>
                            <p className="text-lg font-semibold text-white">{report.answersCount}</p>
                          </div>
                        </div>
                        
                        {report.report.summary && (
                          <p className="text-sm text-slate-300 line-clamp-2 mb-3">
                            {report.report.summary}
                          </p>
                        )}
                        
                        {report.report.primaryBlockers && report.report.primaryBlockers.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {report.report.primaryBlockers.slice(0, 3).map((blocker, idx) => (
                              <span
                                key={idx}
                                className={`text-xs px-2 py-1 rounded ${
                                  blocker.severity === 'high'
                                    ? 'bg-red-900/30 text-red-400 border border-red-800'
                                    : blocker.severity === 'medium'
                                    ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                                    : 'bg-blue-900/30 text-blue-400 border border-blue-800'
                                }`}
                              >
                                {blocker.issue}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/report/${report.interviewId}`);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                      >
                        View Full Report →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          {loadingStats ? (
            <div className="mb-8 text-center py-4">
              <p className="text-slate-400">Loading stats...</p>
            </div>
          ) : (
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
          )}

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

