// Tipos para el formulario de inicio de sesión
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Tipos para el formulario de registro
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  birthDate: string; // Formato: YYYY-MM-DD
  acceptTerms: boolean;
}

// Tipos para la respuesta de la API de autenticación
export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  expiresIn: number;
}

// Tipos para el estado de autenticación
export interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'user' | 'admin';
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Tipos para los errores de validación del formulario
export interface FormErrors {
  [key: string]: string | undefined;
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  gender?: string;
  birthDate?: string;
  acceptTerms?: string;
}
