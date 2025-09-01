/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  readonly VITE_AUTH_TOKEN_EXPIRY: string;
  readonly VITE_REFRESH_TOKEN_EXPIRY_DAYS: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_LOGGING: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_NOTIFICATION_TIMEOUT: string;
  readonly VITE_MAX_NOTIFICATIONS: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_API_RETRY_ATTEMPTS: string;
  readonly VITE_CSRF_ENABLED: string;
  readonly VITE_CORS_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
