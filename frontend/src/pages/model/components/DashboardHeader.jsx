import React, { useState } from 'react';
import { 
  FaHome, 
  FaSearch, 
  FaPlusSquare, 
  FaHeart, 
  FaUser, 
  FaCompass, 
  FaPaperPlane,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const DashboardHeader = ({ onSearch, onAddPost, scrolled = false, unreadCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className={`fixed top-0 left-0 right-0 bg-white z-50 transition-shadow duration-200 ${
      scrolled ? 'shadow-md' : ''
    }`}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo - Móvil */}
          <div className="md:hidden">
            <Link to="/model/dashboard" className="text-xl font-bold text-pink-600">
              LoveRose
            </Link>
          </div>

          {/* Logo - Desktop */}
          <div className="hidden md:block flex-shrink-0">
            <Link to="/model/dashboard" className="text-2xl font-bold text-pink-600">
              LoveRose
            </Link>
          </div>

          {/* Search Bar - Solo en desktop */}
          <div className="hidden md:flex md:flex-1 md:justify-center px-4">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Iconos de navegación */}
          <nav className="flex items-center space-x-4 md:space-x-6">
            <Link 
              to="/model/dashboard" 
              className="text-gray-700 hover:text-pink-600 transition-colors"
              aria-label="Inicio"
            >
              <FaHome size={24} />
            </Link>
            
            <Link 
              to="/model/explore" 
              className="text-gray-700 hover:text-pink-600 transition-colors hidden md:block"
              aria-label="Explorar"
            >
              <FaCompass size={24} />
            </Link>
            
            <button 
              onClick={onAddPost}
              className="text-gray-700 hover:text-pink-600 transition-colors"
              aria-label="Nueva publicación"
            >
              <FaPlusSquare size={24} />
            </button>
            
            <Link 
              to="/model/direct" 
              className="text-gray-700 hover:text-pink-600 transition-colors relative"
              aria-label="Mensajes"
            >
              <FaPaperPlane size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            
            <Link 
              to="/model/notifications" 
              className="text-gray-700 hover:text-pink-600 transition-colors relative"
              aria-label="Notificaciones"
            >
              <FaHeart size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </Link>
            
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300"
                aria-label="Menú de perfil"
              >
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username || 'Perfil'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                ) : (
                  <FaUser className="text-gray-500" />
                )}
              </button>
              
              {/* Menú desplegable */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500 truncate">@{user?.username || 'usuario'}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigate('/model/profile');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FaUser className="mr-2" /> Ver perfil
                  </button>
                  
                  <button
                    onClick={() => {
                      navigate('/model/settings');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FaCog className="mr-2" /> Configuración
                  </button>
                  
                  <div className="border-t my-1"></div>
                  
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <FaSignOutAlt className="mr-2" /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
            
            {/* Overlay para cerrar el menú al hacer clic fuera */}
            {showDropdown && (
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
