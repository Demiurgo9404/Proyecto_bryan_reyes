import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  FaUsers, 
  FaUserPlus, 
  FaChartLine, 
  FaMoneyBillWave
} from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Sidebar from '../../components/admin/layout/Sidebar';
import Header from '../../components/admin/layout/Header';

const AdminDashboard = () => {
  // States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for stats
  const stats = [
    { title: 'Usuarios Totales', value: '1,234', icon: <FaUsers className="h-6 w-6" />, change: '+12%' },
    { title: 'Nuevos Hoy', value: '45', icon: <FaUserPlus className="h-6 w-6" />, change: '+5%' },
    { title: 'Ingresos', value: '$12,345', icon: <FaMoneyBillWave className="h-6 w-6" />, change: '+8%' },
    { title: 'Actividad', value: '1,234', icon: <FaChartLine className="h-6 w-6" />, change: '+3%' }
  ];
  
  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    // Here you would typically fetch new data based on the selected range
    console.log('Date range changed to:', newRange);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        pauseOnHover
        theme="colored"
      />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className={`flex-1 min-h-screen transition-all duration-300 ${
        sidebarOpen ? 'md:ml-64' : 'ml-0'
      } flex flex-col bg-gray-100`}>
        {/* Header */}
        <div className="h-16 flex-shrink-0">
          <Header 
            dateRange={dateRange} 
            onDateRangeChange={handleDateRangeChange}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
        
        {/* Main content area with scrolling */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
          
          {/* Dashboard Content */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                      {stat.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      {stat.change && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          stat.change.startsWith('+')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {stat.change}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Usuarios Registrados</h3>
                <p className="text-sm text-gray-500 mb-4">Tendencia de los últimos 30 días</p>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Gráfico de usuarios</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ingresos</h3>
                <p className="text-sm text-gray-500 mb-4">Tendencia de los últimos 30 días</p>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Gráfico de ingresos</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
