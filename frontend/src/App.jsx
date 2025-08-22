import React, { useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/main.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import DashboardPage from './pages/admin/dashboard/DashboardPage';
import UsersManagement from './pages/admin/UsersManagement';
import EditUserProfile from './pages/admin/EditUserProfile';
import CreateUser from './pages/admin/CreateUser';
import ClientsManagement from './pages/admin/ClientsManagement.jsx';
import ClientDetail from './pages/admin/ClientDetail.jsx';
import RolesManagement from './pages/admin/RolesManagement.jsx';
import ProductsManagement from './pages/admin/ProductsManagement.jsx';
import OffersManagement from './pages/admin/OffersManagement.jsx';
import SalesDashboard from './pages/admin/SalesDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import SuperDashboard from './pages/super/SuperDashboard';
import AgencyDashboard from './pages/agency/AgencyDashboard';
import ModelDashboard from './pages/model/ModelDashboard';

// Page Components
const Home = () => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="in"
    exit="out"
    className="p-4 max-w-4xl mx-auto"
  >
    <h1 className="text-3xl font-bold text-primary mb-6">Welcome to Love Rose</h1>
    <p className="mb-6 text-gray-600">Find your ideal partner</p>
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Featured Profiles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow transition-shadow">
            <h3 className="font-medium text-gray-800">Person {item}</h3>
            <p className="text-sm text-gray-500 mt-1">Learn more about this person</p>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const Matches = () => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="in"
    exit="out"
    className="p-4 max-w-4xl mx-auto"
  >
    <h1 className="text-2xl font-bold text-primary mb-6">Tus Matches</h1>
    <div className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-gray-600">Aquí aparecerán tus coincidencias</p>
    </div>
  </motion.div>
);

const Messages = () => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="in"
    exit="out"
    className="p-4 max-w-4xl mx-auto"
  >
    <h1 className="text-2xl font-bold text-primary mb-6">Mensajes</h1>
    <div className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-gray-600">Tus conversaciones aparecerán aquí</p>
    </div>
  </motion.div>
);

const Profile = () => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="in"
    exit="out"
    className="p-4 max-w-4xl mx-auto"
  >
    <h1 className="text-2xl font-bold text-primary mb-6">Mi Perfil</h1>
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl text-indigo-600 font-bold">U</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Tu nombre</h2>
        <p className="text-gray-600 mt-1">Edad: --</p>
      </div>
    </div>
  </motion.div>
);

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// Main Application Component
function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Handle logout with navigation
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout onLogout={handleLogout} />}>
              <Route index element={<Home />} />
              <Route path="matches" element={<Matches />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AppLayout admin onLogout={handleLogout} />}>
              <Route index element={<DashboardPage />} />
              
              {/* Users Management */}
              <Route path="usuarios" element={<UsersManagement />} />
              <Route path="usuarios/nuevo" element={<CreateUser />} />
              <Route path="usuarios/:id" element={<EditUserProfile mode="view" />} />
              <Route path="usuarios/:id/editar" element={<EditUserProfile mode="edit" />} />
              
              {/* Clients Management */}
              <Route path="clientes" element={<ClientsManagement />} />
              <Route path="clientes/nuevo" element={<ClientDetail mode="edit" />} />
              <Route path="clientes/:id" element={<ClientDetail mode="view" />} />
              <Route path="clientes/:id/editar" element={<ClientDetail mode="edit" />} />
              
              {/* Roles y Permisos */}
              <Route path="roles" element={<RolesManagement />} />
              
              {/* Gestión de Productos (Paquetes de Monedas) */}
              <Route path="productos" element={<ProductsManagement />} />
              
              {/* Gestión de Ofertas */}
              <Route path="ofertas" element={<OffersManagement />} />
              
              {/* Panel de Ventas */}
              <Route path="ventas" element={<SalesDashboard />} />
              
              {/* Legacy Dashboard */}
              <Route path="legacy-dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* Superuser (temporarily same role as admin) */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/super" element={<AppLayout admin onLogout={handleLogout} />}>
              <Route index element={<SuperDashboard />} />
            </Route>
          </Route>

          {/* Agency Dashboard */}
          <Route element={<ProtectedRoute roles={["agency"]} />}>
            <Route path="/agency" element={<AppLayout onLogout={handleLogout} />}>
              <Route index element={<AgencyDashboard />} />
            </Route>
          </Route>

          {/* Model Dashboard */}
          <Route element={<ProtectedRoute roles={["model"]} />}>
            <Route path="/model" element={<AppLayout onLogout={handleLogout} />}>
              <Route index element={<ModelDashboard />} />
            </Route>
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
