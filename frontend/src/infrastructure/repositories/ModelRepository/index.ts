import { ModelRepository } from '../../../../domain/repositories/ModelRepository';
import { HttpModelRepository } from './HttpModelRepository';

// Factory function to get the repository implementation
export function createModelRepository(): ModelRepository {
  // In the future, we could add logic here to return different implementations
  // based on environment variables or other conditions
  return new HttpModelRepository();
}

// Default export for convenience
export { HttpModelRepository } from './HttpModelRepository';
