// ConfiguraciÃ³n de la API
export const API_CONFIG = {
  baseUrl: process.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  debug: process.env.VITE_DEBUG_HTTP === 'true',
  logLevel: process.env.VITE_LOG_LEVEL || 'error'
};
