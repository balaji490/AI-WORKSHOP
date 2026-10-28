import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  college: string;
  branch: string;
  graduationYear: number;
  referralCode: string;
  phone?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User }>;
  signup: (data: any) => Promise<{ user: User; referralCodeUsed?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.me();
      setUser(data.user);
    } catch {
      setUser(null);
      localStorage.removeItem('accessToken');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };
    init();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password });
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    setUser(data.user);
    return data;
  };

  const signup = async (formData: any) => {
    const { data } = await authAPI.signup(formData);
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Continue with local cleanup
    }
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        isAdmin: user?.role === 'admin',
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
