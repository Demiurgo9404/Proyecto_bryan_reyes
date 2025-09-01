import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { modelService } from '../api';
import { isAuthenticated } from '../utils/auth';

const ModelContext = createContext();

export const ModelProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const navigate = useNavigate();

  // Cargar el perfil de la modelo
  const loadProfile = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await modelService.getProfile();
      setProfile(data);
      setIsOnline(data.status === 'online');
      
      // Cargar datos adicionales en paralelo
      await Promise.all([
        loadGallery(),
        loadReviews(),
        loadStatistics(),
      ]);
      
    } catch (err) {
      console.error('Error al cargar el perfil:', err);
      setError('No se pudo cargar el perfil. Por favor, inténtalo de nuevo.');
      if (err.response?.status === 401) {
        // Token inválido o expirado
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar la galería de fotos
  const loadGallery = async () => {
    try {
      const data = await modelService.getGallery();
      setGallery(data);
    } catch (err) {
      console.error('Error al cargar la galería:', err);
      toast.error('No se pudo cargar la galería');
    }
  };

  // Cargar reseñas
  const loadReviews = async () => {
    try {
      const data = await modelService.getReviews();
      setReviews(data);
    } catch (err) {
      console.error('Error al cargar las reseñas:', err);
      toast.error('No se pudieron cargar las reseñas');
    }
  };

  // Cargar estadísticas
  const loadStatistics = async () => {
    try {
      const data = await modelService.getStatistics('week');
      setStatistics(data);
    } catch (err) {
      console.error('Error al cargar las estadísticas:', err);
      // No mostramos error al usuario para no interrumpir la experiencia
    }
  };

  // Actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      const updatedProfile = await modelService.updateProfile(profileData);
      setProfile(prev => ({
        ...prev,
        ...updatedProfile
      }));
      toast.success('Perfil actualizado correctamente');
      return updatedProfile;
    } catch (err) {
      console.error('Error al actualizar el perfil:', err);
      toast.error('No se pudo actualizar el perfil');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Subir imagen de perfil
  const uploadProfileImage = async (file) => {
    try {
      setIsLoading(true);
      const data = await modelService.uploadProfileImage(file);
      
      setProfile(prev => ({
        ...prev,
        profileImage: data.imageUrl
      }));
      
      toast.success('Imagen de perfil actualizada');
      return data.imageUrl;
    } catch (err) {
      console.error('Error al subir la imagen:', err);
      toast.error('No se pudo subir la imagen');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar estado de disponibilidad
  const updateAvailability = async (status) => {
    try {
      setIsLoading(true);
      await modelService.updateAvailability(status);
      
      setProfile(prev => ({
        ...prev,
        status
      }));
      
      setIsOnline(status === 'online');
      toast.success(`Estado actualizado a ${status === 'online' ? 'en línea' : status === 'busy' ? 'ocupada' : 'desconectada'}`);
    } catch (err) {
      console.error('Error al actualizar la disponibilidad:', err);
      toast.error('No se pudo actualizar el estado');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar imágenes a la galería
  const addToGallery = async (files) => {
    try {
      setIsLoading(true);
      const newImages = await modelService.addToGallery(files);
      
      setGallery(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length > 1 ? 'Imágenes' : 'Imagen'} agregada${newImages.length > 1 ? 's' : ''} a la galería`);
      return newImages;
    } catch (err) {
      console.error('Error al agregar imágenes a la galería:', err);
      toast.error('No se pudieron agregar las imágenes');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar imagen de la galería
  const removeFromGallery = async (imageId) => {
    try {
      setIsLoading(true);
      await modelService.removeFromGallery(imageId);
      
      setGallery(prev => prev.filter(img => img.id !== imageId));
      toast.success('Imagen eliminada de la galería');
    } catch (err) {
      console.error('Error al eliminar la imagen:', err);
      toast.error('No se pudo eliminar la imagen');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (isAuthenticated()) {
      loadProfile();
    }
  }, []);

  return (
    <ModelContext.Provider
      value={{
        profile,
        isLoading,
        error,
        isOnline,
        gallery,
        reviews,
        statistics,
        loadProfile,
        updateProfile,
        uploadProfileImage,
        updateAvailability,
        addToGallery,
        removeFromGallery,
        loadGallery,
        loadReviews,
        loadStatistics,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel debe usarse dentro de un ModelProvider');
  }
  return context;
};

export default ModelContext;
