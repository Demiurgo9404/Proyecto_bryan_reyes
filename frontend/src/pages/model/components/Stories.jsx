import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StoryCard = ({ user, image, isAdd = false, onClick }) => {
  return (
    <motion.div 
      className={`relative h-48 rounded-xl overflow-hidden cursor-pointer ${!isAdd ? 'shadow-md' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {isAdd ? (
        <div className="h-full bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4">
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
            <FaPlus className="text-pink-500 text-xl" />
          </div>
          <span className="text-sm font-medium text-gray-700">Crear historia</span>
        </div>
      ) : (
        <>
          <img 
            src={image} 
            alt="Historia" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-medium text-sm">{user}</p>
          </div>
          {user && (
            <div className="absolute top-2 left-2 w-10 h-10 rounded-full border-4 border-pink-500 overflow-hidden">
              <img 
                src={image} 
                alt={user} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

const Stories = () => {
  // Datos de ejemplo para las historias
  const stories = [
    { id: 1, user: 'Ana García', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80' },
    { id: 2, user: 'Carlos López', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80' },
    { id: 3, user: 'María Rodríguez', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80' },
    { id: 4, user: 'Juan Pérez', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80' },
  ];

  const handleAddStory = () => {
    console.log('Añadir nueva historia');
    // Aquí iría la lógica para añadir una nueva historia
  };

  const handleViewStory = (story) => {
    console.log('Ver historia:', story.user);
    // Aquí iría la lógica para ver una historia
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Historias</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StoryCard isAdd onClick={handleAddStory} />
        {stories.map((story) => (
          <StoryCard 
            key={story.id} 
            user={story.user} 
            image={story.image} 
            onClick={() => handleViewStory(story)}
          />
        ))}
      </div>
    </div>
  );
};

export default Stories;
