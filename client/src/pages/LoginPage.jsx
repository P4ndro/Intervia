import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      const data = await login(email, password);
      // Redirect based on user role
      if (data.user?.role === 'company') {
        navigate('/company-dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setErrors({ password: err.message || 'Login failed' });
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  const handleGitHubLogin = () => {
    console.log('GitHub login clicked');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans">
      {/* Page Title */}
      <div className="p-6">
        <Link to="/" className="text-white text-xl font-normal hover:text-gray-300 transition-colors">
          InterviewAi
        </Link>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        {/* Auth Card */}
        <div className="bg-black rounded-2xl shadow-2xl w-full max-w-md p-8 md:p-10 border border-white">
          {/* Welcome Heading */}
          <h2 className="text-3xl font-semibold text-white mb-8 text-center">
            Welcome to Intervia
          </h2>

          {/* Login Fields */}
          <div className="space-y-5">
            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 bg-white border ${
                  errors.email ? 'border-white' : 'border-white'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-all text-black`}
              />
              {errors.email && (
                <p className="text-white text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 bg-white border ${
                  errors.password ? 'border-white' : 'border-white'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-all text-black`}
              />
              {errors.password && (
                <p className="text-white text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Log In Button */}
            <button
              onClick={handleLogin}
              className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 mt-6"
            >
              Log In
            </button>
          </div>

          {/* Separator */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white"></div>
            <span className="px-4 text-white text-sm">or</span>
            <div className="flex-1 border-t border-white"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex gap-3">
            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>

            {/* GitHub Button */}
            <button
              onClick={handleGitHubLogin}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-white text-sm mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-white font-medium hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate('/signup');
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

