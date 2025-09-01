import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaUserFriends, FaVideo, FaStore, FaUsers, 
  FaGamepad, FaBookmark, FaFlag, FaEllipsisH, FaFacebookMessenger, 
  FaBell, FaUserCircle, FaChevronDown, FaChevronRight, FaChevronLeft, 
  FaPaperPlane, FaTimes, FaBars, FaPlus, FaSmile, FaImage, 
  FaVideo as FaVideoIcon, FaUserPlus, FaHeart, FaComment, 
  FaGlobeAmericas, FaUserTag, FaBell as FaBellSlash, FaSignOutAlt, FaCog, FaArrowUp, 
  FaCommentAlt, FaShare, FaRegHeart, FaRegComment, FaRegBookmark, FaBookmark as FaSolidBookmark, 
  FaChartLine, FaVideo as FaVideoSolid, FaSpinner, FaExclamationCircle
} from 'react-icons/fa';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { BiMessageRounded } from 'react-icons/bi';
import { RiLiveLine } from 'react-icons/ri';
import { useModel } from '../../contexts/ModelContext';
import { getAuthToken } from '../../utils/auth';
import { postService, storyService, notificationService } from '../../services/api';
import { useApi, usePaginatedApi } from '../../hooks/useApi';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import SocialFeed from './components/SocialFeed';
import StoryRing from '../../components/common/StoryRing';
import Toast from '../../components/common/Toast';
import './ModelDashboard.css';

const ModelDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout, refreshProfile } = useModel();
  
  // Estados de la UI
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [scrolled, setScrolled] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Refs
  const fileInputRef = useRef(null);
  const notificationsRef = useRef(null);
  const postFormRef = useRef(null);
  
  // Estados del formulario de publicación
  const [postContent, setPostContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [privacy, setPrivacy] = useState('public');
  
  // Obtener notificaciones
  const { 
    data: notificationsData, 
    loading: notificationsLoading, 
    error: notificationsError,
    execute: fetchNotifications
  } = useApi(useCallback(() => notificationService.getNotifications(), []), []);
  
  // Obtener historias
  const { 
    data: storiesData, 
    loading: storiesLoading, 
    error: storiesError,
    execute: fetchStories
  } = useApi(useCallback(() => storyService.getStories(), []), []);
  
  // Contador de notificaciones no leídas
  const unreadCount = notificationsData?.filter(n => !n.read).length || 0;
  
  // Actualizar notificaciones cuando cambian los datos
  useEffect(() => {
    if (notificationsData) {
      // Actualizar el contador de notificaciones no leídas
      const unread = notificationsData.filter(n => !n.read).length;
      // Aquí podrías actualizar el contador en el contexto global si es necesario
    }
  }, [notificationsData]);
  
  // Actualizar historias cuando se cargan
  useEffect(() => {
    if (storiesData) {
      // Asegurarse de que la historia del usuario esté al principio
      const userStory = {
        id: 'user-story',
        username: 'tu_historia',
        avatar: profile?.avatar || 'https://randomuser.me/api/portraits/women/1.jpg',
        hasUnseen: false
      };
      
      const otherStories = (storiesData.stories || []).map(story => ({
        id: story.id,
        username: story.user.username,
        avatar: story.user.avatar,
        hasUnseen: !story.viewed,
        media: story.media
      }));
      
      setActiveStories([userStory, ...otherStories]);
    }
  }, [storiesData, profile]);
  
  // Mostrar errores
  useEffect(() => {
    if (notificationsError) {
      showToast('Error al cargar las notificaciones', 'error');
    }
    
    if (storiesError) {
      showToast('Error al cargar las historias', 'error');
    }
  }, [notificationsError, storiesError]);

  // Verificar autenticación
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    // Cargar datos iniciales
    const loadInitialData = async () => {
      try {
        await refreshProfile();
        // Cargar notificaciones e historias en paralelo
        await Promise.all([fetchNotifications(), fetchStories()]);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        showToast('Error al cargar los datos del dashboard', 'error');
      }
    };
    
    loadInitialData();
  }, [navigate, location, refreshProfile, fetchNotifications, fetchStories]);

  // Efecto para el scroll del header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Mostrar notificación toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };
  
  // Cerrar toast manualmente
  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // Manejadores de eventos
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async () => {
    const newShowState = !showNotifications;
    setShowNotifications(newShowState);
    
    // Marcar notificaciones como leídas al abrir el menú
    if (newShowState && unreadCount > 0) {
      try {
        await notificationService.markAllAsRead();
        // Actualizar notificaciones locales
        const updatedNotifications = notificationsData.map(n => ({ ...n, read: true }));
        // Aquí deberías actualizar el estado de las notificaciones en el contexto
        // o donde las estés almacenando
      } catch (error) {
        console.error('Error al marcar notificaciones como leídas:', error);
        showToast('Error al actualizar notificaciones', 'error');
      }
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && !selectedFile) return;
    
    try {
      // Crear el objeto de datos del post
      const postData = {
        content: postContent.trim(),
        privacy,
        media: selectedFile ? [selectedFile] : []
      };
      
      // Llamar al servicio para crear el post
      const newPost = await postService.createPost(postData);
      
      // Mostrar mensaje de éxito
      showToast('¡Publicación creada con éxito!', 'success');
      
      // Reiniciar el formulario
      setPostContent('');
      setSelectedFile(null);
      setShowCreatePost(false);
      
      // Aquí podrías actualizar el feed o la lista de publicaciones
      // Por ejemplo, podrías tener un estado global o contexto que maneje las publicaciones
      // y actualizarlo con la nueva publicación
      
    } catch (error) {
      console.error('Error al crear la publicación:', error);
      
      // Mostrar mensaje de error al usuario
      const errorMessage = error.response?.data?.message || 'Error al crear la publicación';
      showToast(errorMessage, 'error');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo (soporte para imágenes y videos)
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
      if (!validTypes.includes(file.type)) {
        showToast('Formato de archivo no soportado. Usa imágenes JPG, PNG, GIF o MP4.', 'error');
        return;
      }
      
      // Validar tamaño del archivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showToast('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.', 'error');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleStoryClick = async (index) => {
    const story = activeStories[index];
    
    // No hacer nada si es la historia del usuario actual (para crear nueva historia)
    if (story.username === 'tu_historia') {
      // Aquí podrías abrir el selector de archivos para subir una nueva historia
      return;
    }
    
    setCurrentStoryIndex(index);
    setShowStoryViewer(true);
    
    // Marcar la historia como vista
    try {
      await storyService.viewStory(story.id);
      
      // Actualizar estado local
      setActiveStories(prev => 
        prev.map((s, i) => 
          i === index ? { ...s, hasUnseen: false } : s
        )
      );
    } catch (error) {
      console.error('Error al marcar la historia como vista:', error);
    }
  };

  const handleCloseStoryViewer = () => {
    setShowStoryViewer(false);
  };

  const handleNextStory = () => {
    setCurrentStoryIndex(prev => 
      prev < activeStories.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrevStory = () => {
    setCurrentStoryIndex(prev => 
      prev > 0 ? prev - 1 : activeStories.length - 1
    );
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Restablecer el input de archivo para permitir volver a seleccionar el mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handlePrivacyChange = (e) => {
    setPrivacy(e.target.value);
  };

  // Cerrar notificaciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sample data
  const onlineFriends = [
    { id: 1, name: 'María López', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', isOnline: true },
    { id: 2, name: 'Carlos Ruiz', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', isOnline: true },
    { id: 3, name: 'Ana Martínez', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', isOnline: true },
  ];

  const sponsoredPosts = [
    {
      id: 1,
      title: 'Aprende a modelar',
      description: 'Curso profesional de modelaje online',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&w=1000&q=80',
      sponsored: 'Patrocinado',
      page: 'Academia de Modelos'
    }
  ];

  const stats = [
    { 
      title: 'Seguidores', 
      value: profile?.followersCount || '1,245',
      change: `+${profile?.newFollowers || 15}`,
      changeType: 'increase' 
    },
    { 
      title: 'Me gusta', 
      value: profile?.likesCount || '3,421',
      change: `+${profile?.newLikes || 42}`,
      changeType: 'increase'
    },
    { 
      title: 'Comentarios', 
      value: profile?.commentsCount || '1,024',
      change: `+${profile?.newComments || 8}`,
      changeType: 'increase' 
    },
    { 
      title: 'Calificación', 
      value: profile?.rating || '4.8',
      change: profile?.ratingChange ? `+${profile.ratingChange}` : '+0.2',
      changeType: (profile?.ratingChange ?? 0) >= 0 ? 'increase' : 'decrease' 
    }
  ];

  // Acciones rápidas
  const quickActions = [
    { 
      title: 'Mi Perfil', 
      description: 'Actualiza tu información personal y preferencias',
      icon: <FaUserFriends className="w-6 h-6 text-pink-500" />,
      to: '/model/profile',
      color: 'bg-pink-50',
      textColor: 'text-pink-600',
      hoverColor: 'hover:bg-pink-100',
      onClick: () => setActiveTab('profile')
    },
    { 
      title: 'Video Llamadas', 
      description: 'Gestiona tus sesiones de video',
      icon: <FaVideo className="w-6 h-6 text-blue-500" />,
      to: '/model/video-calls',
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      hoverColor: 'hover:bg-blue-100'
    },
    { 
      title: 'Mensajes', 
      description: 'Revisa tus conversaciones',
      icon: <FaCommentAlt className="w-6 h-6 text-green-500" />,
      to: '/model/messages',
      color: 'bg-green-50',
      textColor: 'text-green-600',
      hoverColor: 'hover:bg-green-100'
    },
    { 
      title: 'Tienda', 
      description: 'Tus productos y servicios',
      icon: <FaStore className="w-6 h-6 text-purple-500" />,
      to: '/model/store',
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
      hoverColor: 'hover:bg-purple-100'
    },
    { 
      title: 'Ganancias', 
      description: 'Revisa tus ingresos y retiros',
      icon: <FaMoneyBillWave className="w-6 h-6 text-yellow-500" />,
      to: '/model/earnings',
      color: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      hoverColor: 'hover:bg-yellow-100'
    },
    { 
      title: 'Configuración', 
      description: 'Ajustes de tu cuenta',
      icon: <FaCog className="w-6 h-6 text-gray-500" />,
      to: '/model/settings',
      color: 'bg-gray-50',
      textColor: 'text-gray-600',
      hoverColor: 'hover:bg-gray-100'
    },
  ];

  // Elementos de navegación
  const navItems = [
    { id: 'feed', icon: <FaHome />, label: 'Inicio' },
    { id: 'explore', icon: <FaSearch />, label: 'Explorar' },
    { id: 'reels', icon: <RiLiveLine />, label: 'Reels' },
    { id: 'messages', icon: <BiMessageRounded />, label: 'Mensajes' },
    { 
      id: 'notifications', 
      icon: (
        <div className="relative">
          <IoMdNotificationsOutline />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      ), 
      label: 'Notificaciones' 
    },
    { 
      id: 'create', 
      icon: <FaPlus />, 
      label: 'Crear',
      onClick: () => setShowCreatePost(true)
    },
    { 
      id: 'profile', 
      icon: <FaUserCircle />, 
      label: 'Perfil',
      to: `/profile/${profile?.username || 'me'}`
    }
  ];

  // Renderizar el contenido del dashboard
  return (
      <div className="loverose-container">
        {/* Toast de notificación */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
                toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
              } text-white flex items-center`}
            >
              {toast.type === 'error' ? (
                <FaExclamationCircle className="mr-2" />
              ) : (
                <FaCheckCircle className="mr-2" />
              )}
              <span>{toast.message}</span>
              <button 
                onClick={closeToast}
                className="ml-4 text-white hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      {/* Header */}
      <header className={`loverose-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <Link to="/" className="logo">
            Love<span>Rose</span>
          </Link>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar en LoveRose" 
              className="search-input"
            />
          </div>
        </div>
        
        <nav className="header-nav">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={`/dashboard/${item.id}`}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
            >
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
              {item.id === 'create' ? (
                <button 
                  className="create-post-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowCreatePost(true);
                  }}
                >
                  {item.icon}
                </button>
              ) : (
                item.icon
              )}
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="header-actions">
          <button 
            className="action-btn"
            onClick={handleNotificationClick}
            aria-label="Notificaciones"
          >
            <IoMdNotificationsOutline />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          <button 
            className="action-btn"
            onClick={() => navigate('/dashboard/messages')}
            aria-label="Mensajes"
          >
            <BiMessageRounded />
          </button>
          
          <div className="user-menu">
            <button 
              className="user-avatar"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Menú de usuario"
            >
              <img 
                src={profile?.avatar || 'https://randomuser.me/api/portraits/women/1.jpg'} 
                alt={profile?.name || 'Usuario'} 
                className="avatar"
              />
            </button>
            
            {showMobileMenu && (
              <div className="dropdown-menu">
                <Link 
                  to={`/dashboard/profile/${profile?.username || 'me'}`}
                  className="dropdown-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FaUserCircle /> Perfil
                </Link>
                <Link 
                  to="/dashboard/settings"
                  className="dropdown-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FaCog /> Configuración
                </Link>
                <button 
                  className="dropdown-item"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
        
        <button 
          className="mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Menú"
        >
          {showMobileMenu ? <FaTimes /> : <FaBars />}
        </button>
      </header>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Left Sidebar - Navigation */}
        <aside className="left-sidebar">
          <div className="profile-card">
            <div className="relative">
              <StoryRing 
                size="lg" 
                seen={false} 
                onClick={() => handleStoryClick(0)}
                className="mx-auto"
              >
                <img 
                  src={profile?.avatar || 'https://randomuser.me/api/portraits/women/1.jpg'} 
                  alt={profile?.name || 'Usuario'} 
                  className="profile-avatar"
                />
              </StoryRing>
            </div>
            <h3>{profile?.name || 'Usuario'}</h3>
            <p className="text-sm text-gray-600">@{profile?.username || 'usuario'}</p>
          </div>
          
          <nav className="sidebar-nav">
            {[
              { id: 'feed', icon: <FaHome />, label: 'Inicio' },
              { id: 'explore', icon: <FaSearch />, label: 'Explorar' },
              { id: 'reels', icon: <RiLiveLine />, label: 'Reels' },
              { id: 'messages', icon: <BiMessageRounded />, label: 'Mensajes' },
              { id: 'notifications', icon: <IoMdNotificationsOutline />, label: 'Notificaciones', badge: unreadCount },
              { id: 'create', icon: <FaPlus />, label: 'Crear' },
              { id: 'profile', icon: <FaUserCircle />, label: 'Perfil' }
            ].map(item => (
              <button 
                key={item.id}
                className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'create') setShowCreatePost(true);
                  else navigate(`/dashboard/${item.id}`);
                }}
              >
                <span className="nav-icon">
                  {item.icon}
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="mt-auto pt-4 border-t border-gray-200">
            <button 
              className="w-full bg-gradient-to-r from-[#FF5864] to-[#FE3C72] text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              onClick={() => setShowCreatePost(true)}
            >
              <FaPlus /> Crear publicación
            </button>
          </div>
        </aside>
        
        {/* Main Feed */}
        <main className="feed">
          {/* Stories */}
          <div className="stories-container">
            <div className="stories">
              {activeStories.map((story, index) => (
                <div 
                  key={story.id} 
                  className="story"
                  onClick={() => handleStoryClick(index)}
                >
                  <StoryRing seen={!story.hasUnseen} size="lg">
                    <img 
                      src={story.avatar} 
                      alt={story.username} 
                      className="story-avatar"
                    />
                  </StoryRing>
                  <span className="story-username">
                    {story.username === 'tu_historia' ? 'Tu historia' : story.username}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Create Post */}
          <div className="create-post-card">
            <div className="flex items-center gap-3 p-4">
              <img 
                src={profile?.avatar || 'https://randomuser.me/api/portraits/women/1.jpg'} 
                alt={profile?.name || 'Usuario'} 
                className="w-10 h-10 rounded-full object-cover"
              />
              <button 
                className="flex-1 text-left text-gray-500 bg-gray-100 rounded-full py-2 px-4 hover:bg-gray-200 transition"
                onClick={() => setShowCreatePost(true)}
              >
                ¿Qué estás pensando, {profile?.name?.split(' ')[0] || 'Usuario'}?
              </button>
            </div>
            <div className="border-t border-gray-200 p-2 flex">
              <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-100 py-2 rounded-lg transition">
                <FaVideo className="text-red-500" /> Video en vivo
              </button>
              <button 
                className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-100 py-2 rounded-lg transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaImage className="text-green-500" /> Foto/video
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*" 
                  onChange={handleFileSelect}
                />
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-100 py-2 rounded-lg transition">
                <FaSmile className="text-yellow-500" /> Estado de ánimo
              </button>
            </div>
          </div>
          
          {/* Feed Content */}
          <SocialFeed />
        </main>
        
        {/* Right Sidebar */}
        <aside className="right-sidebar">
          {/* User Stats */}
          <div className="sidebar-section">
            <h4 className="text-lg font-semibold mb-4">Tus estadísticas</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card">
                <div className="stat-value">1.2k</div>
                <div className="stat-label">Seguidores</div>
                <div className="stat-change increase">
                  <FaArrowUp /> 12% esta semana
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-value">3.4k</div>
                <div className="stat-label">Me gusta</div>
                <div className="stat-change increase">
                  <FaArrowUp /> 8% esta semana
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-value">1.0k</div>
                <div className="stat-label">Comentarios</div>
                <div className="stat-change increase">
                  <FaArrowUp /> 5% esta semana
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-value">4.8</div>
                <div className="stat-label">Calificación</div>
                <div className="stat-change increase">
                  <FaArrowUp /> 0.2 esta semana
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="sidebar-section">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Acciones rápidas</h4>
              <button className="text-sm text-pink-500 font-medium">Ver todo</button>
            </div>
            
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-white`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{action.title}</h5>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
                <FaChevronRight className="text-gray-400" />
              </Link>
            ))}
          </div>
          
          {/* Online Friends */}
          <div className="sidebar-section">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Amigos en línea</h4>
              <button className="text-sm text-pink-500 font-medium">Ver todos</button>
            </div>
            
            <div className="space-y-3">
              {onlineFriends.map(friend => (
                <div key={friend.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="relative">
                    <img 
                      src={friend.avatar} 
                      alt={friend.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  </div>
                  <span className="font-medium text-gray-900">{friend.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sponsored */}
          <div className="sidebar-section">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Patrocinado</h4>
              <button className="text-sm text-gray-500">
                <FaEllipsisH />
              </button>
            </div>
            
            <div className="space-y-4">
              {sponsoredPosts.map(post => (
                <div key={post.id} className="sponsored-item">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="p-3">
                    <div className="text-xs font-medium text-pink-500 mb-1">{post.sponsored} • {post.page}</div>
                    <h5 className="font-medium text-gray-900 mb-1">{post.title}</h5>
                    <p className="text-sm text-gray-600">{post.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      
      {/* Notifications Modal */}
      {showNotifications && (
        <div className="notifications-modal">
          <div className="notifications-header">
            <h3>Notificaciones</h3>
            <button 
              className="mark-all-read"
              onClick={() => {
                setNotifications(notifications.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
              }}
            >
              Marcar todo como leído
            </button>
          </div>
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    {notification.type === 'like' && <FaHeart className="text-red-500" />}
                    {notification.type === 'comment' && <FaComment className="text-blue-500" />}
                    {notification.type === 'follow' && <FaUserPlus className="text-green-500" />}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <FaBellSlash className="text-gray-400 text-2xl mb-2" />
                <p>No hay notificaciones nuevas</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="modal-overlay">
          <div className="create-post-modal">
            <div className="modal-header">
              <h3>Crear publicación</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreatePost(false)}
                disabled={isPosting}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="post-author">
              <img 
                src={profile?.avatar || 'https://randomuser.me/api/portraits/women/1.jpg'} 
                alt={profile?.name || 'Usuario'} 
                className="author-avatar"
              />
              <div>
                <h4>{profile?.name || 'Usuario'}</h4>
                <div className="privacy-selector">
                  <FaGlobeAmericas className="text-gray-500" />
                  <span>Público</span>
                  <FaChevronDown className="text-xs" />
                </div>
              </div>
            </div>
            
            <form onSubmit={handleCreatePost} className="post-form">
              <textarea
                placeholder={`¿Qué estás pensando, ${profile?.name?.split(' ')[0] || 'Usuario'}?`}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                disabled={isPosting}
              />
              
              {selectedFile && (
                <div className="selected-file-preview">
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Preview" 
                    className="preview-image"
                  />
                  <button 
                    type="button" 
                    className="remove-file-btn"
                    onClick={() => setSelectedFile(null)}
                    disabled={isPosting}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              
              <div className="post-actions">
                <div className="action-buttons">
                  <label className="action-btn">
                    <FaImage className="text-green-500" />
                    <span>Foto/video</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileSelect}
                      accept="image/*,video/*"
                      disabled={isPosting}
                    />
                  </label>
                  <button type="button" className="action-btn">
                    <FaUserTag className="text-blue-500" />
                    <span>Etiquetar personas</span>
                  </button>
                  <button type="button" className="action-btn">
                    <FaSmile className="text-yellow-500" />
                    <span>Sentimiento/actividad</span>
                  </button>
                </div>
                
                <button 
                  type="submit" 
                  className="post-submit-btn"
                  disabled={isPosting || (!postContent.trim() && !selectedFile)}
                >
                  {isPosting ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Story Viewer Modal */}
      {showStoryViewer && activeStories.length > 0 && (
        <div className="story-viewer-overlay">
          <div className="story-viewer">
            <div className="story-header">
              <div className="story-user">
                <img 
                  src={activeStories[currentStoryIndex].avatar} 
                  alt={activeStories[currentStoryIndex].username} 
                  className="story-user-avatar"
                />
                <span>{activeStories[currentStoryIndex].username === 'tu_historia' ? 'Tu historia' : activeStories[currentStoryIndex].username}</span>
              </div>
              <button 
                className="close-story-btn"
                onClick={handleCloseStoryViewer}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="story-content">
              <div 
                className="story-nav prev-story"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevStory();
                }}
              >
                <FaChevronLeft />
              </div>
              
              <div className="story-media">
                <img 
                  src={activeStories[currentStoryIndex].avatar} 
                  alt={`Historia de ${activeStories[currentStoryIndex].username}`}
                />
                
                <div className="story-progress">
                  {activeStories.map((_, index) => (
                    <div 
                      key={index}
                      className={`progress-bar ${index === currentStoryIndex ? 'active' : ''} ${
                        index < currentStoryIndex ? 'viewed' : ''
                      }`}
                    />
                  ))}
                </div>
                
                <div className="story-actions">
                  <input 
                    type="text" 
                    placeholder="Envía un mensaje"
                    className="story-message-input"
                  />
                  <button className="send-message-btn">
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
              
              <div 
                className="story-nav next-story"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextStory();
                }}
              >
                <FaChevronRight />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDashboard;
