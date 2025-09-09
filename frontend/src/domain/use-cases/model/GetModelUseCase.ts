import { Model } from '../../entities/Model';
import { ModelRepository } from '../../repositories/ModelRepository';

export class GetModelUseCase {
  constructor(private modelRepository: ModelRepository) {}

  async execute(id: string): Promise<Model | null> {
    try {
      return await this.modelRepository.getModelById(id);
    } catch (error) {
      console.error('Error fetching model:', error);
      throw new Error('Could not fetch model');
    }
  }
}
