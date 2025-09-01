import React from 'react';
import { FaHeart, FaVideo, FaComment, FaStar, FaGlobe, FaUserFriends } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ProfilePreview = ({ profile }) => {
  if (!profile) return null;

  const {
    displayName = 'Nombre Artístico',
    age = 25,
    country = 'País',
    languages = 'Idiomas',
    bio = 'Descripción del perfil...',
    profileImage,
    isOnline = false,
    pricePerMinute = 10,
    rating = 4.8,
    totalCalls = 0,
    totalFans = 0
  } = profile;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header with cover and profile image */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-pink-500 to-purple-600"></div>
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt={displayName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <FaUserFriends className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-14 pb-6 px-6 text-center">
        <div className="flex justify-center items-center space-x-2">
          <h2 className="text-2xl font-bold text-gray-900">{displayName}, {age}</h2>
          <span className="text-gray-500">•</span>
          <div className="flex items-center text-yellow-400">
            <FaStar className="w-5 h-5 fill-current" />
            <span className="ml-1 text-gray-700 font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="mt-1 text-sm text-gray-500 flex items-center justify-center space-x-3">
          <span className="flex items-center">
            <FaGlobe className="w-3.5 h-3.5 mr-1" />
            {country}
          </span>
          <span>•</span>
          <span>{languages}</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalCalls}</div>
            <div className="text-xs text-gray-500">Llamadas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalFans}</div>
            <div className="text-xs text-gray-500">Seguidores</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{pricePerMinute}</div>
            <div className="text-xs text-gray-500">Monedas/min</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-700 text-left">
          <h3 className="font-semibold mb-1">Sobre mí</h3>
          <p className="whitespace-pre-line">{bio || 'No hay descripción disponible.'}</p>
        </div>

        <div className="mt-6 flex space-x-3 justify-center">
          <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            <FaHeart className="mr-2" />
            Seguir
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
            <FaVideo className="mr-2" />
            Llamar
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
            <FaComment className="mr-2" />
            Mensaje
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePreview;
