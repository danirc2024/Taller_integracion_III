import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Usuario, LoginPayload, RegisterPayload } from '@/types';

// Local storage key for persistence
const AUTH_USER_KEY = 'auth_user';

interface AuthContextType {
  user: Usuario | null;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  googleLogin: (idToken: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(() => {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [user]);

  const login = async (payload: LoginPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.mensaje || 'Error al iniciar sesión');
      }
      const userData: Usuario = result.usuario ?? result;
      setUser(userData);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error de red.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.mensaje || 'Error al crear la cuenta');
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Error de red.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (idToken: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
        credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.mensaje || 'Error en Google Login');
      }
      const userData: Usuario = result.usuario ?? result;
      setUser(userData);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error de red en Google Login.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest: !user?.id,
        isLoading,
        error,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
