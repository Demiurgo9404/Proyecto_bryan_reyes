import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/presentation/contexts/AuthContext';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
  Collapse,
  alpha
} from '@mui/material';
import {
  Home as HomeIcon,
  VideoCall as LiveIcon,
  PhotoLibrary as GalleryIcon,
  Chat as ChatIcon,
  Schedule as ScheduleIcon,
  AttachMoney as EarningsIcon,
  BarChart as StatsIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon
} from '@mui/icons-material';

interface ModelSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const drawerWidth = 260;

const ModelSidebar: React.FC<ModelSidebarProps> = ({ mobileOpen, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [expanded, setExpanded] = React.useState<{[key: string]: boolean}>({
    content: false,
    earnings: false,
  });

  const handleExpandClick = (section: string) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { 
      text: 'Inicio', 
      icon: <HomeIcon />, 
      path: '/model/dashboard',
      type: 'item' 
    },
    { 
      text: 'Transmitir en Vivo', 
      icon: <LiveIcon />, 
      path: '/model/live',
      type: 'item',
      highlight: true
    },
    { 
      text: 'Contenido', 
      icon: <GalleryIcon />, 
      type: 'expandable',
      items: [
        { text: 'Galería', path: '/model/gallery' },
        { text: 'Subir Contenido', path: '/model/upload' },
        { text: 'Programar Publicación', path: '/model/schedule-post' },
      ]
    },
    { 
      text: 'Mensajes', 
      icon: <ChatIcon />, 
      path: '/model/messages',
      type: 'item',
      badge: 3 // Example badge count
    },
    { 
      text: 'Agenda', 
      icon: <ScheduleIcon />, 
      path: '/model/schedule',
      type: 'item' 
    },
    { 
      text: 'Ganancias', 
      icon: <EarningsIcon />, 
      type: 'expandable',
      items: [
        { text: 'Resumen', path: '/model/earnings' },
        { text: 'Retiros', path: '/model/withdrawals' },
        { text: 'Estadísticas', path: '/model/earnings/stats' },
      ]
    },
    { 
      text: 'Estadísticas', 
      icon: <StatsIcon />, 
      path: '/model/analytics',
      type: 'item' 
    },
    { 
      text: 'Notificaciones', 
      icon: <NotificationsIcon />, 
      path: '/model/notifications',
      type: 'item',
      badge: 5 // Example badge count
    },
    { 
      text: 'Configuración', 
      icon: <SettingsIcon />, 
      path: '/model/settings',
      type: 'item' 
    },
  ];

  const drawerContent = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      bgcolor: 'background.paper',
      borderRight: `1px solid ${theme.palette.divider}`,
    }}>
      {/* Logo and Close Button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          LoveRose
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} size="small">
            <ExpandLess />
          </IconButton>
        )}
      </Box>

      {/* User Profile Section */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Avatar 
          src={user?.profileImage} 
          sx={{ 
            width: 48, 
            height: 48, 
            mr: 2,
            border: `2px solid ${theme.palette.primary.main}`
          }}
        >
          {user?.displayName?.[0] || 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" noWrap>
            {user?.displayName || 'Usuario'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            @{user?.username || 'usuario'}
          </Typography>
        </Box>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
        <List>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.text}>
              {item.type === 'item' ? (
                <ListItem disablePadding>
                  <ListItemButton
                    selected={isActive(item.path || '')}
                    onClick={() => item.path && handleNavigation(item.path)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.15),
                        },
                        '& .MuiListItemIcon-root': {
                          color: theme.palette.primary.main,
                        },
                      },
                      ...(item.highlight ? {
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.15),
                        },
                        '& .MuiListItemIcon-root': {
                          color: theme.palette.error.main,
                        },
                      } : {}),
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: isActive(item.path || '') || item.highlight ? 600 : 'normal',
                      }}
                    />
                    {item.badge && (
                      <Box
                        sx={{
                          backgroundColor: theme.palette.error.main,
                          color: theme.palette.error.contrastText,
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          ml: 1,
                        }}
                      >
                        {item.badge}
                      </Box>
                    )}
                  </ListItemButton>
                </ListItem>
              ) : (
                <>
                  <ListItemButton
                    onClick={() => handleExpandClick(item.text.toLowerCase())}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        variant: 'body2',
                      }}
                    />
                    {expanded[item.text.toLowerCase()] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={expanded[item.text.toLowerCase()]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.items?.map((subItem) => (
                        <ListItemButton
                          key={subItem.text}
                          selected={isActive(subItem.path)}
                          onClick={() => handleNavigation(subItem.path)}
                          sx={{
                            pl: 6,
                            borderRadius: 1,
                            mb: 0.5,
                            '&.Mui-selected': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                              },
                            },
                          }}
                        >
                          <ListItemText 
                            primary={subItem.text}
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontWeight: isActive(subItem.path) ? 500 : 'normal',
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Footer Section */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Tooltip title="Cerrar sesión">
          <IconButton 
            onClick={logout}
            sx={{
              width: '100%',
              borderRadius: 1,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
              },
            }}
          >
            <LogoutIcon sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ flex: 1, textAlign: 'left' }}>
              Cerrar Sesión
            </Typography>
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: '0 0 10px rgba(0,0,0,0.05)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default ModelSidebar;
