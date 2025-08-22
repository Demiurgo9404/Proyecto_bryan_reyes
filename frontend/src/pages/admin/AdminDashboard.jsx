import React, { useState } from 'react';
import { 
  FaUsers, 
  FaMoneyBillWave,
  FaShoppingCart,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaUserPlus
} from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Datos de ejemplo para las tarjetas de estadísticas
  const stats = [
    { 
      id: 1,
      title: 'Usuarios Totales', 
      value: '1,856', 
      icon: <FaUsers className="h-6 w-6" />, 
      change: { value: 12.5, isPositive: true },
      color: 'bg-blue-500',
      link: '/admin/usuarios'
    },
    { 
      id: 2,
      title: 'Ingresos', 
      value: '$24,850', 
      icon: <FaMoneyBillWave className="h-6 w-6" />, 
      change: { value: 8.3, isPositive: true },
      color: 'bg-green-500',
      link: '/admin/ingresos'
    },
    { 
      id: 3,
      title: 'Órdenes', 
      value: '342', 
      icon: <FaShoppingCart className="h-6 w-6" />, 
      change: { value: 5.7, isPositive: true },
      color: 'bg-purple-500',
      link: '/admin/ordenes'
    },
    { 
      id: 4,
      title: 'Reportes', 
      value: '18', 
      icon: <FaChartLine className="h-6 w-6" />, 
      change: { value: 3, isPositive: false },
      color: 'bg-yellow-500',
      link: '/admin/reportes'
    }
  ];
  
  // Datos de ejemplo para actividades recientes
  const activities = [
    {
      id: 1,
      type: 'new_user',
      title: 'Nuevo usuario registrado',
      description: 'Juan Pérez se ha registrado en la plataforma',
      time: 'Hace 5 min',
      user: 'Juan Pérez'
    },
    {
      id: 2,
      type: 'purchase',
      title: 'Nueva orden completada',
      description: 'Orden #4567 por $245.99 ha sido pagada',
      time: 'Hace 30 min',
      user: 'María García'
    },
    {
      id: 3,
      type: 'comment',
      title: 'Nuevo comentario',
      description: 'Carlos dejó un comentario en el artículo "Guía de inicio"',
      time: 'Hace 2 horas'
    }
  ];
  
  // Manejar actualización de datos
  const handleRefresh = () => {
    setIsLoading(true);
    // Simular actualización
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        pauseOnHover
        theme="colored"
      />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-500 mt-1">Bienvenido al panel de administración</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${stat.change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change.isPositive ? (
                      <FaArrowUp className="inline mr-1" />
                    ) : (
                      <FaArrowDown className="inline mr-1" />
                    )}
                    {stat.change.value}%
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs mes pasado</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad de Usuarios</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico de actividad</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ingresos Mensuales</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico de ingresos</p>
          </div>
        </div>
      </div>

      {/* Actividades recientes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Actividades Recientes</h3>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 flex items-center"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                {activity.type === 'new_user' && <FaUserPlus />}
                {activity.type === 'purchase' && <FaShoppingCart />}
                {activity.type === 'comment' && <FaChartLine />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
                <p className="text-sm text-gray-600">{activity.description}</p>
                {activity.user && (
                  <span className="inline-block mt-1 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {activity.user}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
