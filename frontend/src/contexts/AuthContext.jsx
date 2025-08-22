import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

// Helper function to clear auth data
const clearAuthData = (setUser, setToken) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser?.(null);
  setToken?.(null);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const logoutRef = useRef(null);

  // Check if there's an authenticated user when the app loads
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
          try {
            // First, try to get fresh user data
            const me = await authApi.getMe(storedToken);
            const meUser = me?.data || me?.user || me;
            
            if (meUser && meUser.id) {  // Ensure we have a valid user with ID
              setUser(meUser);
              setToken(storedToken);
              localStorage.setItem('user', JSON.stringify(meUser));
              localStorage.setItem('token', storedToken);
              return; // Successfully authenticated
            } else {
              throw new Error('Invalid user data received');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            // Clear auth data on any error
            clearAuthData(setUser, setToken);
            return;
          }
          
          // If we get here, we have a token but couldn't refresh user data
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          } else {
            // No stored user data, clear auth
            clearAuthData(setUser, setToken);
          }
        } else {
          // No token, clear any existing auth data
          clearAuthData(setUser, setToken);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        clearAuthData(setUser, setToken);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  // Function to login
  const login = async (email, password) => {
    try {
      console.log('Iniciando proceso de login para:', email);
      setLoading(true);
      setError(null);
      
      // Clear any existing auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      
      console.log('Realizando petición de login...');
      const response = await authApi.login(email, password);
      console.log('Respuesta del servidor:', response);
      
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }
      
      if (!response.token) {
        throw new Error('No se recibió el token de autenticación');
      }
      
      if (!response.user) {
        throw new Error('No se recibieron los datos del usuario');
      }
      
      // Ensure we have required user data
      if (!response.user.id) {
        console.error('Datos de usuario incompletos - Falta ID:', response.user);
        throw new Error('Datos de usuario incompletos');
      }
      
      if (!response.user.email) {
        console.error('Datos de usuario incompletos - Falta email:', response.user);
        throw new Error('Se requiere una dirección de correo electrónico');
      }
      
      console.log('Guardando datos de autenticación...');
      // Save to localStorage first
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Then update state
      setToken(response.token);
      setUser(response.user);
      
      return response.user;
      
    } catch (error) {
      console.error('Error logging in:', error);
      // Clear authentication data in case of error
      clearAuthData(setUser, setToken);
      const errorMessage = error.response?.data?.message || error.message || 'Error logging in. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to clear auth state
  const clearAuth = useCallback((redirectToLogin = true) => {
    clearAuthData(setUser, setToken);
    if (redirectToLogin && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  // Function to logout
  const logout = useCallback(async (redirectToLogin = true) => {
    try {
      if (token) {
        try {
          await authApi.logout();
        } catch (err) {
          console.error('Error during logout API call:', err);
          // Continue with logout even if API call fails
        }
      }
      clearAuth(redirectToLogin);
      return true;
    } catch (err) {
      console.error('Error in logout function:', err);
      clearAuth(redirectToLogin);
      return false;
    }
  }, [token, clearAuth]);
  
  // Store logout in ref to avoid circular dependency
  logoutRef.current = logout;

  // Check if the user is authenticated
  const isAuthenticated = useCallback(() => {
    // Check if we have a token and user in state
    if (!token || !user || !user.id) {
      // If state is out of sync with localStorage, check there too
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.id) {
            // Update state to match localStorage
            setToken(storedToken);
            setUser(parsedUser);
            return true;
          }
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
      return false;
    }
    
    // Then validate the token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token expired
        logoutRef.current?.(false); // Don't redirect yet
        return false;
      }
      
      // Token is valid
      return true;
    } catch (e) {
      console.error('Token validation error:', e);
      clearAuth(false); // Don't redirect yet
      return false;
    }
  }, [token, user, clearAuth]);

  // Check if the user is an administrator
  const isAdmin = useCallback(() => {
    return user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'superadmin';
  }, [user]);

  // Create the context value with all the required methods
  const contextValue = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    setUser,
    setToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
