import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  FormControlLabel,
  Switch,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  CallEnd,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  Chat,
  Favorite,
  MonetizationOn,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface CallParticipant {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isModel: boolean;
  isVerified: boolean;
}

interface CallSettings {
  video: boolean;
  audio: boolean;
  volume: number;
  quality: 'low' | 'medium' | 'high';
}

interface CallStats {
  duration: number;
  cost: number;
  costPerMinute: number;
}

const VideoCallPage: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [participant, setParticipant] = useState<CallParticipant | null>(null);
  const [settings, setSettings] = useState<CallSettings>({
    video: true,
    audio: true,
    volume: 80,
    quality: 'high',
  });
  const [callStats, setCallStats] = useState<CallStats>({
    duration: 0,
    cost: 0,
    costPerMinute: 5, // 5 monedas por minuto
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callContainerRef = useRef<HTMLDivElement>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar llamada
  useEffect(() => {
    if (callId) {
      initializeCall();
    }
    
    return () => {
      endCall();
    };
  }, [callId]);

  // Timer para duración y costo
  useEffect(() => {
    if (isConnected) {
      durationTimerRef.current = setInterval(() => {
        setCallStats(prev => ({
          ...prev,
          duration: prev.duration + 1,
          cost: Math.ceil((prev.duration + 1) / 60) * prev.costPerMinute,
        }));
      }, 1000);

      return () => {
        if (durationTimerRef.current) {
          clearInterval(durationTimerRef.current);
        }
      };
    }
  }, [isConnected]);

  const initializeCall = async () => {
    try {
      setIsConnecting(true);
      
      // Obtener información de la llamada
      const response = await fetch(`/api/video-calls/${callId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener información de la llamada');
      }

      const callData = await response.json();
      setParticipant(callData.participant);

      // Inicializar medios locales
      await initializeLocalMedia();
      
      // Conectar a la llamada
      await connectToCall();
      
      setIsConnected(true);
      setIsConnecting(false);
    } catch (error) {
      console.error('Error initializing call:', error);
      setConnectionError(error instanceof Error ? error.message : 'Error de conexión');
      setIsConnecting(false);
    }
  };

  const initializeLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: settings.video,
        audio: settings.audio,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('No se pudo acceder a la cámara o micrófono');
    }
  };

  const connectToCall = async () => {
    // Aquí iría la lógica de WebRTC para conectar con el servidor
    // Por ahora simulamos la conexión
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular stream remoto
        if (remoteVideoRef.current) {
          // En una implementación real, esto vendría del peer remoto
          remoteVideoRef.current.src = '/api/models/live-stream/' + participant?.id;
        }
        resolve(true);
      }, 2000);
    });
  };

  const endCall = async () => {
    try {
      // Detener streams locales
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      // Notificar al servidor que la llamada terminó
      await fetch(`/api/video-calls/${callId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration: callStats.duration,
          cost: callStats.cost,
        }),
      });

      // Limpiar timers
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }

      navigate('/discover-models');
    } catch (error) {
      console.error('Error ending call:', error);
      navigate('/discover-models');
    }
  };

  const toggleVideo = async () => {
    const newVideoState = !settings.video;
    setSettings(prev => ({ ...prev, video: newVideoState }));

    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = newVideoState;
      }
    }
  };

  const toggleAudio = async () => {
    const newAudioState = !settings.audio;
    setSettings(prev => ({ ...prev, audio: newAudioState }));

    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newAudioState;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      callContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const sendTip = async (amount: number) => {
    try {
      await fetch('/api/tips/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          recipientId: participant?.id,
          amount,
          callId,
        }),
      });
    } catch (error) {
      console.error('Error sending tip:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isConnecting) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'black',
        color: 'white',
      }}>
        <Typography variant="h5" gutterBottom>
          Conectando...
        </Typography>
        <Typography variant="body2">
          Estableciendo videollamada con {participant?.displayName}
        </Typography>
      </Box>
    );
  }

  if (connectionError) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'black',
        color: 'white',
        p: 3,
      }}>
        <Typography variant="h5" gutterBottom color="error">
          Error de Conexión
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
          {connectionError}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/discover-models')}>
          Volver al Descubrimiento
        </Button>
      </Box>
    );
  }

  return (
    <Box
      ref={callContainerRef}
      sx={{
        height: '100vh',
        width: '100vw',
        bgcolor: 'black',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Video remoto (principal) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Video local (pequeño) */}
      <Paper
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 200,
          height: 150,
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Efecto espejo
          }}
        />
      </Paper>

      {/* Información del participante */}
      <Box sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: 'rgba(0,0,0,0.7)',
        p: 2,
        borderRadius: 2,
        color: 'white',
      }}>
        <Badge
          badgeContent="EN VIVO"
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.6rem',
            },
          }}
        >
          <Avatar src={participant?.avatar} sx={{ width: 50, height: 50 }} />
        </Badge>
        <Box>
          <Typography variant="h6">
            {participant?.displayName}
            {participant?.isVerified && ' ✓'}
          </Typography>
          <Typography variant="body2" color="grey.300">
            @{participant?.username}
          </Typography>
        </Box>
      </Box>

      {/* Stats de la llamada */}
      <Box sx={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: 'rgba(0,0,0,0.7)',
        p: 1.5,
        borderRadius: 2,
        color: 'white',
        textAlign: 'center',
      }}>
        <Typography variant="body2">
          {formatDuration(callStats.duration)}
        </Typography>
        <Typography variant="caption" color="grey.300">
          💰 {callStats.cost} monedas
        </Typography>
      </Box>

      {/* Controles de la llamada */}
      <Box sx={{
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 2,
        bgcolor: 'rgba(0,0,0,0.8)',
        p: 2,
        borderRadius: 3,
      }}>
        <Tooltip title={settings.audio ? "Silenciar" : "Activar micrófono"}>
          <IconButton
            onClick={toggleAudio}
            sx={{
              bgcolor: settings.audio ? 'transparent' : 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: settings.audio ? 'rgba(255,255,255,0.1)' : 'error.dark',
              },
            }}
          >
            {settings.audio ? <Mic /> : <MicOff />}
          </IconButton>
        </Tooltip>

        <Tooltip title={settings.video ? "Desactivar cámara" : "Activar cámara"}>
          <IconButton
            onClick={toggleVideo}
            sx={{
              bgcolor: settings.video ? 'transparent' : 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: settings.video ? 'rgba(255,255,255,0.1)' : 'error.dark',
              },
            }}
          >
            {settings.video ? <Videocam /> : <VideocamOff />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Enviar propina">
          <IconButton
            onClick={() => sendTip(10)}
            sx={{
              bgcolor: 'warning.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'warning.dark',
              },
            }}
          >
            <MonetizationOn />
          </IconButton>
        </Tooltip>

        <Tooltip title="Chat">
          <IconButton
            onClick={() => setShowChat(true)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <Chat />
          </IconButton>
        </Tooltip>

        <Tooltip title="Pantalla completa">
          <IconButton
            onClick={toggleFullscreen}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Configuración">
          <IconButton
            onClick={() => setShowSettings(true)}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <Settings />
          </IconButton>
        </Tooltip>

        <Tooltip title="Finalizar llamada">
          <IconButton
            onClick={endCall}
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'error.dark',
              },
            }}
          >
            <CallEnd />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Dialog de configuración */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        PaperProps={{
          sx: { bgcolor: 'background.paper', minWidth: 300 }
        }}
      >
        <DialogTitle>Configuración de Llamada</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography gutterBottom>
              Volumen: {settings.volume}%
            </Typography>
            <Slider
              value={settings.volume}
              onChange={(_, value) => setSettings(prev => ({ 
                ...prev, 
                volume: value as number 
              }))}
              min={0}
              max={100}
              sx={{ mb: 3 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.video}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    video: e.target.checked 
                  }))}
                />
              }
              label="Cámara activada"
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.audio}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    audio: e.target.checked 
                  }))}
                />
              }
              label="Micrófono activado"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoCallPage;
