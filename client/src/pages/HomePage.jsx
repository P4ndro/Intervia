import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { homePageStyles } from './homePageStyles';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userRole] = useState(localStorage.getItem('userRole') || 'candidate');
  const [searchInput, setSearchInput] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');

  const handleUpgrade = () => {
    alert('Redirecting to pricing...');
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

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

  // Candidate View - Dashboard
  if (userRole === 'candidate') {
    return (
      <>
        <style>{homePageStyles}</style>
        <div className="dashboard-container">
          {/* Left Sidebar */}
          <aside className="sidebar-left">
            <div className="profile-header">
              <div className="profile-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="profile-info">
                <h3>InterviewSim</h3>
                <p>{user?.email || 'user@example.com'}</p>
              </div>
            </div>

            <nav className="nav-links">
              <a
                href="#"
                className={`nav-link ${activeNav === 'dashboard' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav('dashboard');
                }}
              >
                <i className="fas fa-th-large"></i>
                <span>Dashboard</span>
              </a>
              <Link
                to="/interview"
                className={`nav-link ${activeNav === 'interviews' ? 'active' : ''}`}
                onClick={(e) => {
                  setActiveNav('interviews');
                }}
              >
                <i className="fas fa-briefcase"></i>
                <span>Interviews</span>
              </Link>
              <a
                href=""
                className={`nav-link ${activeNav === 'feedback' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav('feedback');
                }}
              >
                <i className="fas fa-comment-dots"></i>
                <span>Feedback</span>
              </a>
              <Link
                to="/profile"
                className={`nav-link ${activeNav === 'stats' ? 'active' : ''}`}
                onClick={(e) => {
                  setActiveNav('stats');
                }}
              >
                <i className="fas fa-chart-bar"></i>
                <span>Stats</span>
              </Link>
              <a
                href="#"
                className={`nav-link ${activeNav === 'notes' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav('notes');
                }}
              >
                <i className="fas fa-sticky-note"></i>
                <span>Notes</span>
              </a>
            </nav>

            <div className="nav-footer">
              <Link to="/profile" className="nav-link" onClick={(e) => {
                setActiveNav('settings');
              }}>
                <i className="fas fa-cog"></i>
                <span>Settings</span>
              </Link>
              <a href="." className="nav-link" onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Log out</span>
              </a>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <div className="top-bar">
              <h1>Dashboard</h1>
              <div className="search-bar">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search interviews..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <div className="action-icons">
                <div className="action-icon">
                  <i className="fas fa-bell"></i>
                </div>
                <div className="action-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="action-icon">
                  <i className="fas fa-question-circle"></i>
                </div>
              </div>
            </div>

            {/* Widget Grid */}
            <div className="widget-grid">
              {/* Card 1: AI Recruiter */}
              <div className="widget-card">
                <span className="widget-badge">Practice</span>
                <div className="widget-header">
                  <div className="widget-icon">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="widget-info">
                    <h3>AI Recruiter</h3>
                    <p>Simulate your interview!</p>
                  </div>
                </div>
                

              </div>

              {/* Card 2: Performance */}
              <div className="widget-card">
                <span className="widget-badge">Results</span>
                <div className="widget-header">
                  <div className="widget-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="widget-info">
                    <h3>Performance</h3>
                    <p>Track your progress</p>
                  </div>
                </div>
                
                
              </div>
            </div>

            {/* Calendar Section */}
            <div className="calendar-section">
              <div className="calendar-header">
                <h2>Your Schedule</h2>
                <div className="calendar-toggle">
                  <i className="fas fa-calendar-alt"></i> Ongoing Sessions
                </div>
              </div>
              <div className="calendar-grid">
                <div className="calendar-day-header">Mon</div>
                <div className="calendar-day-header">Tue</div>
                <div className="calendar-day-header">Wed</div>
                <div className="calendar-day-header">Thu</div>
                <div className="calendar-day-header">Fri</div>
                <div className="calendar-day-header">Sat</div>
                <div className="calendar-day-header">Sun</div>

                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((day) => (
                  <div
                    key={day}
                    className={`calendar-day ${
                      [4, 10, 15].includes(day) ? 'has-event' : ''
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="sidebar-right">
            {/* Performance Summary */}
            <div className="sidebar-section">
              <h3>Performance Summary</h3>
              <div className="performance-list">
                <div className="performance-item">
                  <div className="performance-icon">
                    <i className="fas fa-microphone"></i>
                  </div>
                  <div className="performance-info">
                    <h4>Mock Interview</h4>
                    <p>Last Week</p>
                  </div>
                  <div className="performance-badge">85%</div>
                </div>
                <div className="performance-item">
                  <div className="performance-icon">
                    <i className="fas fa-code"></i>
                  </div>
                  <div className="performance-info">
                    <h4>Technical Skills</h4>
                    <p>Last Month</p>
                  </div>
                  <div className="performance-badge">90%</div>
                </div>
                <div className="performance-item">
                  <div className="performance-icon">
                    <i className="fas fa-comments"></i>
                  </div>
                  <div className="performance-info">
                    <h4>Soft Skills</h4>
                    <p>Last Month</p>
                  </div>
                  <div className="performance-badge">78%</div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="sidebar-section">
              <h3>Notifications</h3>
              <div className="notification-card">
                <div className="notification-content">
                  <h4>Your interview feedback is ready!</h4>
                  <p>For assistance, please contact our support team.</p>
                </div>
                <div className="notification-action">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </>
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


