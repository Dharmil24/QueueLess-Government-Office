import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ql_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ql_token'));
  const [loading, setLoading] = useState(true);

  // Sync state on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ql_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('ql_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Failed to verify token session, clearing.');
          localStorage.removeItem('ql_token');
          localStorage.removeItem('ql_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    // authService.login will throw an Error (with backend message) on any non-2xx response
    const res = await authService.login(credentials);
    if (res.success && res.token) {
      localStorage.setItem('ql_token', res.token);
      localStorage.setItem('ql_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed. Please check your credentials.');
  };

  const register = async (userData) => {
    // authService.register will throw an Error (with backend message) on any non-2xx response
    const res = await authService.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('ql_token', res.token);
      localStorage.setItem('ql_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed. Please try again.');
  };

  const demoRegister = async (data = {}) => {
    // Clear any stale auth state before demo registration
    localStorage.removeItem('ql_token');
    localStorage.removeItem('ql_user');
    setUser(null);
    setToken(null);

    const storeAuth = (res) => {
      localStorage.setItem('ql_token', res.token);
      localStorage.setItem('ql_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    };

    // 1st attempt: dedicated demo-register endpoint
    try {
      const res = await authService.demoRegister(data);
      if (res.success && res.token) {
        return storeAuth(res);
      }
    } catch (demoErr) {
      console.warn('[demoRegister] demo-register endpoint failed, falling back to regular register:', demoErr.message);
    }

    // 2nd attempt: standard register with isDemo flag
    try {
      const fallbackRes = await authService.register({
        name: data.name || 'Rahul Patel',
        email: data.email || 'rahul@example.com',
        password: data.password || 'password123',
        mobile: data.mobile || '+91 98250 12345',
        isDemo: true,
      });
      if (fallbackRes.success && fallbackRes.token) {
        return storeAuth(fallbackRes);
      }
    } catch (fallbackErr) {
      throw fallbackErr;
    }

    throw new Error('Demo registration failed. Please try again.');
  };

  const demoLogin = async (data = {}) => {
    // Clear any stale auth state before attempting demo login
    localStorage.removeItem('ql_token');
    localStorage.removeItem('ql_user');
    setUser(null);
    setToken(null);

    const storeAuth = (res) => {
      localStorage.setItem('ql_token', res.token);
      localStorage.setItem('ql_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    };

    // 1st attempt: dedicated demo-login endpoint (creates user if not exists)
    try {
      const res = await authService.demoLogin(data);
      if (res.success && res.token) {
        return storeAuth(res);
      }
    } catch (demoErr) {
      console.warn('[demoLogin] demo-login endpoint failed, falling back to regular login:', demoErr.message);
    }

    // 2nd attempt: regular login with provided credentials
    if (data.email && data.password) {
      try {
        const res = await authService.login({ email: data.email, password: data.password });
        if (res.success && res.token) {
          return storeAuth(res);
        }
      } catch (loginErr) {
        console.warn('[demoLogin] regular login fallback failed:', loginErr.message);
        throw loginErr;
      }
    }

    throw new Error('Demo login failed. Please try again or check your connection.');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore
    } finally {
      localStorage.removeItem('ql_token');
      localStorage.removeItem('ql_user');
      setUser(null);
      setToken(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('ql_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        role: user?.role || null,
        login,
        register,
        demoRegister,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
