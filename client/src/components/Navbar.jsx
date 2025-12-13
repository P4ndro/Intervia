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
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <Link to="/" className="text-2xl font-bold text-black">
        FailProof
      </Link>
      
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link
              to="/home"
              className="px-4 py-2 text-gray-600 hover:text-black transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/profile"
              className="px-4 py-2 text-gray-600 hover:text-black transition-colors font-medium"
            >
              My Profile
            </Link>
            <Link
              to="/report"
              className="px-4 py-2 text-gray-600 hover:text-black transition-colors font-medium"
            >
              Reports
            </Link>
            {localStorage.getItem('userRole') === 'organization' && (
              <Link
                to="/company-dashboard"
                className="px-4 py-2 text-gray-600 hover:text-black transition-colors font-medium"
              >
                Company Dashboard
              </Link>
            )}
            <span className="text-gray-600 text-sm font-medium">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-black hover:bg-gray-100 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-gray-600 hover:text-black transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

