import { ScheduledSession } from '../../entities/Model';
import { ModelRepository } from '../../repositories/ModelRepository';

type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export class ManageSessionsUseCase {
  constructor(private modelRepository: ModelRepository) {}

  async getSessions(modelId: string, status?: SessionStatus): Promise<ScheduledSession[]> {
    try {
      return await this.modelRepository.getScheduledSessions(modelId, status);
    } catch (error) {
      console.error('Error fetching scheduled sessions:', error);
      throw new Error('Could not fetch scheduled sessions');
    }
  }

  async getSessionById(sessionId: string): Promise<ScheduledSession | null> {
    try {
      return await this.modelRepository.getScheduledSessionById(sessionId);
    } catch (error) {
      console.error('Error fetching session:', error);
      throw new Error('Could not fetch session');
    }
  }

  async scheduleSession(session: Omit<ScheduledSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduledSession> {
    try {
      // Validar que la sesión no se solape con otras existentes
      const existingSessions = await this.modelRepository.getScheduledSessions(session.clientId);
      
      const isOverlapping = existingSessions.some(existingSession => 
        (session.startTime >= existingSession.startTime && session.startTime < existingSession.endTime) ||
        (session.endTime > existingSession.startTime && session.endTime <= existingSession.endTime) ||
        (session.startTime <= existingSession.startTime && session.endTime >= existingSession.endTime)
      );

      if (isOverlapping) {
        throw new Error('La sesión se solapa con otra sesión existente');
      }

      return await this.modelRepository.scheduleSession(session);
    } catch (error) {
      console.error('Error scheduling session:', error);
      throw error instanceof Error ? error : new Error('Could not schedule session');
    }
  }

  async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<ScheduledSession> {
    try {
      return await this.modelRepository.updateSessionStatus(sessionId, status);
    } catch (error) {
      console.error('Error updating session status:', error);
      throw new Error('Could not update session status');
    }
  }

  async cancelSession(sessionId: string, reason?: string): Promise<boolean> {
    try {
      // Aquí podrías agregar lógica adicional, como notificar al cliente
      return await this.modelRepository.cancelSession(sessionId, reason);
    } catch (error) {
      console.error('Error cancelling session:', error);
      throw new Error('Could not cancel session');
    }
  }
}
