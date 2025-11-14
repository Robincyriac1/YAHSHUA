import { useState, useEffect } from 'react';
import { User, ApiResponse } from '../types';
import { getAuthToken, removeAuthToken } from '../lib/utils';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = getAuthToken();
    
    if (!token) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false
      }));
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });
      } else {
        // Token is invalid
        removeAuthToken();
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Session expired'
        });
      }
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Failed to load user data'
      });
    }
  };

  const login = async (email: string, password: string, remember: boolean = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, remember }),
      });

      const data: ApiResponse<{ token: string; user: User }> = await response.json();

      if (response.ok && data.success) {
        // Store token
        const maxAge = remember ? 604800 : 3600; // 7 days or 1 hour
        document.cookie = `auth-token=${data.data.token}; path=/; max-age=${maxAge}; secure; samesite=strict`;
        
        setState({
          user: data.data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });

        return { success: true };
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Login failed'
        }));
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = 'Connection error. Please check if the backend is running.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    removeAuthToken();
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null
    });
  };

  const register = async (formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
    organizationName: string;
    organizationSlug: string;
    jobTitle?: string;
    phone?: string;
    role?: string;
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<{ token: string; user: User }> = await response.json();

      if (response.ok && data.success) {
        // Store token
        document.cookie = `auth-token=${data.data.token}; path=/; max-age=3600; secure; samesite=strict`;
        
        setState({
          user: data.data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });

        return { success: true };
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Registration failed'
        }));
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      const errorMessage = 'Connection error. Please check if the backend is running.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...state,
    login,
    logout,
    register,
    refetch: loadUser
  };
}
