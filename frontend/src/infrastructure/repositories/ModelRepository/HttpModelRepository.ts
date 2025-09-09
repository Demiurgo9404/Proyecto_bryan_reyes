import { Model, ModelStats, AvailabilitySlot, ScheduledSession } from '../../../domain/entities/Model';
import { ModelProfile } from '../../../domain/entities/ModelProfile';
import { ModelAnalytics } from '../../../domain/entities/ModelAnalytics';
import { ModelSubscription } from '../../../domain/entities/ModelSubscription';
import { ModelRepository } from '../../../domain/repositories/ModelRepository';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class HttpModelRepository implements ModelRepository {
  private async fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      const token = localStorage.getItem('token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error en la solicitud: ${response.status} ${response.statusText}`
        }));
        throw new Error(errorData.message || 'Error en la solicitud al servidor');
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return undefined as any;
      }

      return await response.json();
    } catch (error) {
      console.error('Error en fetchJson:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de red al conectar con el servidor');
    }
  }

  // Operaciones básicas del modelo
  async getModelById(id: string): Promise<Model | null> {
    return this.fetchJson<Model>(`/models/${id}`);
  }

  async updateModel(id: string, data: Partial<Model>): Promise<Model> {
    return this.fetchJson<Model>(`/models/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateModelStatus(id: string, isOnline: boolean): Promise<void> {
    await this.fetchJson(`/models/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isOnline }),
    });
  }

  // Gestión de disponibilidad
  async getAvailabilitySlots(modelId: string): Promise<AvailabilitySlot[]> {
    return this.fetchJson<AvailabilitySlot[]>(`/models/${modelId}/availability`);
  }

  async addAvailabilitySlot(modelId: string, slot: Omit<AvailabilitySlot, 'id'>): Promise<AvailabilitySlot> {
    return this.fetchJson<AvailabilitySlot>(`/models/${modelId}/availability`, {
      method: 'POST',
      body: JSON.stringify(slot),
    });
  }

  async updateAvailabilitySlot(
    modelId: string, 
    slotId: string, 
    updates: Partial<AvailabilitySlot>
  ): Promise<AvailabilitySlot> {
    return this.fetchJson<AvailabilitySlot>(`/models/${modelId}/availability/${slotId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteAvailabilitySlot(modelId: string, slotId: string): Promise<boolean> {
    await this.fetchJson(`/models/${modelId}/availability/${slotId}`, {
      method: 'DELETE',
    });
    return true;
  }

  // Sesiones programadas
  async getScheduledSessions(modelId: string, status?: string): Promise<ScheduledSession[]> {
    const url = status 
      ? `/models/${modelId}/sessions?status=${status}`
      : `/models/${modelId}/sessions`;
    
    return this.fetchJson<ScheduledSession[]>(url);
  }

  async getScheduledSessionById(sessionId: string): Promise<ScheduledSession | null> {
    return this.fetchJson<ScheduledSession>(`/sessions/${sessionId}`);
  }

  async scheduleSession(
    session: Omit<ScheduledSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ScheduledSession> {
    return this.fetchJson<ScheduledSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  async updateSessionStatus(sessionId: string, status: string): Promise<ScheduledSession> {
    return this.fetchJson<ScheduledSession>(`/sessions/${sessionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async cancelSession(sessionId: string, reason?: string): Promise<boolean> {
    await this.fetchJson(`/sessions/${sessionId}`, {
      method: 'DELETE',
      body: reason ? JSON.stringify({ reason }) : undefined,
    });
    return true;
  }

  // Perfil del modelo
  async getModelProfile(modelId: string): Promise<ModelProfile> {
    return this.fetchJson<ModelProfile>(`/models/${modelId}/profile`);
  }

  async updateModelProfile(modelId: string, profile: Partial<ModelProfile>): Promise<ModelProfile> {
    return this.fetchJson<ModelProfile>(`/models/${modelId}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(profile),
    });
  }

  async updateSocialLinks(modelId: string, links: any): Promise<ModelProfile> {
    return this.fetchJson<ModelProfile>(`/models/${modelId}/social-links`, {
      method: 'PATCH',
      body: JSON.stringify(links),
    });
  }

  // Estadísticas
  async getModelStats(modelId: string): Promise<ModelStats> {
    return this.fetchJson<ModelStats>(`/models/${modelId}/stats`);
  }

  // Analíticas
  async getAnalytics(
    modelId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<ModelAnalytics> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    
    return this.fetchJson<ModelAnalytics>(`/models/${modelId}/analytics?${params}`);
  }

  // Suscripciones
  async getSubscriptionStatus(modelId: string): Promise<ModelSubscription> {
    return this.fetchJson<ModelSubscription>(`/models/${modelId}/subscription`);
  }

  async updateSubscription(
    modelId: string, 
    updates: Partial<ModelSubscription>
  ): Promise<ModelSubscription> {
    return this.fetchJson<ModelSubscription>(`/models/${modelId}/subscription`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Galería de medios
  async getGalleryItems(modelId: string, isPrivate?: boolean): Promise<any[]> {
    const url = isPrivate !== undefined
      ? `/models/${modelId}/gallery?isPrivate=${isPrivate}`
      : `/models/${modelId}/gallery`;
    
    return this.fetchJson<any[]>(url);
  }

  async uploadToGallery(modelId: string, file: File, isPrivate: boolean = false): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrivate', String(isPrivate));

    const response = await fetch(`${API_BASE_URL}/models/${modelId}/gallery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al cargar el archivo');
    }

    return response.json();
  }

  async deleteGalleryItem(modelId: string, itemId: string): Promise<boolean> {
    await this.fetchJson(`/models/${modelId}/gallery/${itemId}`, {
      method: 'DELETE',
    });
    return true;
  }

  // Configuración de pagos
  async updatePaymentSettings(modelId: string, settings: any): Promise<any> {
    return this.fetchJson(`/models/${modelId}/payment-settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  // Configuración de notificaciones
  async updateNotificationPreferences(modelId: string, preferences: any): Promise<any> {
    return this.fetchJson(`/models/${modelId}/notification-preferences`, {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }

  // Verificación
  async submitVerification(modelId: string, data: any): Promise<boolean> {
    const formData = new FormData();
    
    // Agregar campos al formData según la estructura de data
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/models/${modelId}/verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al enviar la verificación');
    }

    return true;
  }

  async getVerificationStatus(modelId: string): Promise<any> {
    return this.fetchJson(`/models/${modelId}/verification`);
  }
}
