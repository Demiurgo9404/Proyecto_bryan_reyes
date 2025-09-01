import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreHorizontal, Paperclip, Mic, Smile, Send } from 'lucide-react';

const MessagesPage = () => {
  const [activeChat, setActiveChat] = useState(1);
  
  const conversations = [
    { id: 1, name: 'Juan Pérez', lastMessage: '¡Hola! ¿Cómo estás?', time: '10:30 AM', unread: 2, online: true },
    { id: 2, name: 'María García', lastMessage: 'Nos vemos mañana', time: 'Ayer', unread: 0, online: false },
    { id: 3, name: 'Carlos López', lastMessage: 'Gracias por tu mensaje', time: 'Ayer', unread: 0, online: true },
    { id: 4, name: 'Ana Martínez', lastMessage: '¿Vas a la fiesta?', time: 'Lun', unread: 1, online: false },
  ];

  const messages = [
    { id: 1, text: '¡Hola! ¿Cómo estás?', sent: false, time: '10:30 AM' },
    { id: 2, text: '¡Hola! Estoy bien, ¿y tú?', sent: true, time: '10:31 AM' },
    { id: 3, text: '¿Qué planes tienes para hoy?', sent: false, time: '10:32 AM' },
    { id: 4, text: 'Estoy trabajando en un nuevo proyecto. ¿Te gustaría unirte?', sent: true, time: '10:33 AM' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full bg-white rounded-xl shadow-sm overflow-hidden"
    >
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Mensajes</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <MoreHorizontal size={20} />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar mensajes"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white"
            />
          </div>
        </div>
        
        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setActiveChat(conversation.id)}
              className={`flex items-center p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                activeChat === conversation.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {conversation.name.charAt(0)}
                </div>
                {conversation.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{conversation.name}</h3>
                  <span className="text-xs text-gray-500">{conversation.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
              </div>
              {conversation.unread > 0 && (
                <span className="ml-2 w-5 h-5 flex items-center justify-center bg-pink-500 text-white text-xs font-medium rounded-full">
                  {conversation.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {conversations.find(c => c.id === activeChat)?.name.charAt(0) || 'U'}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    {conversations.find(c => c.id === activeChat)?.name || 'Usuario'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {conversations.find(c => c.id === activeChat)?.online ? 'En línea' : 'Desconectado'}
                  </p>
                </div>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sent
                          ? 'bg-pink-500 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 text-right ${
                        message.sent ? 'text-pink-100' : 'text-gray-500'
                      }`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <button className="text-gray-500 hover:text-gray-700 p-2">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="flex-1 border-0 focus:ring-0 focus:outline-none px-3 py-2 text-sm"
                />
                <button className="text-gray-500 hover:text-gray-700 p-2">
                  <Smile size={20} />
                </button>
                <button className="text-pink-500 hover:text-pink-600 p-2">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Selecciona una conversación para comenzar a chatear</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessagesPage;
