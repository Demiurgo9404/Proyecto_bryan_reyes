import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaUserPlus, 
  FaChartLine, 
  FaCog, 
  FaUserShield,
  FaUserCheck,
  FaUserClock,
  FaMoneyBillWave,
  FaBell,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaEnvelope,
  FaCommentDots
} from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  // Estado para el rango de fechas
  const [dateRange, setDateRange] = useState('hoy');
  
  // Datos de ejemplo para las tarjetas de estadísticas
  const stats = [
    { 
      title: 'Usuarios Totales', 
      value: '1,234', 
      change: '+12%', 
      icon: <FaUsers className="text-3xl" />, 
      color: 'bg-blue-500',
      link: '/admin/usuarios'
    },
    { 
      title: 'Ingresos', 
      value: '$12,450', 
      change: '+8.2%', 
      icon: <FaMoneyBillWave className="text-3xl" />, 
      color: 'bg-green-500',
      link: '/admin/finanzas'
    },
    { 
      title: 'Usuarios Activos', 
      value: '856', 
      change: '+5.3%', 
      icon: <FaUserCheck className="text-3xl" />, 
      color: 'bg-purple-500',
      link: '/admin/usuarios?status=activo'
    },
    { 
      title: 'Reportes', 
      value: '12', 
      change: '-3', 
      icon: <FaUserShield className="text-3xl" />, 
      color: 'bg-yellow-500',
      link: '/admin/reportes'
    },
  ];

  // Datos para la gráfica de usuarios
  const userChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Usuarios Nuevos',
        data: [65, 59, 80, 81, 56, 120],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Usuarios Activos',
        data: [28, 48, 40, 19, 86, 27],
        fill: false,
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  };

  // Datos para la gráfica de ingresos
  const revenueChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ingresos ($)',
        data: [1250, 1900, 1500, 2100, 2500, 3200],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  // Datos para la tabla de actividad reciente
  const recentActivity = [
    { 
      id: 1, 
      user: 'Juan Pérez', 
      action: 'Nuevo registro', 
      time: 'Hace 5 min',
      icon: <FaUserPlus className="text-green-500" />,
      link: '/admin/usuarios/1'
    },
    { 
      id: 2, 
      user: 'María García', 
      action: 'Pago completado', 
      time: 'Hace 15 min',
      icon: <FaMoneyBillWave className="text-blue-500" />,
      link: '/admin/pagos/2'
    },
    { 
      id: 3, 
      user: 'Carlos López', 
      action: 'Reporte de usuario', 
      time: 'Hace 1 hora',
      icon: <FaUserShield className="text-yellow-500" />,
      link: '/admin/reportes/3'
    },
    { 
      id: 4, 
      user: 'Ana Martínez', 
      action: 'Mensaje nuevo', 
      time: 'Hace 2 horas',
      icon: <FaCommentDots className="text-purple-500" />,
      link: '/admin/mensajes/4'
    },
  ];

  // Datos para notificaciones
  const notifications = [
    { id: 1, message: 'Nuevo pago recibido', time: 'Hace 5 min', read: false },
    { id: 2, message: '3 perfiles pendientes de revisión', time: 'Hace 30 min', read: false },
    { id: 3, message: 'Actualización del sistema completada', time: 'Ayer', read: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Barra superior */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
              <FaCog className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Barra lateral */}
        <aside className="w-64 bg-white shadow-md h-screen sticky top-0">
          <div className="p-4">
            <nav className="mt-6">
              <div>
                <Link to="/admin/dashboard" className="flex items-center px-4 py-3 text-gray-700 bg-gray-100 rounded-lg">
                  <FaChartLine className="h-5 w-5 mr-3" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link to="/admin/usuarios" className="flex items-center px-4 py-3 mt-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <FaUsers className="h-5 w-5 mr-3" />
                  <span>Usuarios</span>
                </Link>
                <Link to="/admin/reportes" className="flex items-center px-4 py-3 mt-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <FaUserShield className="h-5 w-5 mr-3" />
                  <span>Reportes</span>
                </Link>
                <Link to="/admin/moderacion" className="flex items-center px-4 py-3 mt-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <FaUserClock className="h-5 w-5 mr-3" />
                  <span>Moderación</span>
                </Link>
                <Link to="/admin/configuracion" className="flex items-center px-4 py-3 mt-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <FaCog className="h-5 w-5 mr-3" />
                  <span>Configuración</span>
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Resumen General</h2>
          
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.color} text-white mr-4`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico de actividad (simulado) */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Actividad de Usuarios</h3>
              <select className="border rounded-md px-3 py-1 text-sm">
                <option>Últimos 7 días</option>
                <option>Últimos 30 días</option>
                <option>Este año</option>
              </select>
            </div>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              Gráfico de actividad (simulado)
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Actividad Reciente</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <FaUserClock className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-500">{activity.action}</p>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 bg-gray-50 text-right">
              <Link to="/admin/actividad" className="text-sm font-medium text-primary hover:text-primary/80">
                Ver toda la actividad →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
