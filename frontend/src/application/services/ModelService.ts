import { Model } from '../../domain/entities/Model';
import { ModelProfile } from '../../domain/entities/ModelProfile';
import { ModelAnalytics } from '../../domain/entities/ModelAnalytics';
import { AvailabilitySlot, ScheduledSession } from '../../domain/entities/Model';
import { ModelRepository } from '../../domain/repositories/ModelRepository';
import { GetModelUseCase } from '../../domain/use-cases/model/GetModelUseCase';
import { UpdateModelProfileUseCase } from '../../domain/use-cases/model/UpdateModelProfileUseCase';
import { ManageAvailabilitySlotsUseCase } from '../../domain/use-cases/model/ManageAvailabilitySlotsUseCase';
import { ManageSessionsUseCase } from '../../domain/use-cases/model/ManageSessionsUseCase';
import { GetModelAnalyticsUseCase } from '../../domain/use-cases/model/GetModelAnalyticsUseCase';
import { createModelRepository } from '../../infrastructure/repositories/ModelRepository';

export class ModelService {
  private modelRepository: ModelRepository;
  
  // Use cases
  private getModelUseCase: GetModelUseCase;
  private updateModelProfileUseCase: UpdateModelProfileUseCase;
  private manageAvailabilitySlotsUseCase: ManageAvailabilitySlotsUseCase;
  private manageSessionsUseCase: ManageSessionsUseCase;
  private getModelAnalyticsUseCase: GetModelAnalyticsUseCase;

  constructor(repository?: ModelRepository) {
    this.modelRepository = repository || createModelRepository();
    
    // Initialize use cases
    this.getModelUseCase = new GetModelUseCase(this.modelRepository);
    this.updateModelProfileUseCase = new UpdateModelProfileUseCase(this.modelRepository);
    this.manageAvailabilitySlotsUseCase = new ManageAvailabilitySlotsUseCase(this.modelRepository);
    this.manageSessionsUseCase = new ManageSessionsUseCase(this.modelRepository);
    this.getModelAnalyticsUseCase = new GetModelAnalyticsUseCase(this.modelRepository);
  }

  // Model operations
  async getModel(modelId: string): Promise<Model | null> {
    return this.getModelUseCase.execute(modelId);
  }

  // Profile operations
  async getModelProfile(modelId: string): Promise<ModelProfile> {
    return this.modelRepository.getModelProfile(modelId);
  }

  async updateModelProfile(
    modelId: string, 
    profile: Partial<ModelProfile>
  ): Promise<ModelProfile> {
    return this.updateModelProfileUseCase.execute(modelId, profile);
  }

  // Availability slots operations
  async getAvailabilitySlots(modelId: string): Promise<AvailabilitySlot[]> {
    return this.manageAvailabilitySlotsUseCase.getSlots(modelId);
  }

  async addAvailabilitySlot(
    modelId: string, 
    slot: Omit<AvailabilitySlot, 'id'>
  ): Promise<AvailabilitySlot> {
    return this.manageAvailabilitySlotsUseCase.addSlot(modelId, slot);
  }

  async updateAvailabilitySlot(
    modelId: string, 
    slotId: string, 
    updates: Partial<AvailabilitySlot>
  ): Promise<AvailabilitySlot> {
    return this.manageAvailabilitySlotsUseCase.updateSlot(modelId, slotId, updates);
  }

  async deleteAvailabilitySlot(modelId: string, slotId: string): Promise<boolean> {
    return this.manageAvailabilitySlotsUseCase.deleteSlot(modelId, slotId);
  }

  // Sessions operations
  async getScheduledSessions(
    modelId: string, 
    status?: string
  ): Promise<ScheduledSession[]> {
    return this.manageSessionsUseCase.getSessions(modelId, status as any);
  }

  async scheduleSession(
    session: Omit<ScheduledSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ScheduledSession> {
    return this.manageSessionsUseCase.scheduleSession(session);
  }

  async updateSessionStatus(
    sessionId: string, 
    status: string
  ): Promise<ScheduledSession> {
    return this.manageSessionsUseCase.updateSessionStatus(sessionId, status as any);
  }

  async cancelSession(sessionId: string, reason?: string): Promise<boolean> {
    return this.manageSessionsUseCase.cancelSession(sessionId, reason);
  }

  // Analytics operations
  async getAnalytics(
    modelId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<ModelAnalytics> {
    return this.getModelAnalyticsUseCase.execute(modelId, startDate, endDate);
  }

  async getModelAnalytics(modelId: string): Promise<ModelAnalytics> {
    return this.getModelAnalyticsUseCase.execute(modelId);
  }

  async getModelStats(modelId: string): Promise<{
    totalEarnings: number;
    totalSessions: number;
    averageRating: number;
    upcomingSessions: number;
  }> {
    const analytics = await this.getModelAnalyticsUseCase.execute(modelId);
    const sessions = await this.manageSessionsUseCase.getSessions(modelId);
    
    return {
      totalEarnings: analytics.totalEarnings || 0,
      totalSessions: analytics.totalSessions || 0,
      averageRating: analytics.averageRating || 0,
      upcomingSessions: sessions.filter(s => s.status === 'scheduled' || s.status === 'upcoming').length
    };
  }

  // Gallery operations
  async getGalleryItems(modelId: string, isPrivate?: boolean): Promise<any[]> {
    return this.modelRepository.getGalleryItems(modelId, isPrivate);
  }

  async uploadToGallery(
    modelId: string, 
    file: File, 
    isPrivate: boolean = false
  ): Promise<any> {
    return this.modelRepository.uploadToGallery(modelId, file, isPrivate);
  }

  async deleteGalleryItem(modelId: string, itemId: string): Promise<boolean> {
    return this.modelRepository.deleteGalleryItem(modelId, itemId);
  }

  // Subscription operations
  async getSubscriptionStatus(modelId: string): Promise<any> {
    return this.modelRepository.getSubscriptionStatus(modelId);
  }

  async updateSubscription(
    modelId: string, 
    updates: any
  ): Promise<any> {
    return this.modelRepository.updateSubscription(modelId, updates);
  }

  // Verification operations
  async submitVerification(modelId: string, data: any): Promise<boolean> {
    return this.modelRepository.submitVerification(modelId, data);
  }

  async getVerificationStatus(modelId: string): Promise<any> {
    return this.modelRepository.getVerificationStatus(modelId);
  }

  // Payment settings
  async updatePaymentSettings(modelId: string, settings: any): Promise<any> {
    return this.modelRepository.updatePaymentSettings(modelId, settings);
  }

  // Notification preferences
  async updateNotificationPreferences(
    modelId: string, 
    preferences: any
  ): Promise<any> {
    return this.modelRepository.updateNotificationPreferences(modelId, preferences);
  }
}
