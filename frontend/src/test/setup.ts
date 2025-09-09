// Configuración global para pruebas
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { ReactElement } from 'react';

// Configuración de react-testing-library
configure({ testIdAttribute: 'data-testid' });

// Mock de window.matchMedia
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

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    key(index: number) {
      return Object.keys(store)[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

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
  ToastContainer: function MockToastContainer(): ReactElement {
    return <div data-testid="toast-container" />;
  },
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
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock de módulos que pueden causar problemas en pruebas
jest.mock('react-lazy-load-image-component', () => ({
  LazyLoadImage: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="lazy-image" />
  ),
}));

// Suprimir advertencias específicas de React
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const noop = () => {};

console.error = (...args: any[]) => {
  // Suprimir errores específicos de estilos en pruebas
  if (args[0]?.includes('Warning: [antd:')) {
    return noop();
  }
  originalConsoleError(...args);
};

console.warn = (...args: any[]) => {
  // Suprimir advertencias específicas
  if (args[0]?.includes('componentWillReceiveProps')) {
    return noop();
  }
  originalConsoleWarn(...args);
};

afterAll(() => {
  // Restaurar console original después de las pruebas
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Configuración de fetch global
// @ts-ignore
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;
