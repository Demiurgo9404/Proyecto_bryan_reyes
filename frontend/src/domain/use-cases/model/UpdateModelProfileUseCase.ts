import { ModelProfile } from '../../entities/ModelProfile';
import { ModelRepository } from '../../repositories/ModelRepository';

export class UpdateModelProfileUseCase {
  constructor(private modelRepository: ModelRepository) {}

  async execute(modelId: string, profile: Partial<ModelProfile>): Promise<ModelProfile> {
    try {
      return await this.modelRepository.updateModelProfile(modelId, profile);
    } catch (error) {
      console.error('Error updating model profile:', error);
      throw new Error('Could not update model profile');
    }
  }
}
