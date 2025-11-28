'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AuthUser } from '@/types';
import { AuthUserSchema } from '@/schemas/AuthUserSchema';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: (_user: AuthUser) => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = (): void => {
      try {
        const storedUser = localStorage.getItem('dashflow_user');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          const result = AuthUserSchema.safeParse(parsedUser);
          if (result.success) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem('dashflow_user');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);

        localStorage.removeItem('dashflow_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback((authUser: AuthUser): void => {
    setUser(authUser);

    localStorage.setItem('dashflow_user', JSON.stringify(authUser));
  }, []);

  const logout = useCallback((): void => {
    setUser(null);

    localStorage.removeItem('dashflow_user');
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  return context;
};
