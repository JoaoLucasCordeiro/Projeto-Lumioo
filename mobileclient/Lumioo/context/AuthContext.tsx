import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { TOKEN_KEY } from '@/lib/api';

interface User {
  id: string;
  fullName: string;
  username: string;
  academicEmail: string;
  institution: string;
  academicLevel: string;
  dateOfBirth: string;
  bio: string | null;
  avatar: string | null;
  coverPhoto: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RegisterData {
  fullName: string;
  academicEmail: string;
  username: string;
  password: string;
  institution: string;
  academicLevel: string;
  dateOfBirth: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken) {
        const storedUser = await SecureStore.getItemAsync('lumioo_user');
        if (storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      }
    } catch {
      // token inválido ou corrompido — ignora
    } finally {
      setIsLoading(false);
    }
  }

  async function login(identifier: string, password: string) {
    const response = await api.post('/auth/signin', { identifier, password });
    const { token: newToken, user: newUser } = response.data;
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    await SecureStore.setItemAsync('lumioo_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  async function register(data: RegisterData) {
    await api.post('/users', data);
    await login(data.academicEmail, data.password);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync('lumioo_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
