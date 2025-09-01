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

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  
  // UI States
  const [scrolled, setScrolled] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Check authentication on load
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
    }
  }, [navigate, location]);

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch profile data
  const { 
    data: profile, 
    loading: profileLoading, 
    error: profileError,
    execute: fetchProfile
  } = useApi(
    useCallback(() => ({
      url: '/users/me',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    }), []),
    [],
    true // Load immediately
  );

  // Fetch notifications
  const { 
    data: notificationsData, 
    loading: notificationsLoading, 
    error: notificationsError,
    execute: fetchNotifications
  } = useApi(
    useCallback(() => ({
      url: '/notifications',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      },
      params: {
        limit: 10,
        offset: 0
      }
    }), []),
    [],
    true // Load immediately
  );

  // Ensure notifications is always an array
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];
  const unreadNotifications = notifications.filter(n => n && !n.read).length;

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  // Show loading while profile is loading
  if (profileLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Show error if profile fails to load
  if (profileError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-lg mb-4">Error al cargar el perfil</div>
        <button 
          onClick={fetchProfile}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
        >
          Reintentar
        </button>
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
          {/* Welcome Section */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Bienvenido de vuelta, {profile?.name || 'Usuario'}
            </h2>
            <p className="text-gray-600">
              Aquí puedes ver las últimas actualizaciones de los modelos que sigues.
            </p>
          </div>

          {/* Stories Section */}
          <StoriesSection
            stories={[]}
            onStoryClick={(story) => console.log('Story clicked', story)}
            onAddStory={() => console.log('Add story')}
            loading={false}
            error={null}
            onRetry={() => {}}
          />

          {/* Feed Section */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Últimas publicaciones
            </h3>
            <div className="text-center py-8 text-gray-500">
              No hay publicaciones recientes. Sigue a más modelos para ver su contenido.
            </div>
          </div>
        </main>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={async (postData) => {
          try {
            setIsSubmitting(true);
            // Implement post creation logic here
            console.log('Creating post:', postData);
            setShowCreatePost(false);
          } catch (error) {
            console.error('Error creating post:', error);
          } finally {
            setIsSubmitting(false);
          }
        }}
        isSubmitting={isSubmitting}
      />
    </ErrorBoundary>
  );
};

export default UserDashboard;
