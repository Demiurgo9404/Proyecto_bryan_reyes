// Configuración global para pruebas
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configuración de react-testing-library
configure({
  testIdAttribute: 'data-testid',
  // Otras configuraciones específicas para tus pruebas
});

// Mocks globales
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
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

// Configuración de localStorage mock
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: function (key: string) {
      return store[key] || null;
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function (key: string) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
    key: function (index: number) {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Configuración de fetch mock
global.fetch = jest.fn() as jest.Mock;

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'testKey',
  }),
}));

// Mock de react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    dismiss: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Configuración de Axios mock
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
  isAxiosError: jest.fn(),
}));

// Configuración de console para pruebas
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suprimir advertencias específicas de React
  const noop = () => {};
  
  console.error = (...args) => {
    // Suprimir errores específicos que no son relevantes para las pruebas
    if (args[0]?.includes('React does not recognize the')) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    // Suprimir advertencias específicas que no son relevantes para las pruebas
    if (args[0]?.includes('A component is changing an uncontrolled input')) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  // Restaurar console original después de las pruebas
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
