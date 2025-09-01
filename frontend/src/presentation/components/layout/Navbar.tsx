import React from 'react';
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
  FaCommentDots,
  FaPlayCircle
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

interface NavLinkProps {
  $isActive?: boolean;
}

const NavLink = styled(Link)<NavLinkProps>`
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
  
  ${({ $isActive }) => $isActive && `
    background-color: rgba(199, 210, 254, 0.3);
  `}
`;

const IconContainer = styled.div`
  padding: 0.5rem;
  background-color: white;
  border-radius: 9999px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${NavLink}:hover & {
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

interface NavbarProps {
  onLogout: () => void;
}

interface DashboardConfig {
  icon: React.ComponentType<any>;
  label: string;
  color: string;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Check if a nav item is active based on the current route
  const isActive = (path: string): boolean => {
    return location.pathname.startsWith(path);
  };

  // Get user roles for navigation
  const hasRole = (role: string): boolean => user?.roles?.includes(role) || false;
  
  // Determine primary role for dashboard navigation
  const getPrimaryRole = (): string => {
    if (hasRole('SuperAdmin')) return 'superadmin';
    if (hasRole('Admin')) return 'admin';
    if (hasRole('Study')) return 'study';
    if (hasRole('Model')) return 'model';
    return 'user';
  };

  const primaryRole = getPrimaryRole();

  // Get dashboard icon and label based on role
  const getDashboardConfig = (): DashboardConfig => {
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

  return (
    <NavContainer>
      <NavContent>
        {/* Dashboard/Home */}
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
        
        {/* Feed Social */}
        <NavLink 
          to="/feed" 
          $isActive={isActive('/feed')}
          aria-label="Feed"
        >
          <IconContainer>
            <FaHome className="text-indigo-600" />
          </IconContainer>
          <Label>Inicio</Label>
        </NavLink>
        
        {/* Explorar */}
        <NavLink 
          to="/explore" 
          $isActive={isActive('/explore')}
          aria-label="Explorar"
        >
          <IconContainer>
            <FaSearch className="text-purple-600" />
          </IconContainer>
          <Label>Explorar</Label>
        </NavLink>
        
        {/* Reels */}
        <NavLink 
          to="/reels" 
          $isActive={isActive('/reels')}
          aria-label="Reels"
        >
          <IconContainer>
            <FaPlayCircle className="text-red-600" />
          </IconContainer>
          <Label>Reels</Label>
        </NavLink>
        
        {/* Mensajes */}
        <NavLink 
          to="/messages" 
          $isActive={isActive('/messages')}
          aria-label="Mensajes"
        >
          <IconContainer>
            <FaCommentDots className="text-green-600" />
            <NotificationBadge>3</NotificationBadge>
          </IconContainer>
          <Label>Mensajes</Label>
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
            <Label>Admin</Label>
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
            <Label>Mi Perfil</Label>
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

export default Navbar;
