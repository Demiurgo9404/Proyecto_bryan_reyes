import React from 'react';
import { FaPlus, FaExclamationCircle, FaSync } from 'react-icons/fa';

const StoriesSection = ({ stories, onStoryClick, onAddStory, loading, error, onRetry }) => {
  // Ensure stories is always an array
  const safeStories = Array.isArray(stories) ? stories : [];
  
  // Add default user story at the beginning
  const allStories = [
    {
      id: 'user-story',
      isUser: true,
      username: 'Tu historia',
      avatar: null,
      hasUnseen: false
    },
    ...safeStories
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500 mb-2"></div>
        <p className="text-gray-600 text-sm">Cargando historias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col items-center justify-center h-40 text-center">
        <div className="text-yellow-500 mb-2">
          <FaExclamationCircle size={24} />
        </div>
        <p className="text-gray-700 mb-3">No se pudieron cargar las historias</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors flex items-center"
        >
          <FaSync className="mr-2" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6 overflow-x-auto">
      <div className="flex space-x-4 pb-2">
        {allStories.map((story) => (
          <div 
            key={story.id}
            onClick={() => story.isUser ? onAddStory() : onStoryClick(story)}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className={`w-16 h-16 rounded-full p-0.5 mb-1 ${
              story.hasUnseen 
                ? 'bg-gradient-to-tr from-yellow-400 to-pink-500' 
                : 'bg-gray-200'
            }`}>
              <div className="bg-white p-0.5 rounded-full h-full w-full flex items-center justify-center">
                {story.isUser ? (
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-blue-500">
                    <FaPlus />
                  </div>
                ) : (
                  <img 
                    src={story.avatar || '/default-avatar.png'} 
                    alt={story.username} 
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                )}
              </div>
            </div>
            <span className="text-xs text-gray-700 group-hover:text-blue-500 truncate w-16 text-center">
              {story.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesSection;
