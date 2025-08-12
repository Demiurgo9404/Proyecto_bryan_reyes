import axios from 'axios';
import { LoginFormData, RegisterFormData, AuthResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configuración de axios para las peticiones de autenticación
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicio para manejar las peticiones de autenticación
const authService = {
  // Iniciar sesión
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await authApi.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.'
        );
      }
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
    }
  },

  // Registrarse
  async register(userData: RegisterFormData): Promise<AuthResponse> {
    try {
      const response = await authApi.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Error al registrarse. Por favor, inténtalo de nuevo.'
        );
      }
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
    }
  },

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await authApi.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Asegurarse de limpiar el token incluso si hay un error en la petición
    } finally {
      localStorage.removeItem('token');
    }
  },

  // Obtener información del usuario actual
  async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      const response = await authApi.get<{ user: AuthResponse['user'] }>('/auth/me');
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('token');
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error('Error al cargar la información del usuario.');
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

export default authService;
