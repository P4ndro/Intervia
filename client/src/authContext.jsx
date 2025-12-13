import { createContext, useContext, useState, useEffect } from 'react';
import { api, setAccessToken, clearAccessToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user from /api/auth/me
  const fetchUser = async () => {
    try {
      const userData = await api.me();
      setUser(userData);
      return userData;
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  // Try to restore session on mount
  useEffect(() => {
    api.refresh()
      .then(async (data) => {
        setAccessToken(data.accessToken);
        // Fetch user details including role
        await fetchUser();
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setAccessToken(data.accessToken);
    // Fetch user details including role
    const userData = await fetchUser();
    return { ...data, user: userData };
  };

  const register = async (email, password, role = 'candidate', companyName = '') => {
    const data = await api.register(email, password, role, companyName);
    setAccessToken(data.accessToken);
    // Fetch user details including role
    const userData = await fetchUser();
    return { ...data, user: userData };
  };

  const logout = async () => {
    await api.logout();
    clearAccessToken();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

