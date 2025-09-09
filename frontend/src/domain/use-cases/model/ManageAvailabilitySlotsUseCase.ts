import { AvailabilitySlot } from '../../entities/Model';
import { ModelRepository } from '../../repositories/ModelRepository';

export class ManageAvailabilitySlotsUseCase {
  constructor(private modelRepository: ModelRepository) {}

  async getSlots(modelId: string): Promise<AvailabilitySlot[]> {
    try {
      return await this.modelRepository.getAvailabilitySlots(modelId);
    } catch (error) {
      console.error('Error fetching availability slots:', error);
      throw new Error('Could not fetch availability slots');
    }
  }

  async addSlot(modelId: string, slot: Omit<AvailabilitySlot, 'id'>): Promise<AvailabilitySlot> {
    try {
      // Validar que el slot no se solape con otros existentes
      const slots = await this.modelRepository.getAvailabilitySlots(modelId);
      
      // Verificar superposición de horarios (implementación básica)
      const isOverlapping = slots.some(existingSlot => 
        existingSlot.dayOfWeek === slot.dayOfWeek &&
        ((slot.startTime >= existingSlot.startTime && slot.startTime < existingSlot.endTime) ||
         (slot.endTime > existingSlot.startTime && slot.endTime <= existingSlot.endTime))
      );

      if (isOverlapping) {
        throw new Error('El horario se superpone con otro slot existente');
      }

      return await this.modelRepository.addAvailabilitySlot(modelId, slot);
    } catch (error) {
      console.error('Error adding availability slot:', error);
      throw error instanceof Error ? error : new Error('Could not add availability slot');
    }
  }

  async updateSlot(
    modelId: string, 
    slotId: string, 
    updates: Partial<AvailabilitySlot>
  ): Promise<AvailabilitySlot> {
    try {
      return await this.modelRepository.updateAvailabilitySlot(modelId, slotId, updates);
    } catch (error) {
      console.error('Error updating availability slot:', error);
      throw new Error('Could not update availability slot');
    }
  }

  async deleteSlot(modelId: string, slotId: string): Promise<boolean> {
    try {
      return await this.modelRepository.deleteAvailabilitySlot(modelId, slotId);
    } catch (error) {
      console.error('Error deleting availability slot:', error);
      throw new Error('Could not delete availability slot');
    }
  }
}
