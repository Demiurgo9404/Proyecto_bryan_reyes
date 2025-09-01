import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, UserPlus, ThumbsUp, Bell, Check } from 'lucide-react';

const NotificationsPage = () => {
  const notifications = [
    {
      id: 1,
      type: 'like',
      user: 'Juan Pérez',
      action: 'le dio me gusta a tu publicación',
      time: 'Hace 5 minutos',
      read: false,
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 2,
      type: 'comment',
      user: 'María García',
      action: 'comentó en tu publicación: "¡Me encanta!"',
      time: 'Hace 1 hora',
      read: false,
      image: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: 3,
      type: 'follow',
      user: 'Carlos López',
      action: 'empezó a seguirte',
      time: 'Hace 3 horas',
      read: true,
      image: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    {
      id: 4,
      type: 'like',
      user: 'Ana Martínez',
      action: 'y 15 personas más dieron me gusta a tu publicación',
      time: 'Ayer',
      read: true,
      image: 'https://randomuser.me/api/portraits/women/4.jpg'
    },
    {
      id: 5,
      type: 'mention',
      user: 'Pedro Sánchez',
      action: 'te mencionó en un comentario',
      time: 'Ayer',
      read: true,
      image: 'https://randomuser.me/api/portraits/men/5.jpg'
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="text-red-500" size={20} />;
      case 'comment':
        return <MessageSquare className="text-blue-500" size={20} />;
      case 'follow':
        return <UserPlus className="text-green-500" size={20} />;
      case 'mention':
        return <Bell className="text-yellow-500" size={20} />;
      default:
        return <ThumbsUp className="text-gray-500" size={20} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Notificaciones</h1>
          <div className="flex mt-2 space-x-4">
            <button className="text-sm font-medium text-pink-600 border-b-2 border-pink-600 pb-1 px-1">
              Todo
            </button>
            <button className="text-sm font-medium text-gray-500 hover:text-gray-700 pb-1 px-1">
              No leídas
            </button>
            <button className="text-sm font-medium text-gray-500 hover:text-gray-700 pb-1 px-1">
              Menciones
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start p-4 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={notification.image}
                  alt={notification.user}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{notification.user}</span>{' '}
                    {notification.action}
                  </p>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                {notification.type === 'comment' && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    {notification.action.split('"')[1]}
                  </div>
                )}
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Check size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationsPage;
