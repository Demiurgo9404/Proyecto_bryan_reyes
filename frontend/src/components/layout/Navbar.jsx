import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaHome, FaHeart, FaComment, FaUserShield, FaSignOutAlt, FaCoins, FaHistory } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ onLogout }) => {
  const { isAdmin, isModel } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg border-t-2 border-indigo-100 z-40">
      <div className="flex justify-around items-center p-2 max-w-md mx-auto">
        <Link 
          to="/app" 
          className="flex flex-col items-center p-2 rounded-xl hover:bg-indigo-100/50 transition-all duration-200 group"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-indigo-100 transition-colors duration-200">
            <FaHome className="text-xl text-indigo-600" />
          </div>
          <span className="text-xs mt-1 text-indigo-700 font-medium">Home</span>
        </Link>
        
        <Link 
          to="/app/matches" 
          className="flex flex-col items-center p-2 rounded-xl hover:bg-indigo-100/50 transition-all duration-200 group"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-indigo-100 transition-colors duration-200">
            <FaHeart className="text-xl text-pink-500" />
          </div>
          <span className="text-xs mt-1 text-indigo-700 font-medium">Matches</span>
        </Link>
        
        <Link 
          to="/app/messages" 
          className="flex flex-col items-center p-2 rounded-xl hover:bg-indigo-100/50 transition-all duration-200 group relative"
        >
          <div className="absolute -top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</div>
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-indigo-100 transition-colors duration-200">
            <FaComment className="text-xl text-indigo-600" />
          </div>
          <span className="text-xs mt-1 text-indigo-700 font-medium">Messages</span>
        </Link>
        
        <Link 
          to="/app/coins" 
          className="flex flex-col items-center p-2 rounded-xl hover:bg-indigo-100/50 transition-all duration-200 group"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-indigo-100 transition-colors duration-200">
            <FaCoins className="text-xl text-yellow-500" />
          </div>
          <span className="text-xs mt-1 text-indigo-700 font-medium">Monedas</span>
        </Link>
        
        {isModel() && (
          <Link 
            to="/app/earnings" 
            className="flex flex-col items-center p-2 rounded-xl hover:bg-indigo-100/50 transition-all duration-200 group"
          >
            <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-indigo-100 transition-colors duration-200">
              <FaHistory className="text-xl text-green-500" />
            </div>
            <span className="text-xs mt-1 text-indigo-700 font-medium">Ganancias</span>
          </Link>
        )}
        
        {isAdmin() && (
          <Link 
            to="/admin" 
            className="flex flex-col items-center p-2 rounded-xl hover:bg-indigo-100/50 transition-all duration-200 group"
          >
            <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-indigo-100 transition-colors duration-200">
              <FaUserShield className="text-xl text-indigo-600" />
            </div>
            <span className="text-xs mt-1 text-indigo-700 font-medium">Admin</span>
          </Link>
        )}
        
        <button 
          onClick={onLogout}
          className="flex flex-col items-center p-2 rounded-xl hover:bg-red-50 transition-all duration-200 group"
          title="Sign out"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-red-100 transition-colors duration-200">
            <FaSignOutAlt className="text-xl text-red-500" />
          </div>
          <span className="text-xs mt-1 text-red-600 font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default Navbar;
