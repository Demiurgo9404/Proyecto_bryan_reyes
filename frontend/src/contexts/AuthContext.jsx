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
    let isMounted = true;
    
    const init = async () => {
      if (!isMounted) return;
      
      console.log('[Auth] Iniciando verificación de autenticación...');
      setLoading(true);
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      console.log('[Auth] Datos almacenados:', { 
        hasToken: !!storedToken, 
        hasUser: !!storedUser,
        user: storedUser ? JSON.parse(storedUser) : null
      });
      
      // If no token, clear everything and stop
      if (!storedToken) {
        console.log('[Auth] No se encontró token, limpiando datos de autenticación');
        clearAuthData(setUser, setToken);
        setLoading(false);
        return;
      }
      
      try {
        console.log('[Auth] Verificando token con el servidor...');
        // Try to get fresh user data
        const me = await authApi.getMe(storedToken);
        console.log('[Auth] Respuesta de verificación de token:', me);
        
        const meUser = me?.data || me?.user || me;
        
        if (meUser?.id) {
          console.log('[Auth] Usuario autenticado correctamente:', {
            id: meUser.id,
            email: meUser.email,
            role: meUser.role
          });
          
          if (isMounted) {
            setUser(meUser);
            setToken(storedToken);
            localStorage.setItem('user', JSON.stringify(meUser));
            console.log('[Auth] Estado de autenticación actualizado');
          }
          return;
        }
        
        throw new Error('Datos de usuario inválidos recibidos del servidor');
      } catch (error) {
        console.error('[Auth] Error al verificar autenticación:', error);
        if (isMounted) {
          console.log('[Auth] Limpiando datos de autenticación debido a error');
          clearAuthData(setUser, setToken);
        }
      } finally {
        if (isMounted) {
          console.log('[Auth] Finalizando verificación de autenticación');
          setLoading(false);
        }
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Function to login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[Auth] Enviando credenciales al servidor...');
      const response = await authApi.login(email, password);
      console.log('[Auth] Respuesta del servidor:', response);
      
      // Extraer token y datos del usuario de la respuesta
      const authToken = response.token;
      let userData = response.user;
      
      if (!authToken) {
        console.error('[Auth] No se recibió token en la respuesta:', response);
        throw new Error('No se pudo obtener el token de autenticación');
      }
      
      if (!userData) {
        console.error('[Auth] No se recibieron datos del usuario:', response);
        throw new Error('No se pudieron obtener los datos del usuario');
      }
      
      // Asegurarse de que userData es un objeto
      if (typeof userData !== 'object' || userData === null) {
        console.warn('[Auth] Los datos del usuario no son un objeto válido, creando uno nuevo');
        userData = { email };
      }
      
      // Asegurar campos requeridos
      if (!userData.role) {
        console.warn('[Auth] No se especificó un rol para el usuario, usando valor por defecto');
        userData.role = 'user'; // Valor por defecto
      }
      
      // Para el rol 'model', asegurar campos requeridos
      if (userData.role === 'model') {
        userData.is_active = userData.is_active !== false; // true si no está definido
        userData.is_verified = userData.is_verified !== false; // true si no está definido
      }
      
      console.log('[Auth] Datos del usuario después del procesamiento:', {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        is_verified: userData.is_verified,
        is_active: userData.is_active
      });
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Actualizar el estado
      setToken(authToken);
      setUser(userData);
      
      console.log('[Auth] Login exitoso para el usuario:', {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        is_verified: userData.is_verified,
        is_active: userData.is_active
      });
      
      // Devolver los datos del usuario
      return { 
        success: true, 
        user: userData, 
        token: authToken 
      };
      
    } catch (error) {
      console.error('Error en el login:', error);
      const errorMessage = error.message || 'Error al iniciar sesión. Por favor verifica tus credenciales.';
      setError(errorMessage);
      // Clear any partial state on error
      clearAuthData(setUser, setToken);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setToken, setUser]);

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
  const isAuthenticated = useCallback(async (checkExpiration = true) => {
    console.log('[Auth] Verificando autenticación...');
    
    // Si ya estamos cargando, retornar el estado actual
    if (loading) {
      console.log('[Auth] Verificación en progreso, omitiendo...');
      return !!user && !!token;
    }

    // Verificar si ya tenemos un usuario y token en el estado
    if (token && user?.id) {
      console.log('[Auth] Usuario encontrado en el estado');
      
      if (checkExpiration) {
        try {
          // Verificar token
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('[Auth] Payload del token:', payload);
          
          // Verificar expiración
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            console.warn('[Auth] Token expirado');
            await logoutRef.current?.(false);
            return false;
          }
          
          // Verificar estado del usuario
          if (user.is_active === false) {
            console.warn('[Auth] Usuario inactivo');
            await logoutRef.current?.(false);
            return false;
          }
          
          if (user.is_verified === false) {
            console.warn('[Auth] Usuario no verificado');
            return false;
          }
          
          console.log('[Auth] Usuario autenticado correctamente');
          return true;
          
        } catch (e) {
          console.error('[Auth] Error validando token del estado:', e);
          // Continuar con la verificación del localStorage
        }
      } else {
        return true;
      }
    }
    
    // Si no hay token en el estado, verificar localStorage
    console.log('[Auth] No se encontró usuario en el estado, revisando localStorage...');
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!storedToken || !storedUser) {
      console.log('[Auth] No se encontró token o usuario en localStorage');
      // Limpiar cualquier estado parcial si localStorage está vacío
      if (token || user) {
        console.log('[Auth] Limpiando estado de autenticación...');
        clearAuthData(setUser, setToken);
      }
      return false;
    }
    
    // Validar token desde localStorage
    if (checkExpiration) {
      try {
        console.log('[Auth] Validando token de localStorage...');
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        console.log('[Auth] Payload del token (localStorage):', payload);
        
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.warn('[Auth] Token de localStorage expirado');
          await logoutRef.current?.(false);
          return false;
        }
        
        // Actualizar el estado con los datos del localStorage
        const userData = JSON.parse(storedUser);
        
        // Verificar que el usuario esté activo y verificado
        if (userData.is_active === false) {
          console.warn('[Auth] Usuario inactivo (desde localStorage)');
          await logoutRef.current?.(false);
          return false;
        }
        
        if (userData.is_verified === false) {
          console.warn('[Auth] Usuario no verificado (desde localStorage)');
          return false;
        }
        
        // Actualizar el estado con los datos del localStorage
        setToken(storedToken);
        setUser(userData);
        
        console.log('[Auth] Usuario autenticado desde localStorage');
        return true;
        
      } catch (e) {
        console.error('[Auth] Error validando token de localStorage:', e);
        await logoutRef.current?.(false);
        return false;
      }
    }
    
    // Update state with data from localStorage
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.id) {
        // Use setTimeout to avoid state updates during render
        setTimeout(() => {
          setToken(storedToken);
          setUser(parsedUser);
        }, 0);
        return true;
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
    
    // If we get here, something is wrong with the stored data
    logoutRef.current?.(false);
    return false;
  }, [token, user]);

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
