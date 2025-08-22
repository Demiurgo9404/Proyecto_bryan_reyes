import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaBell, 
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

const notifications = [
  { id: 1, text: 'Nuevo reporte de contenido inapropiado', time: 'Hace 10 min', read: false },
  { id: 2, text: '5 nuevos usuarios registrados hoy', time: 'Hace 1 hora', read: false },
  { id: 3, text: 'Actualización del sistema completada', time: 'Ayer', read: true },
  { id: 4, text: 'Recordatorio: Revisar moderación pendiente', time: 'Ayer', read: true }
];

const dateRangeOptions = [
  { value: 'today', label: 'Hoy' },
  { value: 'yesterday', label: 'Ayer' },
  { value: '7days', label: 'Últimos 7 días' },
  { value: '30days', label: 'Últimos 30 días' },
  { value: 'thismonth', label: 'Este mes' },
  { value: 'lastmonth', label: 'Mes pasado' },
  { value: 'custom', label: 'Personalizado' },
];

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="relative ml-3">
      <button 
        type="button" 
        className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Ver notificaciones</span>
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white">
            <span className="sr-only">{unreadCount} notificaciones sin leer</span>
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Notificaciones</h3>
              {unreadCount > 0 && (
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Marcar todo como leído
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{notification.text}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">No hay notificaciones</div>
              )}
            </div>
            <div className="px-4 py-2 border-t border-gray-200 text-center">
              <Link to="/admin/notificaciones" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Ver todas las notificaciones
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="ml-3 relative">
      <div>
        <button 
          type="button" 
          className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Abrir menú de usuario</span>
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            A
          </div>
          <span className="hidden md:inline-block ml-2 text-sm font-medium text-gray-700">Admin</span>
          {isOpen ? (
            <FaChevronUp className="ml-1 h-4 w-4 text-gray-500" />
          ) : (
            <FaChevronDown className="ml-1 h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            <Link 
              to="/admin/perfil" 
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaUser className="mr-2 h-4 w-4" />
              Tu perfil
            </Link>
            <Link 
              to="/admin/configuracion" 
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaCog className="mr-2 h-4 w-4" />
              Configuración
            </Link>
            <div className="border-t border-gray-200"></div>
            <Link 
              to="/logout" 
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaSignOutAlt className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const DateRangeSelector = ({ value, onChange }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        {dateRangeOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <FaCalendarAlt className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
};

const Header = ({ onMenuToggle, dateRange, onDateRangeChange }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={onMenuToggle}
            >
              <span className="sr-only">Abrir menú</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Barra de búsqueda */}
            <div className="hidden md:block ml-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Buscar..."
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              {/* Selector de rango de fechas */}
              <div className="hidden md:block">
                <DateRangeSelector 
                  value={dateRange}
                  onChange={onDateRangeChange}
                />
              </div>
              
              {/* Botón de notificaciones */}
              <NotificationsDropdown />
              
              {/* Perfil de usuario */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
