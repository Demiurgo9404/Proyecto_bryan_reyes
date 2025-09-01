import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  LinearProgress,
  Badge,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  FavoriteOutlined,
  CloseOutlined,
  SettingsOutlined,
  VideocamOutlined,
  LocationOnOutlined,
  StarOutlined,
  OnlinePredictionOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Interfaces
interface ModelPreferences {
  minAge: number;
  maxAge: number;
  gender: 'all' | 'female' | 'male' | 'other';
  location: string;
  interests: string[];
}

interface ActiveModel {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  coverImage: string;
  age: number;
  gender: string;
  location: string;
  bio: string;
  interests: string[];
  isLive: boolean;
  liveStreamUrl?: string;
  rating: number;
  followers: number;
  isVerified: boolean;
  lastActive: string;
}

interface SwipeAction {
  modelId: string;
  action: 'like' | 'dislike';
  timestamp: Date;
}

const ModelDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const [models, setModels] = useState<ActiveModel[]>([]);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [preferences, setPreferences] = useState<ModelPreferences>({
    minAge: 18,
    maxAge: 35,
    gender: 'all',
    location: '',
    interests: [],
  });
  const [showPreferences, setShowPreferences] = useState(false);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [autoRotateTimer, setAutoRotateTimer] = useState(10);
  const [isVideoCallStarting, setIsVideoCallStarting] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cargar preferencias del usuario
  useEffect(() => {
    loadUserPreferences();
    loadActiveModels();
  }, []);

  // Timer automático para rotar modelos
  useEffect(() => {
    if (models.length > 0 && !isDragging) {
      timerRef.current = setInterval(() => {
        setAutoRotateTimer((prev) => {
          if (prev <= 1) {
            nextModel();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [currentModelIndex, models.length, isDragging]);

  // Cargar stream de video en vivo
  useEffect(() => {
    const currentModel = models[currentModelIndex];
    if (currentModel?.isLive && currentModel.liveStreamUrl && videoRef.current) {
      videoRef.current.src = currentModel.liveStreamUrl;
      videoRef.current.play().catch(console.error);
    }
  }, [currentModelIndex, models]);

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/users/preferences/models', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const prefs = await response.json();
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadActiveModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/models/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const activeModels = await response.json();
        setModels(activeModels);
      }
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      await fetch('/api/users/preferences/models', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(preferences),
      });
      setShowPreferences(false);
      loadActiveModels(); // Recargar con nuevas preferencias
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const nextModel = useCallback(() => {
    if (models.length > 1) {
      setCurrentModelIndex((prev) => (prev + 1) % models.length);
      setAutoRotateTimer(10);
    }
  }, [models.length]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentModel = models[currentModelIndex];
    if (!currentModel) return;

    setSwipeDirection(direction);
    
    // Registrar la acción
    const swipeAction: SwipeAction = {
      modelId: currentModel.id,
      action: direction === 'right' ? 'like' : 'dislike',
      timestamp: new Date(),
    };

    try {
      await fetch('/api/users/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(swipeAction),
      });

      // Si es like y la modelo está activa, iniciar videollamada
      if (direction === 'right' && currentModel.isLive) {
        await startVideoCall(currentModel);
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
    }

    // Animación y cambio de modelo
    setTimeout(() => {
      nextModel();
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  };

  const startVideoCall = async (model: ActiveModel) => {
    try {
      setIsVideoCallStarting(true);
      
      const response = await fetch('/api/video-calls/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          modelId: model.id,
          type: 'private',
        }),
      });

      if (response.ok) {
        const callData = await response.json();
        // Redirigir a la página de videollamada
        window.location.href = `/video-call/${callData.callId}`;
      }
    } catch (error) {
      console.error('Error starting video call:', error);
    } finally {
      setIsVideoCallStarting(false);
    }
  };

  // Manejo de gestos táctiles y mouse
  const handleDragStart = (clientX: number, clientY: number) => {
    setDragStart({ x: clientX, y: clientY });
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
    
    setIsDragging(false);
  };

  const currentModel = models[currentModelIndex];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Cargando modelos activas...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!currentModel) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No hay modelos activas disponibles
        </Typography>
        <Button variant="contained" onClick={loadActiveModels}>
          Actualizar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Header con timer y configuración */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'background.paper',
        zIndex: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">Descubrir Modelos</Typography>
          <Chip 
            label={`${autoRotateTimer}s`} 
            color="primary" 
            size="small"
          />
        </Box>
        <IconButton onClick={() => setShowPreferences(true)}>
          <SettingsOutlined />
        </IconButton>
      </Box>

      {/* Tarjeta principal de modelo */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        p: 2,
      }}>
        <Card
          ref={cardRef}
          sx={{
            width: '100%',
            maxWidth: 400,
            height: '70vh',
            position: 'relative',
            cursor: isDragging ? 'grabbing' : 'grab',
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease',
            opacity: swipeDirection ? 0.7 : 1,
            '&::before': swipeDirection === 'right' ? {
              content: '"❤️"',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '4rem',
              zIndex: 10,
            } : swipeDirection === 'left' ? {
              content: '"❌"',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '4rem',
              zIndex: 10,
            } : {},
          }}
          onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
        >
          {/* Video en vivo o imagen de portada */}
          <Box sx={{ position: 'relative', height: '60%' }}>
            {currentModel.isLive && currentModel.liveStreamUrl ? (
              <>
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  muted
                  autoPlay
                />
                <Badge
                  badgeContent="EN VIVO"
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                    },
                  }}
                >
                  <OnlinePredictionOutlined color="error" />
                </Badge>
              </>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${currentModel.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}
            
            {/* Indicador de verificación */}
            {currentModel.isVerified && (
              <Chip
                icon={<StarOutlined />}
                label="Verificada"
                color="primary"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                }}
              />
            )}
          </Box>

          {/* Información del modelo */}
          <CardContent sx={{ height: '40%', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar src={currentModel.avatar} sx={{ width: 60, height: 60 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="div">
                  {currentModel.displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{currentModel.username} • {currentModel.age} años
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <LocationOnOutlined fontSize="small" color="action" />
                  <Typography variant="caption">
                    {currentModel.location}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ mb: 2 }}>
              {currentModel.bio}
            </Typography>

            {/* Intereses */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {currentModel.interests.slice(0, 3).map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption">
                ⭐ {currentModel.rating.toFixed(1)}
              </Typography>
              <Typography variant="caption">
                👥 {currentModel.followers.toLocaleString()} seguidores
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Botones de acción */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 4, 
        p: 3,
        bgcolor: 'background.paper',
      }}>
        <Fab
          color="default"
          onClick={() => handleSwipe('left')}
          disabled={isVideoCallStarting}
        >
          <CloseOutlined />
        </Fab>
        
        {currentModel.isLive && (
          <Tooltip title="Videollamada disponible">
            <Fab
              color="primary"
              onClick={() => handleSwipe('right')}
              disabled={isVideoCallStarting}
              sx={{
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            >
              <VideocamOutlined />
            </Fab>
          </Tooltip>
        )}
        
        <Fab
          color="error"
          onClick={() => handleSwipe('right')}
          disabled={isVideoCallStarting}
        >
          <FavoriteOutlined />
        </Fab>
      </Box>

      {/* Dialog de preferencias */}
      <Dialog
        open={showPreferences}
        onClose={() => setShowPreferences(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Preferencias de Búsqueda</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Rango de edad */}
            <Typography gutterBottom>
              Edad: {preferences.minAge} - {preferences.maxAge} años
            </Typography>
            <Slider
              value={[preferences.minAge, preferences.maxAge]}
              onChange={(_, value) => {
                const [min, max] = value as number[];
                setPreferences(prev => ({ ...prev, minAge: min, maxAge: max }));
              }}
              valueLabelDisplay="auto"
              min={18}
              max={65}
              sx={{ mb: 3 }}
            />

            {/* Género */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Género</InputLabel>
              <Select
                value={preferences.gender}
                label="Género"
                onChange={(e) => setPreferences(prev => ({ 
                  ...prev, 
                  gender: e.target.value as any 
                }))}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="female">Femenino</MenuItem>
                <MenuItem value="male">Masculino</MenuItem>
                <MenuItem value="other">Otro</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreferences(false)}>
            Cancelar
          </Button>
          <Button onClick={savePreferences} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading overlay para videollamada */}
      {isVideoCallStarting && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <Typography variant="h6" color="white" gutterBottom>
            Iniciando videollamada...
          </Typography>
          <LinearProgress sx={{ width: 200, mt: 2 }} />
        </Box>
      )}
    </Box>
  );
};

export default ModelDiscoveryPage;
