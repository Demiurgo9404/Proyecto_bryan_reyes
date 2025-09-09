import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from '../contexts/AuthContext';
import { CoinsProvider } from '../contexts/CoinsContext';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from 'react-query';

// Importar páginas
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/dashboards/UserDashboard';
import ModelDashboard from './pages/dashboards/ModelDashboard';
import ModelDiscovery from './pages/ModelDiscovery';
import LiveStreamingPage from './pages/LiveStreamingPage';
import NotFound from './pages/NotFound';

// Crear cliente de consultas
const queryClient = new QueryClient();

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#e91e63',
    },
    secondary: {
      main: '#ff4081',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <UserDashboard />,
    errorElement: <NotFound />,
  },
  {
    path: '/model',
    element: <ModelDashboard />,
  },
  {
    path: '/model-discovery',
    element: <ModelDiscovery />,
  },
  {
    path: '/streaming',
    element: <LiveStreamingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
], {
  future: {
    v7_startTransition: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <AuthProvider>
            <CoinsProvider>
              <RouterProvider router={router} />
            </CoinsProvider>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
