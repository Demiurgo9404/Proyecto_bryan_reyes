import { ModelAnalytics } from '../../entities/ModelAnalytics';
import { ModelRepository } from '../../repositories/ModelRepository';

export class GetModelAnalyticsUseCase {
  constructor(private modelRepository: ModelRepository) {}

  async execute(
    modelId: string, 
    startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días por defecto
    endDate: Date = new Date()
  ): Promise<ModelAnalytics> {
    try {
      // Validar fechas
      if (startDate > endDate) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }

      // Obtener datos de analíticas
      const analytics = await this.modelRepository.getAnalytics(modelId, startDate, endDate);
      
      // Aquí podrías agregar lógica adicional, como procesamiento de datos o cálculos adicionales
      
      return analytics;
    } catch (error) {
      console.error('Error fetching model analytics:', error);
      throw error instanceof Error ? error : new Error('Could not fetch model analytics');
    }
  }
}
