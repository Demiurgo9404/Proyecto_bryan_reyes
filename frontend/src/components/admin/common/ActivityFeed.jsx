import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaComment, FaUserPlus, FaExclamationTriangle, FaUserEdit } from 'react-icons/fa';

const getActivityIcon = (type) => {
  switch (type) {
    case 'comment':
      return <FaComment className="text-blue-500" />;
    case 'signup':
      return <FaUserPlus className="text-green-500" />;
    case 'report':
      return <FaExclamationTriangle className="text-yellow-500" />;
    case 'update':
      return <FaUserEdit className="text-purple-500" />;
    default:
      return <FaUser className="text-gray-400" />;
  }
};

const ActivityFeed = ({ items = [], title = 'Actividad Reciente', viewAllLink = '/admin/actividad', loading = false, maxItems = 5 }) => {
  // Datos de ejemplo si no se proporcionan
  const defaultItems = [
    { 
      id: 1, 
      user: 'Juan Pérez', 
      action: 'actualizó su perfil', 
      time: 'Hace 5 min',
      type: 'update',
      link: '/admin/usuarios/1'
    },
    { 
      id: 2, 
      user: 'María García', 
      action: 'comentó en una publicación', 
      time: 'Hace 15 min',
      type: 'comment',
      link: '/admin/publicaciones/123'
    },
    { 
      id: 3, 
      user: 'Carlos López', 
      action: 'se registró en la plataforma', 
      time: 'Hace 1 hora',
      type: 'signup',
      link: '/admin/usuarios/nuevos'
    },
    { 
      id: 4, 
      user: 'Ana Martínez', 
      action: 'reportó un contenido', 
      time: 'Hace 2 horas',
      type: 'report',
      link: '/admin/reportes/45'
    },
    { 
      id: 5, 
      user: 'Pedro Sánchez', 
      action: 'completó su perfil', 
      time: 'Hace 5 horas',
      type: 'update',
      link: '/admin/usuarios/5'
    }
  ];

  const activities = items.length > 0 ? items.slice(0, maxItems) : defaultItems.slice(0, maxItems);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Actividad Reciente</h3>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Actualizar actividad"
          >
            <FaSync className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {localActivities.map((activity, index) => (
          <div 
            key={index} 
            className="p-4 hover:bg-gray-50 transition-colors duration-150"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="p-2 rounded-full bg-gray-100">
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  {getActivityBadge(activity.type)}
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span>{activity.time}</span>
                  {activity.user && (
                    <span className="flex items-center ml-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-1"></span>
                      {activity.user}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-right">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-end w-full"
        >
          <FaSync className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualizando...' : 'Ver más actividad'}
        </button>
      </div>
        <div className="px-6 py-3 bg-gray-50 text-right border-t border-gray-200">
        <Link 
          to="/admin/actividad" 
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Ver toda la actividad <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
};

export default ActivityFeed;
