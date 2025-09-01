import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { AuthRepositoryImpl } from './infrastructure/repositories/AuthRepositoryImpl';
import { AuthProvider, useAuth } from './presentation/contexts/AuthContext';
import { THEME_CONFIG } from './config/app';
import { LoginPage } from './presentation/pages/login/LoginPage';
import MainLayout from './presentation/components/layout/MainLayout';
import { CoinProvider } from './presentation/contexts/CoinContext';
import CoinsPage from './presentation/pages/coins/CoinsPage';
import CoinShopPage from './presentation/pages/coins/CoinShopPage';
import TransactionHistoryPage from './presentation/pages/coins/TransactionHistoryPage';
import UnauthorizedPage from './presentation/pages/error/UnauthorizedPage';
import { Box, CircularProgress, Typography } from '@mui/material';

// Import role-specific dashboards
import SuperAdminDashboard from './presentation/pages/dashboards/SuperAdminDashboard';
import AdminDashboard from './presentation/pages/dashboards/AdminDashboard';
import ModelDashboard from './presentation/pages/dashboards/ModelDashboard';
import StudyDashboard from './presentation/pages/dashboards/StudyDashboard';
import UserDashboard from './presentation/pages/dashboards/UserDashboard';
import LoveRoseDashboard from './presentation/pages/dashboards/LoveRoseDashboard';

// Import social media pages
import FeedPage from './presentation/pages/social/FeedPage';
import ModelDiscoveryPage from './presentation/pages/social/ModelDiscoveryPage';
import VideoCallPage from './presentation/pages/social/VideoCallPage';
import StoriesPage from './presentation/pages/social/StoriesPage';

// Import LoveRose pages
import CreatePostPage from './presentation/pages/loverose/CreatePostPage';
import SearchPage from './presentation/pages/loverose/SearchPage';
import ExplorePage from './presentation/pages/loverose/ExplorePage';
import ReelsPage from './presentation/pages/loverose/ReelsPage';
import MessagesPage from './presentation/pages/loverose/MessagesPage';
import NotificationsPage from './presentation/pages/loverose/NotificationsPage';
import ProfilePage from './presentation/pages/loverose/ProfilePage';

// Crear instancia del repositorio de autenticación
const authRepository = new AuthRepositoryImpl();

// Crear tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: THEME_CONFIG.COLORS.PRIMARY,
    },
    secondary: {
      main: THEME_CONFIG.COLORS.SECONDARY,
    },
    error: {
      main: THEME_CONFIG.COLORS.ERROR,
    },
    warning: {
      main: THEME_CONFIG.COLORS.WARNING,
    },
    info: {
      main: THEME_CONFIG.COLORS.INFO,
    },
    success: {
      main: THEME_CONFIG.COLORS.SUCCESS,
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: THEME_CONFIG.TYPOGRAPHY.FONT_FAMILY,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    // Agregar más estilos de tipografía según sea necesario
  },
  spacing: (factor: number) => `${0.25 * factor}rem`, // Base de 4px
});

/**
 * Componente de ruta protegida
 */
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  requiredRoles?: string[];
}> = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar roles si se especificaron
  if (requiredRoles.length > 0) {
    const hasRequiredRole = user?.roles?.some(role => 
      requiredRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

/**
 * Componente que renderiza el dashboard apropiado según el rol del usuario
 */
const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Determinar el rol principal del usuario (prioridad: SuperAdmin > Admin > Study > Model > User)
  const getUserPrimaryRole = () => {
    if (!user?.roles || user.roles.length === 0) return 'User';
    
    if (user.roles.includes('SuperAdmin')) return 'SuperAdmin';
    if (user.roles.includes('Admin')) return 'Admin';
    if (user.roles.includes('Study')) return 'Study';
    if (user.roles.includes('Model')) return 'Model';
    return 'User';
  };

  const primaryRole = getUserPrimaryRole();

  switch (primaryRole) {
    case 'SuperAdmin':
      return <SuperAdminDashboard />;
    case 'Admin':
      return <AdminDashboard />;
    case 'Study':
      return <StudyDashboard />;
    case 'Model':
      return <ModelDashboard />;
    case 'User':
    default:
      return <UserDashboard />;
  }
};

// Componente de carga mejorado
const LoadingSpinner: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = true }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...(fullScreen && {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'background.paper',
        zIndex: 1300,
      }),
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="body1" color="textSecondary">
        Cargando...
      </Typography>
    </Box>
  </Box>
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider authRepository={authRepository}>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Ruta de no autorizado */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Rutas protegidas */}
            <Route
              element={
                <ProtectedRoute>
                  <CoinProvider>
                    <MainLayout />
                  </CoinProvider>
                </ProtectedRoute>
              }
            >
              {/* Dashboard principal basado en roles */}
              <Route index element={<RoleBasedDashboard />} />
              
              {/* Rutas de Red Social */}
              <Route path="feed" element={<FeedPage />} />
              <Route path="explore" element={<div>Página Explorar - En desarrollo</div>} />
              <Route path="reels" element={<div>Página Reels - En desarrollo</div>} />
              <Route path="messages" element={<div>Mensajería - En desarrollo</div>} />
              <Route path="profile/:userId" element={<div>Perfil Usuario - En desarrollo</div>} />
              
              {/* Rutas de LoveRose */}
              <Route path="loverose" element={<LoveRoseDashboard />} />
              <Route path="loverose/create" element={<CreatePostPage />} />
              <Route path="loverose/search" element={<SearchPage />} />
              <Route path="loverose/explore" element={<ExplorePage />} />
              <Route path="loverose/reels" element={<ReelsPage />} />
              <Route path="loverose/messages" element={<MessagesPage />} />
              <Route path="loverose/notifications" element={<NotificationsPage />} />
              <Route path="loverose/profile/:username?" element={<ProfilePage />} />
              <Route path="loverose/stories" element={<StoriesPage />} />
              
              {/* Dashboards específicos por rol */}
              <Route 
                path="superadmin" 
                element={
                  <ProtectedRoute requiredRoles={['SuperAdmin']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="admin" 
                element={
                  <ProtectedRoute requiredRoles={['SuperAdmin', 'Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="study" 
                element={
                  <ProtectedRoute requiredRoles={['SuperAdmin', 'Admin', 'Study']}>
                    <StudyDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="model" 
                element={
                  <ProtectedRoute requiredRoles={['SuperAdmin', 'Admin', 'Model']}>
                    <ModelDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="user" 
                element={
                  <ProtectedRoute requiredRoles={['SuperAdmin', 'Admin', 'User']}>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas de monedas */}
              <Route path="coins">
                <Route index element={<CoinsPage />} />
                <Route path="shop" element={<CoinShopPage />} />
                <Route path="transactions" element={<TransactionHistoryPage />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
