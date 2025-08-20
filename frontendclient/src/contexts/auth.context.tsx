import { clearAuthData, getToken, getUser, saveAuthData } from '@/services/auth.service';
import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: string;
  username: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = getUser();
    const storedToken = getToken();
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha no login');
      }
      
      saveAuthData(data.token, data.user);
      setUser(data.user);
      setToken(data.token);
      
      navigate('/feed'); 
    } catch (err: any) {
      setError(err.message);
      throw err; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    setToken(null);
    navigate('/login'); 
  };

  const value = { user, token, login, logout, isLoading, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
