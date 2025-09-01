// Configuración de la aplicación
export const APP_CONFIG = {
  // Tiempo de expiración del token de actualización (en días)
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
  
  // Tiempo de expiración del token de acceso (en minutos)
  ACCESS_TOKEN_EXPIRY_MINUTES: 15,
  
  // URL base de la API
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  // Rutas de la aplicación
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    // Agregar más rutas según sea necesario
  },
  
  // Configuración de notificaciones
  NOTIFICATIONS: {
    AUTO_HIDE_DURATION: 5000, // 5 segundos
    MAX_SNACK: 3, // Máximo número de notificaciones mostradas simultáneamente
  },
};

// Claves para el almacenamiento local
export const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth_tokens',
  USER_PREFERENCES: 'user_preferences',
  // Agregar más claves según sea necesario
};

// Configuración de temas
export const THEME_CONFIG = {
  // Colores principales
  COLORS: {
    PRIMARY: '#1976d2',
    SECONDARY: '#dc004e',
    ERROR: '#f44336',
    WARNING: '#ff9800',
    INFO: '#2196f3',
    SUCCESS: '#4caf50',
    // Agregar más colores según sea necesario
  },
  
  // Tamaños de fuente
  TYPOGRAPHY: {
    FONT_FAMILY: '"Roboto", "Helvetica", "Arial", sans-serif',
    FONT_SIZE_SMALL: '0.875rem',
    FONT_SIZE_MEDIUM: '1rem',
    FONT_SIZE_LARGE: '1.25rem',
    // Agregar más tamaños según sea necesario
  },
  
  // Espaciados
  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
    // Agregar más espaciados según sea necesario
  },
};
