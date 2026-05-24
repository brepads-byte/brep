import React, { createContext, useState, useEffect, useCallback } from 'react';
import { verifyToken as verifyTokenApi, login as loginApi } from '../services/authService';
import type { Admin } from '../admin/types';
import apiClient from '../services/apiClient';

interface AuthContextType {
  isAuthenticated: boolean;
  admin: Admin | null;
  loading: boolean; 
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  setAdmin: (admin: Admin) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const verifyAuth = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLoading(false);
      return;
    }

    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      const verifiedAdmin = await verifyTokenApi();
      setAdmin(verifiedAdmin);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('admin_token');
      setAdmin(null);
      delete apiClient.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const login = async (email: string, pass: string) => {
    const { token, admin: loggedInAdmin } = await loginApi(email, pass);
    localStorage.setItem('admin_token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAdmin(loggedInAdmin);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    delete apiClient.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  const value = {
    isAuthenticated: !!admin,
    admin,
    loading,
    login,
    logout,
    setAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
