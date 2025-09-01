import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUsers, FaUserPlus, FaUserClock, FaUserCheck, FaUserCog, FaSearch } from 'react-icons/fa';
import UsersManagement from './UsersManagement';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import { userService } from '../../api';

// StatCard Component
const StatCard = ({ title, value, icon, color, link }) => (
  <div className={`p-6 rounded-lg shadow ${color} text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="p-3 rounded-full bg-white/20">
        {icon}
      </div>
    </div>
  </div>
);

// QuickAction Component
const QuickAction = ({ icon, title, description, onClick, buttonText }) => (
  <div className="p-5 bg-white rounded-lg shadow">
    <div className="flex items-center mb-3">
      <div className="p-2 mr-3 rounded-full bg-blue-100 text-blue-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <button
      onClick={onClick}
      className="w-full text-sm font-medium text-blue-600 hover:text-blue-800"
    >
      {buttonText} →
    </button>
  </div>
);

const UserManagementDashboard = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    pendingVerification: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Replace with actual API call
        // const data = await userService.getUserStats();
        // setStats(data);
        
        // Mock data for now
        setStats({
          totalUsers: 1245,
          newUsers: 42,
          activeUsers: 987,
          pendingVerification: 23
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Check if user is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 max-w-sm w-full bg-white rounded-lg border border-gray-200 shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Acceso denegado</h2>
          <p className="text-gray-700">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
            <p className="text-gray-600">Administra los usuarios del sistema</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Usuarios Totales" 
              value={stats.totalUsers.toLocaleString()} 
              icon={<FaUsers className="h-5 w-5" />} 
              color="bg-blue-600"
            />
            <StatCard 
              title="Nuevos (30d)" 
              value={stats.newUsers} 
              icon={<FaUserPlus className="h-5 w-5" />} 
              color="bg-green-600"
            />
            <StatCard 
              title="Activos" 
              value={stats.activeUsers.toLocaleString()} 
              icon={<FaUserCheck className="h-5 w-5" />} 
              color="bg-purple-600"
            />
            <StatCard 
              title="Pendientes" 
              value={stats.pendingVerification} 
              icon={<FaUserClock className="h-5 w-5" />} 
              color="bg-yellow-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <QuickAction
              icon={<FaUserPlus className="h-5 w-5" />}
              title="Agregar Usuario"
              description="Crea una nueva cuenta de usuario manualmente"
              onClick={() => navigate('/admin/usuarios/nuevo')}
              buttonText="Crear Usuario"
            />
            <QuickAction
              icon={<FaSearch className="h-5 w-5" />}
              title="Buscar Usuario"
              description="Encuentra un usuario específico por nombre, correo o ID"
              onClick={() => document.getElementById('userSearch').focus()}
              buttonText="Buscar Ahora"
            />
            <QuickAction
              icon={<FaUserCog className="h-5 w-5" />}
              title="Configuración de Usuarios"
              description="Ajusta los permisos y configuraciones de usuario"
              onClick={() => navigate('/admin/configuracion/usuarios')}
              buttonText="Configurar"
            />
          </div>

          {/* User Management Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Routes>
              <Route 
                path="/usuarios" 
                element={<UsersManagement />} 
              />
              <Route 
                path="/usuarios/nuevo" 
                element={<UsersManagement initialMode="create" />} 
              />
              <Route 
                path="/" 
                element={
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">Todos los Usuarios</h2>
                      <div className="bg-white border rounded-lg p-4">
                        <p className="text-gray-600">Selecciona una opción del menú para comenzar o usa las acciones rápidas de arriba.</p>
                      </div>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagementDashboard;
