import React, { useState, useRef, useEffect } from 'react';
import { FaFacebookMessenger, FaBell, FaSearch, FaHome, FaUserFriends, FaVideo, FaStore, FaUsers, FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useModel } from '../../../contexts/ModelContext';

const SocialHeader = ({ onToggleSidebar }) => {
  const { profile } = useModel();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar la búsqueda al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Buscando:', searchQuery);
      // Aquí iría la lógica de búsqueda
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between h-16">
          {/* Logo y búsqueda */}
          <div className="flex items-center">
            <button 
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100 mr-2"
            >
              <FaBars className="h-5 w-5" />
            </button>
            
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-pink-600">LoveRose</span>
            </div>
            
            <div className="hidden lg:ml-6 lg:flex lg:items-center">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent sm:text-sm"
                  placeholder="Buscar en LoveRose"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Navegación principal */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            <button
              className="flex items-center justify-center px-6 py-2 text-pink-600 border-b-2 border-pink-600 font-medium"
            >
              <FaHome className="h-6 w-6" />
            </button>
            <button className="flex items-center justify-center px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <FaUserFriends className="h-6 w-6" />
            </button>
            <button className="flex items-center justify-center px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <FaVideo className="h-6 w-6" />
            </button>
            <button className="flex items-center justify-center px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <FaStore className="h-6 w-6" />
            </button>
            <button className="flex items-center justify-center px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <FaUsers className="h-6 w-6" />
            </button>
          </div>
          
          {/* Menú de usuario */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                <span className="sr-only">Ver notificaciones</span>
                <FaBell className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-shrink-0 ml-4">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                <span className="sr-only">Mensajes</span>
                <FaFacebookMessenger className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-shrink-0 ml-4">
              <button 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                onClick={() => navigate('/model/profile')}
              >
                {profile?.displayName?.charAt(0) || 'U'}
              </button>
            </div>
            
            {/* Menú móvil */}
            <div className="lg:hidden ml-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                <FaSearch className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Búsqueda móvil */}
      {showSearch && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-3" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent sm:text-sm"
                placeholder="Buscar en LoveRose"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default SocialHeader;
