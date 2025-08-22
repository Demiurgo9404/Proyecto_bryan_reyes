import React, { useState, useEffect, useRef } from 'react';
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

// Custom hook to handle clicks outside of an element
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

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
  const dropdownRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  useClickOutside(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button" 
        className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Ver notificaciones</span>
        <FaBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white">
            <span className="sr-only">{unreadCount} notificaciones sin leer</span>
          </span>
        )}
      </button>
      
      <div 
        className={`origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 transition-all duration-100 ease-in-out transform ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
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
    </div>
  );
};

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useClickOutside(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div>
        <button 
          type="button" 
          className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          id="user-menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Abrir menú de usuario</span>
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm">
            AU
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700 hidden md:inline-block">Admin</span>
          <FaChevronDown className="ml-1 h-3 w-3 text-gray-500 hidden md:inline-block" />
        </button>
      </div>
      
      <div 
        className={`origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 transition-all duration-100 ease-in-out transform ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="py-1">
          <Link 
            to="/admin/perfil" 
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <FaUser className="mr-2 h-4 w-4" />
            Tu perfil
          </Link>
          <Link 
            to="/admin/configuracion" 
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <FaCog className="mr-2 h-4 w-4" />
            Configuración
          </Link>
          <div className="border-t border-gray-200"></div>
          <Link 
            to="/logout" 
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <FaSignOutAlt className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

const DateRangeSelector = ({ value, onChange }) => {
  return (
    <div className="relative max-w-xs">
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
        >
          {dateRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <FaChevronDown className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
};

const Header = ({ onMenuToggle, dateRange, onDateRangeChange }) => {
  return (
    <div className="flex items-center justify-between h-full w-full">
      {/* Botón de menú para móviles */}
      <div className="flex items-center">
        <button
          type="button"
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={onMenuToggle}
        >
          <span className="sr-only">Abrir menú principal</span>
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Controles de fecha */}
      <div className="flex-1 px-4">
        <DateRangeSelector 
          value={dateRange}
          onChange={onDateRangeChange}
        />
      </div>

      {/* Controles de usuario */}
      <div className="flex items-center space-x-2">
        <NotificationsDropdown />
        <ProfileDropdown />
      </div>
    </div>
  );
};

export default Header;
