import { Model, ModelStats, AvailabilitySlot, ScheduledSession } from '../entities/Model';
import { ModelProfile } from '../entities/ModelProfile';
import { ModelAnalytics } from '../entities/ModelAnalytics';
import { ModelSubscription } from '../entities/ModelSubscription';

export interface ModelRepository {
  // Operaciones básicas del modelo
  getModelById(id: string): Promise<Model | null>;
  updateModel(id: string, data: Partial<Model>): Promise<Model>;
  updateModelStatus(id: string, isOnline: boolean): Promise<void>;
  
  // Gestión de disponibilidad
  getAvailabilitySlots(modelId: string): Promise<AvailabilitySlot[]>;
  addAvailabilitySlot(modelId: string, slot: Omit<AvailabilitySlot, 'id'>): Promise<AvailabilitySlot>;
  updateAvailabilitySlot(modelId: string, slotId: string, updates: Partial<AvailabilitySlot>): Promise<AvailabilitySlot>;
  deleteAvailabilitySlot(modelId: string, slotId: string): Promise<boolean>;
  
  // Sesiones programadas
  getScheduledSessions(modelId: string, status?: string): Promise<ScheduledSession[]>;
  getScheduledSessionById(sessionId: string): Promise<ScheduledSession | null>;
  scheduleSession(session: Omit<ScheduledSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduledSession>;
  updateSessionStatus(sessionId: string, status: string): Promise<ScheduledSession>;
  cancelSession(sessionId: string, reason?: string): Promise<boolean>;
  
  // Perfil del modelo
  getModelProfile(modelId: string): Promise<ModelProfile>;
  updateModelProfile(modelId: string, profile: Partial<ModelProfile>): Promise<ModelProfile>;
  updateSocialLinks(modelId: string, links: any): Promise<ModelProfile>; // Ajustar el tipo según sea necesario
  
  // Estadísticas
  getModelStats(modelId: string): Promise<ModelStats>;
  
  // Analíticas
  getAnalytics(modelId: string, startDate: Date, endDate: Date): Promise<ModelAnalytics>;
  
  // Suscripciones
  getSubscriptionStatus(modelId: string): Promise<ModelSubscription>;
  updateSubscription(modelId: string, updates: Partial<ModelSubscription>): Promise<ModelSubscription>;
  
  // Galería de medios
  getGalleryItems(modelId: string, isPrivate?: boolean): Promise<any[]>; // Ajustar el tipo según sea necesario
  uploadToGallery(modelId: string, file: File, isPrivate?: boolean): Promise<any>;
  deleteGalleryItem(modelId: string, itemId: string): Promise<boolean>;
  
  // Configuración de pagos
  updatePaymentSettings(modelId: string, settings: any): Promise<any>; // Ajustar el tipo según sea necesario
  
  // Configuración de notificaciones
  updateNotificationPreferences(modelId: string, preferences: any): Promise<any>; // Ajustar el tipo según sea necesario
  
  // Verificación
  submitVerification(modelId: string, data: any): Promise<boolean>; // Ajustar el tipo según sea necesario
  getVerificationStatus(modelId: string): Promise<any>; // Ajustar el tipo según sea necesario
}
