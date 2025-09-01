// Import from AuthContext
import AuthContext, { AuthProvider, useAuth } from './AuthContext';
// Import from ModelContext
import ModelContext, { ModelProvider, useModel } from './ModelContext';

// Re-export the contexts and hooks
export { AuthProvider, useAuth };
export { ModelProvider, useModel };

// Default export the AuthContext for backward compatibility
export default AuthContext;
