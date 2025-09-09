import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import {
  Home,
  Search,
  Explore,
  Message,
  Favorite,
  Settings,
  Add,
  Notifications,
  VideoLibrary,
  TrendingUp
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const SidebarContainer = styled(Paper)(({ theme }) => ({
  width: 280,
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 64, // AppBar height
  backgroundColor: '#fafafa',
  borderRight: '1px solid #e0e0e0',
  overflowY: 'auto',
  zIndex: 1200,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  padding: theme.spacing(2, 2, 1, 2),
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  '&:hover': {
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
  },
  '&.active': {
    backgroundColor: 'rgba(233, 30, 99, 0.12)',
    color: '#e91e63',
    '& .MuiListItemIcon-root': {
      color: '#e91e63',
    },
  },
}));

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  badge?: number;
  isNew?: boolean;
}

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  userRole = 'User'
}) => {
  const navigationItems: SidebarItem[] = [
    { id: 'inicio', label: 'Inicio', icon: <Home /> },
    { id: 'explorar', label: 'Explorar', icon: <Explore /> },
    { id: 'tendencias', label: 'Tendencias', icon: <TrendingUp /> },
  ];

  const actionItems: SidebarItem[] = [
    { id: 'crear', label: 'Crear contenido', icon: <Add /> },
    ...(userRole === 'Model' ? [
      { id: 'transmitir', label: 'Transmitir en vivo', icon: <VideoLibrary />, isNew: true }
    ] : []),
  ];

  const communicationItems: SidebarItem[] = [
    { id: 'mensajes', label: 'Mensajes', icon: <Message />, badge: 3 },
    { id: 'notificaciones', label: 'Notificaciones', icon: <Notifications />, badge: 5 },
    { id: 'favoritos', label: 'Favoritos', icon: <Favorite /> },
  ];

  const accountItems: SidebarItem[] = [
    { id: 'configuracion', label: 'Configuración', icon: <Settings /> },
  ];

  const renderSection = (title: string, items: SidebarItem[]) => (
    <>
      <SectionTitle>{title}</SectionTitle>
      <List dense>
        {items.map((item) => (
          <ListItem key={item.id} disablePadding>
            <StyledListItemButton
              className={activeSection === item.id ? 'active' : ''}
              onClick={() => onSectionChange(item.id)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: activeSection === item.id ? 600 : 400,
                }}
              />
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  color="error"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
              {item.isNew && (
                <Chip
                  label="Nuevo"
                  size="small"
                  color="success"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <SidebarContainer elevation={0}>
      {renderSection('Navegación', navigationItems)}
      <Divider sx={{ my: 1 }} />
      {renderSection('Acciones', actionItems)}
      <Divider sx={{ my: 1 }} />
      {renderSection('Comunicación', communicationItems)}
      <Divider sx={{ my: 1 }} />
      {renderSection('Cuenta', accountItems)}
    </SidebarContainer>
  );
};

export default Sidebar;
