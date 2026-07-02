import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            setUser(res.user);
            setProfile(res.profile);
          }
        } catch (err) {
          console.error('Failed to load profile on mount:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        
        // Fetch full profile info
        const meRes = await api.get('/auth/me');
        setUser(meRes.user);
        setProfile(meRes.profile);
        return meRes.user;
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, role, extraFields = {}) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { email, password, role, ...extraFields });
      if (res.success) {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);

        const meRes = await api.get('/auth/me');
        setUser(meRes.user);
        setProfile(meRes.profile);
        return meRes.user;
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setProfile(null);
    setError(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success) {
        setProfile(res.profile);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err.message);
    }
  };

  const updateCandidateProfile = async (formData) => {
    try {
      const res = await api.put('/candidates/profile', formData);
      if (res.success) {
        setProfile(res.profile);
        return res.profile;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateRecruiterProfile = async (formData) => {
    try {
      const res = await api.put('/recruiters/company', formData);
      if (res.success) {
        setProfile(res.profile);
        return res.profile;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      error,
      login,
      register,
      logout,
      refreshProfile,
      updateCandidateProfile,
      updateRecruiterProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
