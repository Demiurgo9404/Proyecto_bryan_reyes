import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { HomeIcon, Clapperboard, MessageCircle, Bell, PlusSquare, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ModelLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);

  // Mock data - replace with real data
  const activeUsers = [
    { id: 1, name: 'User 1', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', online: true },
    { id: 2, name: 'User 2', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', online: true },
    { id: 3, name: 'User 3', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', online: false },
  ];

  const navItems = [
    { icon: HomeIcon, path: '/model', label: 'Inicio' },
    { icon: Clapperboard, path: '/model/reels', label: 'Reels' },
    { icon: MessageCircle, path: '/model/messages', label: 'Mensajes' },
    { icon: Bell, path: '/model/notifications', label: 'Notificaciones' },
    { icon: PlusSquare, path: '/model/create', label: 'Crear' },
    { icon: User, path: `/model/profile/${user?.id}`, label: 'Perfil' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="text-2xl font-bold text-pink-500 mb-8 px-4">LoveRose</div>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-pink-50 text-pink-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Stories Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex space-x-6 overflow-x-auto pb-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5">
                  <div className="bg-white p-0.5 rounded-full">
                    <img
                      src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 1}.jpg`}
                      alt={`User ${i + 1}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-600">User {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Active Users Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-4">Activo ahora</h3>
        <div className="space-y-3">
          {activeUsers.map((user) => (
            <div 
              key={user.id}
              onClick={() => setActiveChat(user)}
              className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {user.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.online ? 'En línea' : 'Reciente'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Modal */}
      {activeChat && (
        <div className="fixed bottom-0 right-20 w-96 bg-white rounded-t-lg shadow-xl border border-gray-200 flex flex-col" style={{ height: '80vh' }}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <img
                src={activeChat.avatar}
                alt={activeChat.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="ml-2 font-medium">{activeChat.name}</span>
            </div>
            <div className="flex space-x-2">
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </button>
              <button 
                onClick={() => setActiveChat(null)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Sample messages */}
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm">¡Hola! ¿Cómo estás?</p>
                  <p className="text-xs text-gray-500 mt-1 text-right">12:30 PM</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-pink-500 text-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm">¡Hola! Estoy bien, ¿y tú?</p>
                  <p className="text-xs text-pink-100 mt-1 text-right">12:32 PM</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button className="ml-2 p-2 text-pink-500 hover:text-pink-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelLayout;
