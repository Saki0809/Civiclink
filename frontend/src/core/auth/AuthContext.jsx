import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, domain) => {
    setError(null);
    setLoading(true);

    try {
      // Query the "Login data" table for matching email and password
      const { data, error: queryError } = await supabase
        .from('Credentials')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (queryError || !data) {
        throw new Error('Invalid email or password');
      }

      // Map DB columns to app user object
      const userData = {
        id: data.id,
        email: data.email,
        full_name: data.Name,
        phone: data.Phone ? String(data.Phone) : null,
        domain: domain,
        role: domain === 'civilian' ? 'citizen' :
              domain === 'healthcare' ? 'hospital_admin' :
              domain === 'municipal' ? 'municipal_officer' :
              domain === 'education' ? 'college_admin' : 'citizen',
        is_active: true,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  }, []);

  const signup = useCallback(async (userData) => {
    setError(null);
    setLoading(true);

    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('Credentials')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (existing) {
        throw new Error('An account with this email already exists');
      }

      // Insert into "Login data" table
      const { data, error: insertError } = await supabase
        .from('Credentials')
        .insert({
          email: userData.email,
          password: userData.password,
          confirm_password: userData.password,
          Name: userData.full_name,
          Phone: userData.phone ? parseInt(userData.phone, 10) : null,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message || 'Signup failed');
      }

      // Map DB columns to app user object
      const newUser = {
        id: data.id,
        email: data.email,
        full_name: data.Name,
        phone: data.Phone ? String(data.Phone) : null,
        domain: userData.domain,
        role: userData.role || 'citizen',
        is_active: true,
      };

      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      setLoading(false);
      return newUser;
    } catch (err) {
      const message = err.message || 'Signup failed';
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    return user;
  }, [user]);

  // Allow switching domains (client-side only, domain is not stored in DB)
  const switchDomain = useCallback((domain) => {
    if (user) {
      const updatedUser = {
        ...user,
        domain,
        role: domain === 'civilian' ? 'citizen' :
              domain === 'healthcare' ? 'hospital_admin' :
              domain === 'municipal' ? 'municipal_officer' :
              domain === 'education' ? 'college_admin' : 'citizen',
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    }
    return null;
  }, [user]);

  const updateProfile = useCallback((updatedData) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    }
    return null;
  }, [user]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isDemoMode: false,
    login,
    signup,
    logout,
    updateProfile,
    refreshProfile,
    switchDomain,
    clearError: () => setError(null),
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
