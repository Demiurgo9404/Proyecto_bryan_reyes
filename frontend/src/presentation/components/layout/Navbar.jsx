import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaHeart, 
  FaComment, 
  FaUserShield, 
  FaSignOutAlt, 
  FaCoins, 
  FaHistory,
  FaCrown,
  FaUsers,
  FaFlask,
  FaCamera,
  FaUser,
  FaSearch,
  FaPlay,
  FaPlusCircle,
  FaCompass,
  FaVideo,
  FaUserFriends,
  FaBell,
  FaChartLine,
  FaEye,
  FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import CoinBalance from '../coins/CoinBalance';
import styled from '@emotion/styled';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to right, #eef2ff, #eff6ff);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(199, 210, 254, 0.5);
  z-index: 40;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem;
  max-width: 28rem;
  margin: 0 auto;
`;

const NavLinkBase = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  flex: 1;
  max-width: 5rem;
  
  &:hover {
    background-color: rgba(199, 210, 254, 0.3);
  }
`;

const NavLinkActive = styled(NavLinkBase)`
  background-color: rgba(199, 210, 254, 0.3);
`;

const NavLink = ({ $isActive, ...props }) => {
  const Component = $isActive ? NavLinkActive : NavLinkBase;
  return <Component {...props} />;
};

const IconContainer = styled.div`
  padding: 0.5rem;
  background-color: white;
  border-radius: 9999px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${NavLinkBase}:hover & {
    background-color: #e0e7ff;
  }
`;

const Label = styled.span`
  font-size: 0.75rem;
  margin-top: 0.25rem;
  color: #4f46e5;
  font-weight: 500;
  text-align: center;
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  background-color: #ef4444;
  color: white;
  font-size: 0.6875rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const CoinBalanceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.2);
  margin: 0 0.25rem;
  min-width: 5rem;
  
  &:hover {
    background: rgba(234, 179, 8, 0.15);
  }
`;

const CoinBalanceLabel = styled.span`
  font-size: 0.7rem;
  color: #92400e;
  font-weight: 600;
  margin-bottom: 0.15rem;
`;

const Navbar = ({ onLogout }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Check if a nav item is active based on the current route
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Get user roles for navigation
  const hasRole = (role) => user?.roles?.includes(role);
  
  // Determine primary role for dashboard navigation
  const getPrimaryRole = () => {
    if (hasRole('SuperAdmin')) return 'superadmin';
    if (hasRole('Admin')) return 'admin';
    if (hasRole('Study')) return 'study';
    if (hasRole('Model')) return 'model';
    return 'user';
  };

  const primaryRole = getPrimaryRole();

  // Get dashboard icon and label based on role
  const getDashboardConfig = () => {
    switch (primaryRole) {
      case 'superadmin':
        return { icon: FaCrown, label: 'Super Admin', color: 'text-purple-600' };
      case 'admin':
        return { icon: FaUserShield, label: 'Admin', color: 'text-blue-600' };
      case 'study':
        return { icon: FaFlask, label: 'Investigación', color: 'text-green-600' };
      case 'model':
        return { icon: FaCamera, label: 'Modelo', color: 'text-pink-600' };
      default:
        return { icon: FaUser, label: 'Usuario', color: 'text-gray-600' };
    }
  };

  const dashboardConfig = getDashboardConfig();
  const DashboardIcon = dashboardConfig.icon;

  // Get role-specific social features
  const getSocialFeatures = () => {
    const baseFeatures = [
      { path: '/social/feed', icon: FaHome, label: 'Inicio', color: 'text-blue-600' },
      { path: '/social/explore', icon: FaCompass, label: 'Explorar', color: 'text-purple-600' },
      { path: '/social/reels', icon: FaPlay, label: 'Reels', color: 'text-red-600' },
      { path: '/social/messages', icon: FaComment, label: 'Mensajes', color: 'text-green-600' }
    ];

    const roleSpecificFeatures = [];

    // SuperAdmin and Admin get analytics and moderation tools
    if (hasRole('SuperAdmin') || hasRole('Admin')) {
      roleSpecificFeatures.push(
        { path: '/social/analytics', icon: FaChartLine, label: 'Analytics', color: 'text-indigo-600' },
        { path: '/social/moderation', icon: FaShieldAlt, label: 'Moderación', color: 'text-orange-600' }
      );
    }

    // Models get enhanced profile and content creation tools
    if (hasRole('Model')) {
      roleSpecificFeatures.push(
        { path: '/social/studio', icon: FaVideo, label: 'Estudio', color: 'text-pink-600' },
        { path: '/social/insights', icon: FaEye, label: 'Insights', color: 'text-teal-600' }
      );
    }

    // Study role gets research and observation tools
    if (hasRole('Study')) {
      roleSpecificFeatures.push(
        { path: '/social/research', icon: FaFlask, label: 'Investigación', color: 'text-green-600' },
        { path: '/social/trends', icon: FaChartLine, label: 'Tendencias', color: 'text-blue-500' }
      );
    }

    return [...baseFeatures, ...roleSpecificFeatures];
  };

  const socialFeatures = getSocialFeatures();

  return (
    <NavContainer>
      <NavContent>
        <NavLink 
          to="/" 
          $isActive={location.pathname === '/'}
          aria-label="Dashboard"
        >
          <IconContainer>
            <DashboardIcon className={dashboardConfig.color} />
          </IconContainer>
          <Label>{dashboardConfig.label}</Label>
        </NavLink>
        
        {/* Social Media Features */}
        {socialFeatures.slice(0, 3).map((feature) => {
          const FeatureIcon = feature.icon;
          return (
            <NavLink 
              key={feature.path}
              to={feature.path} 
              $isActive={isActive(feature.path)}
              aria-label={feature.label}
            >
              <IconContainer>
                <FeatureIcon className={feature.color} />
              </IconContainer>
              <Label>{feature.label}</Label>
            </NavLink>
          );
        })}
        
        {/* Descubrimiento de Modelos - Solo para Users */}
        {hasRole('User') && (
          <NavLink 
            to="/discover-models" 
            $isActive={isActive('/discover-models')}
            aria-label="Descubrir"
          >
            <IconContainer>
              <FaHeart className="text-red-600" />
            </IconContainer>
            <Label>Descubrir</Label>
          </NavLink>
        )}
        
        {/* Profile Link */}
        <NavLink 
          to={`/social/profile/${user?.username}`}
          $isActive={isActive('/social/profile')}
          aria-label="Mi Perfil"
        >
          <IconContainer>
            <FaUser className="text-gray-600" />
          </IconContainer>
          <Label>Perfil</Label>
        </NavLink>
        
        {/* Show role-specific navigation options */}
        {(hasRole('SuperAdmin') || hasRole('Admin')) && (
          <NavLink 
            to="/admin" 
            $isActive={isActive('/admin')}
            aria-label="Administración"
          >
            <IconContainer>
              <FaUsers className="text-blue-600" />
            </IconContainer>
            <Label>Usuarios</Label>
          </NavLink>
        )}
        
        {hasRole('Model') && (
          <NavLink 
            to="/model" 
            $isActive={isActive('/model')}
            aria-label="Panel Modelo"
          >
            <IconContainer>
              <FaCamera className="text-pink-600" />
            </IconContainer>
            <Label>Mi Panel</Label>
          </NavLink>
        )}
        
        {hasRole('Study') && (
          <NavLink 
            to="/study" 
            $isActive={isActive('/study')}
            aria-label="Investigación"
          >
            <IconContainer>
              <FaFlask className="text-green-600" />
            </IconContainer>
            <Label>Estudios</Label>
          </NavLink>
        )}
        
        <NavLink 
          to="/coins" 
          $isActive={isActive('/coins')}
          aria-label="Monedas"
        >
          <IconContainer>
            <FaCoins className="text-yellow-500" />
          </IconContainer>
          <Label>Monedas</Label>
        </NavLink>
        
        <CoinBalanceContainer>
          <CoinBalanceLabel>Saldo</CoinBalanceLabel>
          <CoinBalance 
            onClick={() => {}}
            showRefresh={false}
          />
        </CoinBalanceContainer>
        
        <button 
          onClick={onLogout}
          className="flex flex-col items-center p-2 rounded-xl hover:bg-indigo-100/50 transition-all duration-200 group"
          aria-label="Cerrar sesión"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-indigo-100 transition-colors duration-200">
            <FaSignOutAlt className="text-xl text-gray-600" />
          </div>
          <span className="text-xs mt-1 text-gray-700 font-medium">Salir</span>
        </button>
      </NavContent>
    </NavContainer>
  );
};

Navbar.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default Navbar;
