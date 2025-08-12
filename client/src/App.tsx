import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import AppRoutes from './routes';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster 
            position="top-center"
            toastOptions={{
              className: 'font-sans',
              classNames: {
                toast: '!bg-white !text-gray-900 !border !border-gray-200 dark:!bg-gray-800 dark:!text-white dark:!border-gray-700',
                title: '!font-medium',
                description: '!text-gray-500 dark:!text-gray-400',
                success: '!border-green-500 !bg-green-50 dark:!bg-green-900/20 dark:!border-green-700',
                error: '!border-red-500 !bg-red-50 dark:!bg-red-900/20 dark:!border-red-700',
                warning: '!border-amber-500 !bg-amber-50 dark:!bg-amber-900/20 dark:!border-amber-700',
                info: '!border-blue-500 !bg-blue-50 dark:!bg-blue-900/20 dark:!border-blue-700',
              },
              duration: 5000,
            }}
          />
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
