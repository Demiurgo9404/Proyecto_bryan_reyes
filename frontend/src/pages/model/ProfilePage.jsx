import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEdit, FaEye, FaSave, FaChartBar, FaGlobe } from 'react-icons/fa';
import { useModel } from '../../contexts/ModelContext';
import ProfileForm from './components/ProfileForm';
import ProfilePreview from './components/ProfilePreview';
import StatsCard from './components/StatsCard';

// We'll use the ModelContext for data management

const ProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'stats'
  const navigate = useNavigate();
  
  // Get data and methods from ModelContext
  const {
    profile,
    isLoading,
    updateProfile,
    uploadProfileImage,
    updateAvailability,
    loadProfile,
    statistics,
  } = useModel();

  // Handle profile save
  const handleSaveProfile = async (updatedProfile) => {
    try {
      await updateProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    try {
      await uploadProfileImage(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      await updateAvailability(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Load profile data when component mounts
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            Volver al panel
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'preview' ? 'stats' : 'preview')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {viewMode === 'preview' ? (
                <>
                  <FaChartBar className="mr-2" />
                  Ver Estadísticas
                </>
              ) : (
                <>
                  <FaEye className="mr-2" />
                  Ver Vista Previa
                </>
              )}
            </button>
            
            {!isEditing && viewMode === 'preview' && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                <FaEdit className="mr-2" />
                Editar Perfil
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Vista previa */}
          <div className="lg:col-span-2">
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ProfileForm 
                  profile={profile || {}}
                  onSave={handleSaveProfile}
                  onCancel={() => setIsEditing(false)}
                  onImageUpload={handleImageUpload}
                  loading={isLoading}
                />
              </motion.div>
            ) : viewMode === 'preview' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ProfilePreview profile={profile || {}} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-xl shadow"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Estadísticas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatsCard 
                    title="Llamadas Totales"
                    value={profile.totalCalls}
                    icon={<FaVideo className="w-6 h-6" />}
                    trend="+12%"
                    trendType="up"
                  />
                  <StatsCard 
                    title="Seguidores"
                    value={profile.totalFans}
                    icon={<FaHeart className="w-6 h-6" />}
                    trend="+5%"
                    trendType="up"
                  />
                  <StatsCard 
                    title="Calificación"
                    value={profile.rating.toFixed(1)}
                    icon={<FaStar className="w-6 h-6" />}
                    trend="+0.2"
                    trendType="up"
                  />
                  <StatsCard 
                    title="Tiempo en línea"
                    value="8.5h"
                    icon={<FaGlobe className="w-6 h-6" />}
                    trend="+1.2h"
                    trendType="up"
                  />
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <FaVideo className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Llamada con usuario123</p>
                          <p className="text-sm text-gray-500">Hace 2 horas - 15 min</p>
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">+225 monedas</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FaComment className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Nuevo mensaje de viajero22</p>
                          <p className="text-sm text-gray-500">Hace 5 horas</p>
                        </div>
                      </div>
                      <span className="text-blue-600 font-medium">+5 monedas</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Columna derecha - Estado y estadísticas rápidas */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estado Actual</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Estado en línea</span>
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      profile.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                    <span className="text-sm font-medium">
                      {profile.isOnline ? 'En línea' : 'Desconectada'}
                    </span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusChange('online')}
                      disabled={isLoading || profile.status === 'online'}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${
                        profile.status === 'online'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      En línea
                    </button>
                    <button
                      onClick={() => handleStatusChange('busy')}
                      disabled={isLoading || profile.status === 'busy'}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${
                        profile.status === 'busy'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      Ocupada
                    </button>
                    <button
                      onClick={() => handleStatusChange('offline')}
                      disabled={isLoading || profile.status === 'offline'}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${
                        profile.status === 'offline'
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Desconectada
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Próximas sesiones</h3>
                <p className="text-sm text-gray-500">No hay sesiones programadas</p>
                <button className="mt-2 text-sm font-medium text-pink-600 hover:text-pink-700">
                  + Programar disponibilidad
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-xl shadow-lg text-white"
            >
              <h3 className="text-lg font-bold mb-2">Tus ganancias</h3>
              <p className="text-3xl font-bold mb-2">
                {Math.round(profile.totalCalls * profile.pricePerMinute * 0.7)}
                <span className="text-xl"> monedas</span>
              </p>
              <p className="text-sm opacity-80 mb-4">
                {Math.round(profile.totalCalls * profile.pricePerMinute * 0.7 * 0.1)} USD (aprox.)
              </p>
              <button className="w-full bg-white text-pink-600 py-2 px-4 rounded-md font-medium hover:bg-opacity-90 transition-colors">
                Retirar fondos
              </button>
              <p className="text-xs opacity-70 mt-2 text-center">
                Mínimo para retiro: 1000 monedas
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Consejos para mejorar tu perfil</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Mantén tu perfil actualizado</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Responde rápidamente a los mensajes</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Sube fotos de alta calidad</span>
                </li>
              </ul>
              <button className="mt-4 text-sm font-medium text-pink-600 hover:text-pink-700">
                Ver más consejos
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
