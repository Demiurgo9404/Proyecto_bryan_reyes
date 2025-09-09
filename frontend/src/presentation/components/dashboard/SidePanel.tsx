import React from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material';
import {
  Close,
  Send,
  Favorite,
  FavoriteBorder,
  Circle
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 400,
    backgroundColor: '#fafafa',
    borderLeft: '1px solid #e0e0e0',
  },
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderBottom: '1px solid #e0e0e0',
  backgroundColor: 'white',
}));

const PanelContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  height: 'calc(100vh - 120px)',
  overflowY: 'auto',
}));

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  type: 'notifications' | 'messages' | 'favorites' | 'config';
  title: string;
}

const SidePanel: React.FC<SidePanelProps> = ({
  open,
  onClose,
  type,
  title
}) => {
  const renderNotifications = () => (
    <List>
      {[
        {
          id: '1',
          user: 'María García',
          avatar: 'https://picsum.photos/200/200?random=10',
          action: 'le gustó tu publicación',
          time: '2h',
          type: 'like'
        },
        {
          id: '2',
          user: 'Carlos López',
          avatar: 'https://picsum.photos/200/200?random=11',
          action: 'comenzó a seguirte',
          time: '4h',
          type: 'follow'
        },
        {
          id: '3',
          user: 'Ana Martínez',
          avatar: 'https://picsum.photos/200/200?random=12',
          action: 'comentó tu foto',
          time: '1d',
          type: 'comment'
        }
      ].map((notification) => (
        <ListItem key={notification.id}>
          <ListItemAvatar>
            <Avatar src={notification.avatar} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box>
                <strong>{notification.user}</strong> {notification.action}
              </Box>
            }
            secondary={notification.time}
          />
          {notification.type === 'like' && (
            <Favorite sx={{ color: '#e91e63', ml: 1 }} />
          )}
        </ListItem>
      ))}
    </List>
  );

  const renderMessages = () => (
    <List>
      {[
        {
          id: '1',
          user: 'Sofia Premium',
          avatar: 'https://picsum.photos/200/200?random=20',
          lastMessage: 'Hola! ¿Cómo estás?',
          time: '5min',
          unread: true,
          isOnline: true
        },
        {
          id: '2',
          user: 'Isabella VIP',
          avatar: 'https://picsum.photos/200/200?random=21',
          lastMessage: 'Gracias por el regalo 💕',
          time: '1h',
          unread: false,
          isOnline: false
        },
        {
          id: '3',
          user: 'Valentina Gold',
          avatar: 'https://picsum.photos/200/200?random=22',
          lastMessage: '¿Vienes a mi show esta noche?',
          time: '3h',
          unread: true,
          isOnline: true
        }
      ].map((conversation) => (
        <ListItem key={conversation.id} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}>
          <ListItemAvatar>
            <Box sx={{ position: 'relative' }}>
              <Avatar src={conversation.avatar} />
              {conversation.isOnline && (
                <Circle
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    color: '#4caf50',
                    fontSize: 12,
                    backgroundColor: 'white',
                    borderRadius: '50%'
                  }}
                />
              )}
            </Box>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: conversation.unread ? 600 : 400 }}>
                  {conversation.user}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {conversation.time}
                </Typography>
              </Box>
            }
            secondary={
              <Typography
                variant="body2"
                sx={{
                  color: conversation.unread ? '#000' : '#666',
                  fontWeight: conversation.unread ? 500 : 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {conversation.lastMessage}
              </Typography>
            }
          />
          {conversation.unread && (
            <Chip
              label="1"
              size="small"
              color="error"
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
          )}
        </ListItem>
      ))}
    </List>
  );

  const renderFavorites = () => (
    <List>
      {[
        {
          id: '1',
          user: 'Luna Estrella',
          avatar: 'https://picsum.photos/200/200?random=30',
          category: 'Premium',
          isLive: true,
          viewers: 234
        },
        {
          id: '2',
          user: 'Camila Rose',
          avatar: 'https://picsum.photos/200/200?random=31',
          category: 'VIP',
          isLive: false,
          viewers: 0
        },
        {
          id: '3',
          user: 'Daniela Angel',
          avatar: 'https://picsum.photos/200/200?random=32',
          category: 'Standard',
          isLive: true,
          viewers: 89
        }
      ].map((model) => (
        <ListItem key={model.id}>
          <ListItemAvatar>
            <Box sx={{ position: 'relative' }}>
              <Avatar src={model.avatar} />
              {model.isLive && (
                <Chip
                  label="LIVE"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -5,
                    right: -10,
                    backgroundColor: '#ff1744',
                    color: 'white',
                    fontSize: '0.6rem',
                    height: 16
                  }}
                />
              )}
            </Box>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">{model.user}</Typography>
                <Chip
                  label={model.category}
                  size="small"
                  color={model.category === 'Premium' ? 'warning' : model.category === 'VIP' ? 'secondary' : 'default'}
                  sx={{ height: 18, fontSize: '0.7rem' }}
                />
              </Box>
            }
            secondary={model.isLive ? `${model.viewers} espectadores` : 'Desconectada'}
          />
          <IconButton>
            <Favorite sx={{ color: '#e91e63' }} />
          </IconButton>
        </ListItem>
      ))}
    </List>
  );

  const renderConfig = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Perfil</Typography>
        <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
          Editar perfil
        </Button>
        <Button variant="outlined" fullWidth>
          Cambiar foto de perfil
        </Button>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Privacidad</Typography>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Perfil público"
        />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Mostrar estado en línea"
        />
        <FormControlLabel
          control={<Switch />}
          label="Permitir mensajes de desconocidos"
        />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Notificaciones</Typography>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Notificaciones push"
        />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Notificaciones por email"
        />
        <FormControlLabel
          control={<Switch />}
          label="Sonidos de notificación"
        />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Cuenta</Typography>
        <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
          Cambiar contraseña
        </Button>
        <Button variant="outlined" color="error" fullWidth>
          Eliminar cuenta
        </Button>
      </Paper>
    </Box>
  );

  const renderContent = () => {
    switch (type) {
      case 'notifications':
        return renderNotifications();
      case 'messages':
        return renderMessages();
      case 'favorites':
        return renderFavorites();
      case 'config':
        return renderConfig();
      default:
        return null;
    }
  };

  return (
    <StyledDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
    >
      <PanelHeader>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </PanelHeader>
      <PanelContent>
        {renderContent()}
      </PanelContent>
    </StyledDrawer>
  );
};

export default SidePanel;
