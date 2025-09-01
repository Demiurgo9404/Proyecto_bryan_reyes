import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaUserFriends, 
  FaVideo, 
  FaStore, 
  FaUsers, 
  FaBell, 
  FaSearch, 
  FaEllipsisH,
  FaFacebookMessenger,
  FaGamepad,
  FaBookmark,
  FaFlag,
  FaUserCircle,
  FaCog
} from 'react-icons/fa';
import { useModel } from '../../contexts/ModelContext';
import { getAuthToken } from '../../utils/auth';
import SocialFeed from './components/SocialFeed';
import './ModelDashboard.css';

const ModelDashboard = () => {
  const navigate = useNavigate();
  const { profile, logout } = useModel();
  const [activeTab, setActiveTab] = useState('feed');
  
  // Verificar autenticación
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  return (
    <div className="facebook-container">
      {/* Header */}
      <header className="facebook-header">
        <div className="header-left">
          <div className="logo">LoveRose</div>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Buscar en LoveRose" />
          </div>
        </div>
        
        <nav className="header-center">
          <button 
            className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`} 
            onClick={() => setActiveTab('feed')}
          >
            <FaHome className="nav-icon" />
          </button>
          <button className="nav-item">
            <FaUserFriends className="nav-icon" />
          </button>
          <button className="nav-item">
            <FaVideo className="nav-icon" />
          </button>
          <button className="nav-item">
            <FaStore className="nav-icon" />
          </button>
          <button className="nav-item">
            <FaUsers className="nav-icon" />
          </button>
        </nav>
        
        <div className="header-right">
          <button className="header-icon">
            <FaFacebookMessenger />
          </button>
          <button className="header-icon">
            <FaBell />
          </button>
          <button className="header-icon" onClick={handleLogout}>
            <FaUserCircle />
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div className="profile-card">
            <img 
              src={profile?.avatar || 'https://randomuser.me/api/portraits/women/1.jpg'} 
              alt={profile?.name || 'Usuario'} 
              className="profile-avatar"
            />
            <h3>{profile?.name || 'Usuario'}</h3>
          </div>
          
          <nav className="sidebar-nav">
            <button className={`nav-btn ${activeTab === 'feed' ? 'active' : ''}`}>
              <FaHome className="nav-icon" />
              <span>Inicio</span>
            </button>
            <button className="nav-btn">
              <FaUserFriends className="nav-icon" />
              <span>Amigos</span>
            </button>
            <button className="nav-btn">
              <FaVideo className="nav-icon" />
              <span>Watch</span>
            </button>
            <button className="nav-btn">
              <FaStore className="nav-icon" />
              <span>Marketplace</span>
            </button>
            <button className="nav-btn">
              <FaUsers className="nav-icon" />
              <span>Grupos</span>
            </button>
            <button className="nav-btn">
              <FaGamepad className="nav-icon" />
              <span>Juegos</span>
            </button>
          </nav>
          
          <div className="shortcuts">
            <h4>Tus accesos directos</h4>
            <button className="shortcut-btn">
              <FaBookmark className="shortcut-icon" />
              <span>Guardados</span>
            </button>
            <button className="shortcut-btn">
              <FaFlag className="shortcut-icon" />
              <span>Páginas</span>
            </button>
          </div>
        </aside>
        
        {/* Feed */}
        <main className="feed">
          <SocialFeed />
        </main>
        
        {/* Right Sidebar */}
        <aside className="right-sidebar">
          <div className="contacts">
            <div className="contacts-header">
              <h4>Contactos</h4>
              <div className="contact-actions">
                <button><FaVideo /></button>
                <button><FaSearch /></button>
                <button><FaEllipsisH /></button>
              </div>
            </div>
            
            <div className="contact-list">
              {onlineFriends.map(friend => (
                <div key={friend.id} className="contact-item">
                  <div className="contact-avatar-container">
                    <img src={friend.avatar} alt={friend.name} className="contact-avatar" />
                    {friend.isOnline && <span className="online-indicator"></span>}
                  </div>
                  <span>{friend.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="sponsored">
            <div className="sponsored-header">
              <h4>Anuncios patrocinados</h4>
              <button><FaEllipsisH /></button>
            </div>
            
            <div className="sponsored-content">
              {sponsoredPosts.map(post => (
                <div key={post.id} className="sponsored-item">
                  <img src={post.image} alt={post.title} className="sponsored-image" />
                  <div className="sponsored-details">
                    <div className="sponsored-badge">{post.sponsored} • {post.page}</div>
                    <h5>{post.title}</h5>
                    <p>{post.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ModelDashboard;
