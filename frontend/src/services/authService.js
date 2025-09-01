import { httpClient } from '../infrastructure/api/httpClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authService = {
  // Iniciar sesión
  async login(email, password) {
    try {
      const response = await httpClient.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.token) {
        // Guardar token y datos del usuario
        httpClient.setAuthToken(response.data.token);
        
        // Guardar refresh token si está presente
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Guardar datos del usuario
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response.data;
      }
      
      throw new Error('No se recibió el token de autenticación');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      this.logout();
      throw error;
    }
  },

  // Cerrar sesión
  logout() {
    // Limpiar tokens y datos del usuario
    httpClient.setAuthToken(null);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirigir al login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // Registrar nuevo usuario
  async register(userData) {
    try {
      const response = await httpClient.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  },

  // Obtener el usuario actual
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      return null;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Obtener el token de autenticación
  getAuthToken() {
    return localStorage.getItem('token');
  },

  // Obtener el token de actualización
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  // Configurar los headers de autenticación
  getAuthHeader() {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Refrescar el token
  async refreshToken() {
    try {
      const token = this.getAuthToken();
      const refreshToken = this.getRefreshToken();
      
      if (!token || !refreshToken) {
        throw new Error('No hay token o token de actualización');
      }
      
      const response = await httpClient.post(`${API_URL}/auth/refresh-token`, {
        token,
        refreshToken
      });
      
      if (response.data.token) {
        // Actualizar el token
        httpClient.setAuthToken(response.data.token);
        
        // Actualizar el refresh token si se proporciona uno nuevo
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Actualizar los datos del usuario si se proporcionan
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response.data.token;
      }
      
      throw new Error('No se pudo refrescar el token');
    } catch (error) {
      console.error('Error al refrescar el token:', error);
      this.logout();
      throw error;
    }
  }
};

export default authService;
