import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-800">
      <Link to="/" className="text-2xl font-bold text-white">
        FailProof
      </Link>
      
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link
              to="/home"
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/profile"
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              My Profile
            </Link>
            <Link
              to="/report"
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Reports
            </Link>
            {localStorage.getItem('userRole') === 'organization' && (
              <Link
                to="/company-dashboard"
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Company Dashboard
              </Link>
            )}
            <span className="text-slate-400 text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-md transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

