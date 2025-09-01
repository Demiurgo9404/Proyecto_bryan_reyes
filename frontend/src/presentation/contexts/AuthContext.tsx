import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthRepository } from '../../../domain/repositories/AuthRepository';
import { User } from '../../../domain/entities/User';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
  authRepository: AuthRepository;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  authRepository,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      const currentUser = await authRepository.getCurrentUser();
      setUser(currentUser);
    } catch (error: any) {
      console.error('Error refreshing auth:', error);
      
      // Si es un error 401, simplemente limpiar el estado sin lanzar error
      if (error.response?.status === 401) {
        console.log('[AuthContext] Token expirado, limpiando estado de autenticación');
        setUser(null);
        return; // No lanzar error para evitar crashes
      }
      
      // Para otros errores, limpiar estado pero no lanzar
      setUser(null);
    }
  }, [authRepository]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
        // No hacer nada más, refreshAuth ya maneja los errores
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshAuth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authRepository.login({ email, password });
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authRepository.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshAuth,
      }}
    >
      {!isLoading ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
