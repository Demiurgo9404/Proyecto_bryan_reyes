import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Authentication error - redirecting to login');
      // You might want to redirect to login here
    } else if (error.response?.status === 500) {
      console.error('Server error (500) - please try again later');
      // You might want to show a user-friendly message
    }
    
    return Promise.reject(error);
  }
);

// Servicios de usuario
export const userService = {
  // Obtener todos los usuarios
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    try {
      console.log(`[userService] Fetching user with ID: ${id}`);
      const response = await api.get(`/users/${id}`);
      console.log('[userService] User data response:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Return the data part of the response
      return response.data;
    } catch (error) {
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        responseData: error.response?.data
      };
      
      console.error('[userService] Error fetching user:', errorDetails);
      
      // If we have a response from the server, use its error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      // Otherwise use a generic error message
      throw new Error('Error al cargar los datos del usuario');
    }
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Obtener estadísticas del usuario
  getUserStats: async (userId) => {
    try {
      console.log(`Fetching stats for user ID: ${userId}`);
      const response = await api.get(`/users/${userId}/stats`);
      console.log('User stats response:', response);
      if (!response.data) {
        throw new Error('No stats data received from server');
      }
      return response;
    } catch (error) {
      console.error('Error fetching user stats:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `/users/${userId}/stats`
      });
      throw error;
    }
  },

  // Obtener historial de transacciones
  getUserTransactions: async (userId) => {
    try {
      console.log(`Fetching transactions for user ID: ${userId}`);
      const response = await api.get(`/users/${userId}/transactions`);
      console.log('User transactions response:', response);
      if (!response.data) {
        throw new Error('No transactions data received from server');
      }
      return response;
    } catch (error) {
      console.error('Error fetching user transactions:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `/users/${userId}/transactions`
      });
      throw error;
    }
  },

  // Obtener historial de actividad
  getUserActivity: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/activity`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }
};

export default api;
