import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configuración global para las pruebas
configure({ testIdAttribute: 'data-testid' });

// Mock para las peticiones HTTP
global.fetch = jest.fn();

// Mock para localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock as unknown as Storage;

// Mock para matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock para scrollTo
window.scrollTo = jest.fn();

// Mock para requestAnimationFrame
window.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};

// Mock para cancelAnimationFrame
window.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Extender el tipo de NodeJS.ProcessEnv para incluir nuestras variables de entorno
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_API_URL: string;
      VITE_APP_ENV: 'development' | 'test' | 'production';
      VITE_AUTH_TOKEN_EXPIRY: string;
      VITE_REFRESH_TOKEN_EXPIRY_DAYS: string;
      VITE_ENABLE_ANALYTICS: string;
      VITE_ENABLE_LOGGING: string;
      VITE_APP_NAME: string;
      VITE_APP_VERSION: string;
      VITE_NOTIFICATION_TIMEOUT: string;
      VITE_MAX_NOTIFICATIONS: string;
      VITE_API_TIMEOUT: string;
      VITE_API_RETRY_ATTEMPTS: string;
      VITE_CSRF_ENABLED: string;
      VITE_CORS_ENABLED: string;
    }
  }
}

// Configuración de variables de entorno para pruebas
const envVars = {
  VITE_API_URL: 'http://localhost:3001/api',
  VITE_APP_ENV: 'test',
  VITE_AUTH_TOKEN_EXPIRY: '3600',
  VITE_REFRESH_TOKEN_EXPIRY_DAYS: '7',
  VITE_ENABLE_ANALYTICS: 'false',
  VITE_ENABLE_LOGGING: 'true',
  VITE_APP_NAME: 'Love Rose Test',
  VITE_APP_VERSION: '1.0.0',
  VITE_NOTIFICATION_TIMEOUT: '5000',
  VITE_MAX_NOTIFICATIONS: '3',
  VITE_API_TIMEOUT: '10000',
  VITE_API_RETRY_ATTEMPTS: '3',
  VITE_CSRF_ENABLED: 'true',
  VITE_CORS_ENABLED: 'true'
};

// Asignar las variables de entorno
Object.entries(envVars).forEach(([key, value]) => {
  process.env[key] = value;
});
