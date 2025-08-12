import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

// Componentes de diseño
import Layout from '../components/layout/Layout';
import AuthLayout from '../features/auth/components/AuthLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Componentes de páginas (carga perezosa para mejor rendimiento)
const Home = lazy(() => import('../pages/Home'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));

// Páginas protegidas (solo accesibles para usuarios autenticados)
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const Explore = lazy(() => import('../pages/Explore'));
const Matches = lazy(() => import('../pages/Matches'));
const About = lazy(() => import('../pages/About'));

// Componente de carga
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

// Componente de ruta protegida
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  
  if (isLoading) {
    return <Loader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

// Componente de ruta de invitado (solo accesible para usuarios no autenticados)
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Rutas de autenticación */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
        </Route>

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="explore" element={<Explore />} />
          <Route path="matches" element={<Matches />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
