import { useState, useEffect, useCallback } from 'react';
import { ModelService } from '../../application/services/ModelService';
import { Model } from '../../domain/entities/Model';
import { ModelProfile } from '../../domain/entities/ModelProfile';
import { ModelAnalytics } from '../../domain/entities/ModelAnalytics';
import { AvailabilitySlot, ScheduledSession } from '../../domain/entities/Model';

/**
 * Hook personalizado para acceder a los servicios del modelo
 * Proporciona métodos para interactuar con la API del modelo y maneja el estado de carga y error
 */
export function useModelService() {
  const [modelService] = useState(() => new ModelService());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Función genérica para manejar operaciones asíncronas
  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    successCallback?: (result: T) => void,
    errorCallback?: (error: Error) => void
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      if (successCallback) successCallback(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      if (errorCallback) {
        errorCallback(error);
      } else {
        console.error('Error en useModelService:', error);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Operaciones del modelo
  const getModel = useCallback((modelId: string) => 
    withLoading<Model | null>(() => modelService.getModel(modelId))
  , [withLoading, modelService]);

  // Operaciones del perfil
  const getModelProfile = useCallback((modelId: string) => 
    withLoading<ModelProfile>(() => modelService.getModelProfile(modelId))
  , [withLoading, modelService]);

  const updateModelProfile = useCallback((modelId: string, profile: Partial<ModelProfile>) => 
    withLoading<ModelProfile>(() => modelService.updateModelProfile(modelId, profile))
  , [withLoading, modelService]);

  // Operaciones de disponibilidad
  const getAvailabilitySlots = useCallback((modelId: string) => 
    withLoading<AvailabilitySlot[]>(() => modelService.getAvailabilitySlots(modelId))
  , [withLoading, modelService]);

  const addAvailabilitySlot = useCallback((modelId: string, slot: Omit<AvailabilitySlot, 'id'>) => 
    withLoading<AvailabilitySlot>(() => modelService.addAvailabilitySlot(modelId, slot))
  , [withLoading, modelService]);

  const updateAvailabilitySlot = useCallback((
    modelId: string, 
    slotId: string, 
    updates: Partial<AvailabilitySlot>
  ) => 
    withLoading<AvailabilitySlot>(() => 
      modelService.updateAvailabilitySlot(modelId, slotId, updates)
    )
  , [withLoading, modelService]);

  const deleteAvailabilitySlot = useCallback((modelId: string, slotId: string) => 
    withLoading<boolean>(() => modelService.deleteAvailabilitySlot(modelId, slotId))
  , [withLoading, modelService]);

  // Operaciones de sesiones
  const getScheduledSessions = useCallback((modelId: string, status?: string) => 
    withLoading<ScheduledSession[]>(() => modelService.getScheduledSessions(modelId, status))
  , [withLoading, modelService]);

  const scheduleSession = useCallback((session: Omit<ScheduledSession, 'id' | 'createdAt' | 'updatedAt'>) => 
    withLoading<ScheduledSession>(() => modelService.scheduleSession(session))
  , [withLoading, modelService]);

  const updateSessionStatus = useCallback((sessionId: string, status: string) => 
    withLoading<ScheduledSession>(() => modelService.updateSessionStatus(sessionId, status))
  , [withLoading, modelService]);

  const cancelSession = useCallback((sessionId: string, reason?: string) => 
    withLoading<boolean>(() => modelService.cancelSession(sessionId, reason))
  , [withLoading, modelService]);

  // Operaciones de analíticas
  const getAnalytics = useCallback((modelId: string, startDate?: Date, endDate?: Date) => 
    withLoading<ModelAnalytics>(() => modelService.getAnalytics(modelId, startDate, endDate))
  , [withLoading, modelService]);

  // Operaciones de galería
  const getGalleryItems = useCallback((modelId: string, isPrivate?: boolean) => 
    withLoading<any[]>(() => modelService.getGalleryItems(modelId, isPrivate))
  , [withLoading, modelService]);

  const uploadToGallery = useCallback((modelId: string, file: File, isPrivate: boolean = false) => 
    withLoading<any>(() => modelService.uploadToGallery(modelId, file, isPrivate))
  , [withLoading, modelService]);

  const deleteGalleryItem = useCallback((modelId: string, itemId: string) => 
    withLoading<boolean>(() => modelService.deleteGalleryItem(modelId, itemId))
  , [withLoading, modelService]);

  // Operaciones de suscripción
  const getSubscriptionStatus = useCallback((modelId: string) => 
    withLoading<any>(() => modelService.getSubscriptionStatus(modelId))
  , [withLoading, modelService]);

  const updateSubscription = useCallback((modelId: string, updates: any) => 
    withLoading<any>(() => modelService.updateSubscription(modelId, updates))
  , [withLoading, modelService]);

  // Operaciones de verificación
  const submitVerification = useCallback((modelId: string, data: any) => 
    withLoading<boolean>(() => modelService.submitVerification(modelId, data))
  , [withLoading, modelService]);

  const getVerificationStatus = useCallback((modelId: string) => 
    withLoading<any>(() => modelService.getVerificationStatus(modelId))
  , [withLoading, modelService]);

  // Configuración de pagos
  const updatePaymentSettings = useCallback((modelId: string, settings: any) => 
    withLoading<any>(() => modelService.updatePaymentSettings(modelId, settings))
  , [withLoading, modelService]);

  // Preferencias de notificación
  const updateNotificationPreferences = useCallback((modelId: string, preferences: any) => 
    withLoading<any>(() => modelService.updateNotificationPreferences(modelId, preferences))
  , [withLoading, modelService]);

  return {
    // Estado
    loading,
    error,
    clearError: () => setError(null),
    
    // Operaciones del modelo
    getModel,
    
    // Perfil
    getModelProfile,
    updateModelProfile,
    
    // Disponibilidad
    getAvailabilitySlots,
    addAvailabilitySlot,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    
    // Sesiones
    getScheduledSessions,
    scheduleSession,
    updateSessionStatus,
    cancelSession,
    
    // Analíticas
    getAnalytics,
    
    // Galería
    getGalleryItems,
    uploadToGallery,
    deleteGalleryItem,
    
    // Suscripción
    getSubscriptionStatus,
    updateSubscription,
    
    // Verificación
    submitVerification,
    getVerificationStatus,
    
    // Configuración
    updatePaymentSettings,
    updateNotificationPreferences,
  };
}

export default useModelService;
