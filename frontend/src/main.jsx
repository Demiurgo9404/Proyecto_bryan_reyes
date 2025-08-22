import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.jsx';
import './styles/main.css';

// Componente de carga personalizado
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Configuración del router con futuras banderas
const router = createBrowserRouter(
  [
    {
      path: '/*',
      element: <App />,
      errorElement: <div className="p-4 text-red-600">Algo salió mal</div>,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_throwAbortReason: true,
      v7_fetcherPersist: true,
    },
  }
);

// Configuración global para React Router
const routerConfig = {
  ...router,
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_throwAbortReason: true,
    v7_fetcherPersist: true,
  },
  unstable_dataStrategy: 'defer',
};

// Obtener el contenedor raíz
const container = document.getElementById('root');
const root = createRoot(container);

// Renderizar la aplicación
root.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <AuthProvider>
        <RouterProvider 
          router={routerConfig}
          fallbackElement={<LoadingFallback />}
        />
      </AuthProvider>
    </Suspense>
  </React.StrictMode>
);
