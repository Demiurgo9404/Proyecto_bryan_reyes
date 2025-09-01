import React from 'react';
import { FaPlus, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import StoryRing from '../../../components/common/StoryRing';

const StoriesSection = ({ 
  stories = [], 
  onStoryClick, 
  onAddStory, 
  loading = false, 
  error = null,
  onRetry 
}) => {
  // Ensure stories is always an array
  const safeStories = Array.isArray(stories) ? stories : [];
  
  // Asegurarse de que siempre haya una historia del usuario al principio
  const userStory = {
    id: 'user-story',
    username: 'Tu historia',
    avatar: '/default-avatar.png',
    hasUnseen: false,
    isAdd: true
  };

  const allStories = [userStory, ...safeStories];

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500 mb-2"></div>
        <p className="text-gray-600 text-sm">Cargando historias...</p>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col items-center justify-center h-40 text-center">
        <div className="text-yellow-500 mb-2">
          <FaExclamationTriangle size={24} />
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

  // Mostrar historias vacías
  if (allStories.length <= 1) { // Solo la historia del usuario
    return (
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <p className="text-gray-600 text-center">
          Aún no hay historias. ¡Crea la tuya!
        </p>
        <div className="flex justify-center mt-4">
          <button
            onClick={onAddStory}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center text-sm"
          >
            <FaPlus className="mr-2" /> Crear historia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Historias</h3>
      <div className="relative">
        <div className="flex space-x-4 pb-2 overflow-x-auto scrollbar-hide">
          {allStories.map((story, index) => (
            <div key={story.id || index} className="flex flex-col items-center flex-shrink-0">
              <div className="relative">
                <StoryRing
                  size={16}
                  hasUnseen={story.hasUnseen && !story.isAdd}
                  onClick={() => story.isAdd ? onAddStory() : onStoryClick(story.id)}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  disabled={loading}
                >
                  <img
                    src={story.avatar}
                    alt={story.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                    loading="lazy"
                  />
                  {story.isAdd && (
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1.5">
                      <FaPlus size={10} />
                    </div>
                  )}
                </StoryRing>
              </div>
              <span className="text-xs mt-2 text-gray-700 truncate w-16 text-center">
                {story.username}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

StoriesSection.defaultProps = {
  stories: [],
  loading: false,
  error: null,
  onStoryClick: () => {},
  onAddStory: () => {},
  onRetry: () => window.location.reload()
};

export default StoriesSection;
