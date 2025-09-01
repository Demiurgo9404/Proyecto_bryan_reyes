import axios from 'axios';
import { getAuthToken } from '../utils/auth';

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // No se recibió respuesta del servidor
      return Promise.reject({
        message: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.',
        status: 0,
        isNetworkError: true
      });
    }

    const { status, config, data } = error.response;
    const errorMessage = data?.message || 'Error en la solicitud';
    
    // Crear objeto de error estándar
    const apiError = {
      message: errorMessage,
      status,
      data,
      config
    };

    // Manejar códigos de error específicos
    switch (status) {
      case 401: // No autorizado
        // No hacer nada si es una solicitud de autenticación
        if (config.url.includes('/auth/')) {
          break;
        }
        
        // Limpiar datos de autenticación
        setAuthToken(null);
        localStorage.removeItem('user');
        
        // Solo redirigir si no estamos ya en la página de login
        if (!window.location.pathname.includes('/login')) {
          // Usar replace para evitar que el usuario vuelva atrás a una ruta no autenticada
          window.location.replace('/login');
        }
        break;
        
      case 403: // Prohibido
        console.warn('Acceso denegado:', errorMessage);
        break;
        
      case 500: // Error del servidor
        console.error('Error del servidor:', errorMessage);
        break;
        
      default:
        console.error(`Error HTTP ${status}:`, errorMessage);
    }

    return Promise.reject(apiError);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.put('/auth/me', userData);
    return response.data;
  },
};

// Servicios de publicaciones
export const postService = {
  getFeed: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`);
    return response.data;
  },
  createPost: async (postData) => {
    const formData = new FormData();
    
    // Añadir campos de texto
    Object.keys(postData).forEach(key => {
      if (key !== 'media' && postData[key] !== undefined) {
        formData.append(key, postData[key]);
      }
    });
    
    // Añadir archivos multimedia si existen
    if (postData.media && postData.media.length > 0) {
      postData.media.forEach(file => {
        formData.append('media', file);
      });
    }
    
    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },
  commentPost: async (postId, comment) => {
    const response = await api.post(`/posts/${postId}/comments`, { content: comment });
    return response.data;
  },
  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },
};

// Servicios de historias
export const storyService = {
  getStories: async () => {
    const response = await api.get('/stories');
    return response.data;
  },
  getStory: async (storyId) => {
    const response = await api.get(`/stories/${storyId}`);
    return response.data;
  },
  createStory: async (storyData) => {
    const formData = new FormData();
    formData.append('media', storyData.media);
    if (storyData.caption) {
      formData.append('caption', storyData.caption);
    }
    
    const response = await api.post('/stories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  viewStory: async (storyId) => {
    const response = await api.post(`/stories/${storyId}/view`);
    return response.data;
  },
};

// Servicios de usuario
export const userService = {
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },
  unfollowUser: async (userId) => {
    const response = await api.post(`/users/${userId}/unfollow`);
    return response.data;
  },
  getFollowers: async (userId, page = 1, limit = 20) => {
    const response = await api.get(
      `/users/${userId}/followers?page=${page}&limit=${limit}`
    );
    return response.data;
  },
  getFollowing: async (userId, page = 1, limit = 20) => {
    const response = await api.get(
      `/users/${userId}/following?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

// Servicios de notificaciones
export const notificationService = {
  getNotifications: async (page = 1, limit = 20) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  },
  
  markAsRead: async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      
      const response = await api.patch(
        `/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error al marcar la notificación ${notificationId} como leída:`, error);
      throw error;
    }
  },
  
  markAllAsRead: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      
      const response = await api.patch(
        '/notifications/read-all',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  },
};

export default api;
