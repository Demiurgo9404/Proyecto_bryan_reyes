import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configuración de axios para incluir el token de autenticación
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
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

const modelService = {
  // Obtener perfil de la modelo actual
  async getProfile() {
    try {
      const response = await api.get('/models/profile');
      return response.data;
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      throw error;
    }
  },

  // Actualizar perfil
  async updateProfile(profileData) {
    try {
      const response = await api.put('/models/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      throw error;
    }
  },

  // Subir imagen de perfil
  async uploadProfileImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/models/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  },

  // Gestionar galería de fotos
  async getGallery() {
    try {
      const response = await api.get('/models/gallery');
      return response.data;
    } catch (error) {
      console.error('Error al obtener la galería:', error);
      throw error;
    }
  },

  async addToGallery(files) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      const response = await api.post('/models/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al subir imágenes a la galería:', error);
      throw error;
    }
  },

  async removeFromGallery(imageId) {
    try {
      const response = await api.delete(`/models/gallery/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      throw error;
    }
  },

  // Obtener reseñas
  async getReviews(params = {}) {
    try {
      const response = await api.get('/models/reviews', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener las reseñas:', error);
      throw error;
    }
  },

  // Configuración de video llamadas
  async getVideoCallSettings() {
    try {
      const response = await api.get('/models/video-call/settings');
      return response.data;
    } catch (error) {
      console.error('Error al obtener la configuración de video llamadas:', error);
      throw error;
    }
  },

  async updateVideoCallSettings(settings) {
    try {
      const response = await api.put('/models/video-call/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la configuración de video llamadas:', error);
      throw error;
    }
  },

  // Actualizar estado de disponibilidad
  async updateAvailability(status) {
    try {
      const response = await api.patch('/models/availability', { status });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la disponibilidad:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  async getStatistics(period = 'week') {
    try {
      const response = await api.get(`/models/statistics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener las estadísticas:', error);
      throw error;
    }
  },
};

export default modelService;
