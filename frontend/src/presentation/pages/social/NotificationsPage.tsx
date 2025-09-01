import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Chip,
  Badge,
  Tabs,
  Tab,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Favorite,
  Comment,
  PersonAdd,
  Share,
  VideoCall,
  Message,
  Star,
  MonetizationOn,
  Security,
  Warning,
  Info,
  CheckCircle,
  Cancel,
  MoreVert,
  Settings,
  MarkAsUnread,
  Delete,
  Clear,
  FilterList,
  Circle,
  RadioButtonUnchecked,
  Close
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'share' | 'message' | 'call' | 'system' | 'security' | 'monetization' | 'content' | 'admin';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actor?: {
    id: string;
    username: string;
    profilePicture?: string;
    role: string;
  };
  content?: {
    id: string;
    type: 'post' | 'reel' | 'story';
    thumbnailUrl?: string;
    title?: string;
  };
  metadata?: {
    amount?: number;
    count?: number;
    [key: string]: any;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  shares: boolean;
  messages: boolean;
  calls: boolean;
  system: boolean;
  security: boolean;
  monetization: boolean;
  content: boolean;
  admin: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const notificationTypes = [
    { key: 'all', label: 'Todas', count: notifications.length },
    { key: 'unread', label: 'No leídas', count: notifications.filter(n => !n.isRead).length },
    { key: 'social', label: 'Sociales', count: notifications.filter(n => ['like', 'comment', 'follow', 'share'].includes(n.type)).length },
    { key: 'messages', label: 'Mensajes', count: notifications.filter(n => ['message', 'call'].includes(n.type)).length },
    { key: 'system', label: 'Sistema', count: notifications.filter(n => ['system', 'security', 'admin'].includes(n.type)).length }
  ];

  useEffect(() => {
    fetchNotifications();
    fetchNotificationSettings();
    
    // Set up real-time notifications
    const eventSource = new EventSource(`/api/notifications/stream?token=${localStorage.getItem('token')}`);
    
    eventSource.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      setNotifications(prev => [newNotification, ...prev]);
      
      // Show browser notification if enabled
      if (settings?.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: newNotification.actor?.profilePicture || '/logo.png',
          tag: newNotification.id
        });
      }
    };

    return () => {
      eventSource.close();
    };
  }, [settings?.pushNotifications]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('/api/notifications/settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notificationIds })
      });

      setNotifications(prev => prev.map(n => 
        notificationIds.includes(n.id) ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleMarkAsUnread = async (notificationIds: string[]) => {
    try {
      await fetch('/api/notifications/mark-unread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notificationIds })
      });

      setNotifications(prev => prev.map(n => 
        notificationIds.includes(n.id) ? { ...n, isRead: false } : n
      ));
    } catch (error) {
      console.error('Error marking notifications as unread:', error);
    }
  };

  const handleDeleteNotifications = async (notificationIds: string[]) => {
    try {
      await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notificationIds })
      });

      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch('/api/notifications/clear-all', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Favorite color="error" />;
      case 'comment': return <Comment color="primary" />;
      case 'follow': return <PersonAdd color="success" />;
      case 'share': return <Share color="info" />;
      case 'message': return <Message color="primary" />;
      case 'call': return <VideoCall color="success" />;
      case 'monetization': return <MonetizationOn color="warning" />;
      case 'security': return <Security color="error" />;
      case 'system': return <Info color="info" />;
      case 'admin': return <Star color="secondary" />;
      default: return <Notifications />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'social':
        return ['like', 'comment', 'follow', 'share'].includes(notification.type);
      case 'messages':
        return ['message', 'call'].includes(notification.type);
      case 'system':
        return ['system', 'security', 'admin'].includes(notification.type);
      default:
        return true;
    }
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead([notification.id]);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Cargando notificaciones...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Notificaciones
        </Typography>
        <Box display="flex" gap={1}>
          <IconButton onClick={() => setOpenSettings(true)}>
            <Settings />
          </IconButton>
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      {/* Filter Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => {
            setActiveTab(newValue);
            setFilter(notificationTypes[newValue].key);
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {notificationTypes.map((type, index) => (
            <Tab
              key={type.key}
              label={
                <Badge badgeContent={type.count} color="primary">
                  {type.label}
                </Badge>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Selection Actions */}
      {selectedNotifications.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2">
              {selectedNotifications.length} seleccionadas
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                size="small"
                onClick={() => handleMarkAsRead(selectedNotifications)}
              >
                Marcar como leídas
              </Button>
              <Button
                size="small"
                onClick={() => handleMarkAsUnread(selectedNotifications)}
              >
                Marcar como no leídas
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => handleDeleteNotifications(selectedNotifications)}
              >
                Eliminar
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Notifications List */}
      <Paper>
        <List>
          {filteredNotifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No hay notificaciones"
                secondary="Cuando tengas nuevas notificaciones aparecerán aquí"
              />
            </ListItem>
          ) : (
            filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemAvatar>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectNotification(notification.id);
                      }}
                    >
                      {selectedNotifications.includes(notification.id) ? (
                        <CheckCircle color="primary" />
                      ) : (
                        <RadioButtonUnchecked />
                      )}
                    </IconButton>
                  </ListItemAvatar>
                  
                  <ListItemAvatar>
                    {notification.actor ? (
                      <Avatar src={notification.actor.profilePicture}>
                        {notification.actor.username[0].toUpperCase()}
                      </Avatar>
                    ) : (
                      <Avatar>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    )}
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" fontWeight={notification.isRead ? 'normal' : 'bold'}>
                          {notification.title}
                        </Typography>
                        {notification.priority !== 'low' && (
                          <Chip
                            label={notification.priority}
                            size="small"
                            color={getPriorityColor(notification.priority) as any}
                          />
                        )}
                        {!notification.isRead && (
                          <Circle color="primary" sx={{ fontSize: 8 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                        </Typography>
                      </Box>
                    }
                  />

                  {notification.content && (
                    <ListItemAvatar>
                      <Avatar
                        src={notification.content.thumbnailUrl}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      />
                    </ListItemAvatar>
                  )}

                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotifications([notification.id]);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleMarkAsRead(notifications.filter(n => !n.isRead).map(n => n.id))}>
          <CheckCircle sx={{ mr: 1 }} />
          Marcar todas como leídas
        </MenuItem>
        <MenuItem onClick={handleClearAll}>
          <Clear sx={{ mr: 1 }} />
          Limpiar todas
        </MenuItem>
      </Menu>

      {/* Settings Dialog */}
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Configuración de Notificaciones</Typography>
            <IconButton onClick={() => setOpenSettings(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {settings && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Tipos de Notificaciones
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.likes}
                      onChange={(e) => handleUpdateSettings({ likes: e.target.checked })}
                    />
                  }
                  label="Likes"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.comments}
                      onChange={(e) => handleUpdateSettings({ comments: e.target.checked })}
                    />
                  }
                  label="Comentarios"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.follows}
                      onChange={(e) => handleUpdateSettings({ follows: e.target.checked })}
                    />
                  }
                  label="Nuevos seguidores"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.messages}
                      onChange={(e) => handleUpdateSettings({ messages: e.target.checked })}
                    />
                  }
                  label="Mensajes"
                />
              </Grid>

              {(user?.roles?.includes('Model') || user?.roles?.includes('SuperAdmin')) && (
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.monetization}
                        onChange={(e) => handleUpdateSettings({ monetization: e.target.checked })}
                      />
                    }
                    label="Monetización"
                  />
                </Grid>
              )}

              {(user?.roles?.includes('SuperAdmin') || user?.roles?.includes('Admin')) && (
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.admin}
                        onChange={(e) => handleUpdateSettings({ admin: e.target.checked })}
                      />
                    }
                    label="Administración"
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Métodos de Entrega
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => handleUpdateSettings({ pushNotifications: e.target.checked })}
                    />
                  }
                  label="Notificaciones push"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleUpdateSettings({ emailNotifications: e.target.checked })}
                    />
                  }
                  label="Notificaciones por email"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.soundEnabled}
                      onChange={(e) => handleUpdateSettings({ soundEnabled: e.target.checked })}
                    />
                  }
                  label="Sonidos"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default NotificationsPage;
