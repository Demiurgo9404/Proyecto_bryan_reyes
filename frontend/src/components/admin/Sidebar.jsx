import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaUserPlus, FaHome, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { 
      name: 'Inicio', 
      icon: <FaHome className="w-5 h-5" />, 
      path: '/admin' 
    },
    { 
      name: 'Usuarios', 
      icon: <FaUsers className="w-5 h-5" />, 
      path: '/admin/usuarios',
      subItems: [
        { name: 'Lista de Usuarios', path: '/admin/usuarios' },
        { name: 'Nuevo Usuario', path: '/admin/usuarios/nuevo' }
      ]
    },
    { 
      name: 'Configuración', 
      icon: <FaCog className="w-5 h-5" />, 
      path: '/admin/configuracion' 
    },
  ];

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600';
  };

  return (
    <div className="bg-white w-64 h-screen shadow-lg fixed">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <div key={item.name} className="mb-2">
            <Link
              to={item.path}
              className={`flex items-center px-6 py-3 ${isActive(item.path)} transition-colors duration-200`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
            {item.subItems && (
              <div className="ml-12 mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    className={`block px-4 py-2 text-sm ${isActive(subItem.path)} rounded`}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4">
        <button
          onClick={logout}
          className="flex items-center w-full px-6 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt className="mr-3" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
