import React from 'react';
import { FaBell, FaUserCircle, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { currentUser } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search bar */}
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar..."
          />
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
            <FaBell className="w-5 h-5" />
          </button>
          
          {/* User profile */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {currentUser?.photoURL ? (
                <img 
                  className="h-8 w-8 rounded-full" 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'User'} 
                />
              ) : (
                <FaUserCircle className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {currentUser?.displayName || 'Administrador'}
              </p>
              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                {currentUser?.role || 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
