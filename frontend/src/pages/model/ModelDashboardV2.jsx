import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { postService, storyService, notificationService } from '../../services/api';
import AuthContext from '../../contexts/AuthContext';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import DashboardHeader from './components/DashboardHeader';
import StoriesSection from './components/StoriesSection';
import CreatePostModal from './components/CreatePostModal';
import { isAuthenticated, getAuthToken } from '../../utils/auth';

const ModelDashboardV2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  
  // Estados de la UI
  const [scrolled, setScrolled] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Verificar autenticación al cargar
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
    }
  }, [navigate, location.pathname]);
  
  // Obtener perfil del usuario
  const { 
    data: profile, 
    loading: profileLoading, 
    error: profileError,
    execute: fetchProfile 
  } = useApi(
    useCallback(() => ({
      url: '/auth/me',
      method: 'GET'
    }), []),
    null,
    true // Cargar inmediatamente
  );
  
  // Obtener historias
  const { 
    data: stories = [], 
    loading: storiesLoading, 
    error: storiesError,
    execute: fetchStories
  } = useApi(
    useCallback(() => ({
      url: '/stories',
      method: 'GET',
      params: {
        limit: 20,
        offset: 0
      }
    }), []),
    [],
    true // Cargar inmediatamente
  );
  
  // Obtener notificaciones
  const { 
    data: notificationsData, 
    loading: notificationsLoading, 
    error: notificationsError,
    execute: fetchNotifications
  } = useApi(
    useCallback(() => ({
      url: '/notifications',
      method: 'GET',
      params: {
        limit: 10,
        offset: 0
      }
    }), []),
    [],
    true // Cargar inmediatamente
  );
  
  // Función para recargar datos
  const refreshData = useCallback(() => {
    fetchProfile();
    fetchStories();
    fetchNotifications();
  }, [fetchProfile, fetchStories, fetchNotifications]);
  
  // Efecto para el scroll del header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Manejadores de eventos
  const handleCreatePost = async (formData) => {
    if (!isAuthenticated()) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await postService.createPost(formData);
      setShowCreatePost(false);
      
      // Actualizar la lista de publicaciones después de crear una nueva
      refreshData();
      
      // Mostrar notificación de éxito
      console.log('Publicación creada:', response);
      // Aquí podrías usar un sistema de notificaciones como toast()
      
    } catch (error) {
      console.error('Error al crear la publicación:', error);
      // Mostrar error al usuario
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStoryClick = async (storyId) => {
    if (!isAuthenticated()) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }
    
    if (storyId === 'user-story') {
      // Abrir selector de archivos para subir historia
      return;
    }
    
    try {
      await storyService.viewStory(storyId);
      // Actualizar la lista de historias después de ver una
      fetchStories();
    } catch (error) {
      console.error('Error al ver la historia:', error);
      // Mostrar error al usuario
    }
  };
  
  const handleAddStory = () => {
    // Implementar lógica para agregar una nueva historia
    console.log('Agregar nueva historia');
  };
  
  // Asegurarse de que notifications sea un array antes de usar filter
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];
  const unreadNotifications = notifications.filter(n => n && !n.read).length;
  
  // Manejar cierre de sesión
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  // Mostrar loading mientras se cargan los datos del perfil
  if (profileLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  
  // Mostrar error si hay un problema al cargar el perfil
  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar el perfil</h2>
          <p className="text-gray-600 mb-4">No se pudo cargar la información del usuario.</p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-pink-500 border border-pink-500 rounded-lg hover:bg-pink-50 transition-colors"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Verificar si el usuario tiene el rol de modelo
  if (user?.role !== 'model') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Acceso no autorizado</h2>
          <p className="text-gray-600 mb-4">No tienes permiso para acceder a esta sección.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader
          scrolled={scrolled}
          onSearch={setSearchQuery}
          onNotificationClick={() => navigate('/notifications')}
          onProfileClick={() => navigate(`/profile/${profile?.username || 'me'}`)}
          onLogout={handleLogout}
          onCreatePost={() => setShowCreatePost(true)}
          unreadCount={unreadNotifications}
          profile={profile}
        />
        
        <main className="pt-20 pb-10 px-4 max-w-4xl mx-auto">
          {/* Sección de Historias */}
          <StoriesSection
            stories={stories}
            onStoryClick={handleStoryClick}
            onAddStory={handleAddStory}
            loading={storiesLoading}
            error={storiesError}
            onRetry={fetchStories}
          />
          
          {/* Feed de publicaciones */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Bienvenid{profile?.gender === 'female' ? 'a' : 'o'} de vuelta, {profile?.name || 'Modelo'}
            </h2>
            <p className="text-gray-600 mb-4">
              Gestiona tu contenido y conecta con tu audiencia.
            </p>
            
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-pink-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-pink-600">{stories?.length || 0}</p>
                <p className="text-sm text-gray-600">Historias</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{profile?.followerCount || 0}</p>
                <p className="text-sm text-gray-600">Seguidores</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{unreadNotifications}</p>
                <p className="text-sm text-gray-600">Notificaciones</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">
                  {profile?.is_verified ? '✓' : '✗'}
                </p>
                <p className="text-sm text-gray-600">Verificado</p>
              </div>
            </div>
          </div>
        </main>
        
        {/* Modal para crear publicación */}
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
          isSubmitting={isSubmitting}
        />
      </div>
    </ErrorBoundary>
  );
};

export default ModelDashboardV2;
