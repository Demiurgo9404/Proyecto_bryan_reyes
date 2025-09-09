import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  Avatar,
  Badge,
  IconButton,
  Button,
  Card,
  CardContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  CallEnd,
  Call,
  Message,
  Send,
  ArrowBack,
  People,
  Favorite,
  AttachMoney,
  Settings,
  FullscreenExit,
  Fullscreen,
  VolumeUp,
  VolumeOff
} from '@mui/icons-material';

interface IncomingCall {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'tip' | 'like';
  amount?: number;
}

interface ConnectedUser {
  id: string;
  username: string;
  avatar: string;
  joinedAt: Date;
}

const LiveStreamingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Streaming states
  const [isLive, setIsLive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  // Call states
  const [incomingCalls, setIncomingCalls] = useState<IncomingCall[]>([]);
  const [activeCall, setActiveCall] = useState<IncomingCall | null>(null);
  const [showIncomingCallDialog, setShowIncomingCallDialog] = useState(false);
  
  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'user1',
      username: 'GoldenCharm',
      avatar: 'https://picsum.photos/200/300',
      message: '¡Hola hermosa! 😍',
      timestamp: new Date(Date.now() - 300000),
      type: 'message'
    },
    {
      id: '2',
      userId: 'user2',
      username: 'VipClient',
      avatar: 'https://picsum.photos/200/301',
      message: 'Te envié una propina',
      timestamp: new Date(Date.now() - 240000),
      type: 'tip',
      amount: 50
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  // Connected users
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([
    {
      id: '1',
      username: 'GoldenCharm',
      avatar: 'https://picsum.photos/200/302',
      joinedAt: new Date(Date.now() - 600000)
    },
    {
      id: '2',
      username: 'VipClient',
      avatar: 'https://picsum.photos/200/303',
      joinedAt: new Date(Date.now() - 300000)
    },
    {
      id: '3',
      username: 'CrystalVeil',
      avatar: 'https://picsum.photos/200/304',
      joinedAt: new Date(Date.now() - 120000)
    }
  ]);

  // Stats
  const [stats, setStats] = useState({
    viewers: 15,
    likes: 42,
    tips: 150,
    duration: 0
  });

  useEffect(() => {
    startStreaming();
    
    // Simulate incoming calls
    const callInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newCall: IncomingCall = {
          id: Date.now().toString(),
          userId: `user${Math.floor(Math.random() * 1000)}`,
          username: ['PremiumUser', 'VipClient', 'GoldenFan', 'SpecialGuest'][Math.floor(Math.random() * 4)],
          avatar: 'https://picsum.photos/200/305',
          timestamp: new Date()
        };
        setIncomingCalls(prev => [...prev, newCall]);
        setShowIncomingCallDialog(true);
      }
    }, 15000);

    // Simulate new messages
    const messageInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        const messages = [
          '¡Te ves increíble!',
          'Eres la mejor ❤️',
          '¿Puedes saludarme?',
          'Me encantas',
          '¡Más contenido así!'
        ];
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          userId: `user${Math.floor(Math.random() * 1000)}`,
          username: ['Fan1', 'Admirer2', 'Viewer3', 'Client4'][Math.floor(Math.random() * 4)],
          avatar: 'https://picsum.photos/200/306',
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: new Date(),
          type: 'message'
        };
        setChatMessages(prev => [...prev, newMsg]);
      }
    }, 8000);

    // Update stats
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        viewers: prev.viewers + Math.floor(Math.random() * 3) - 1,
        likes: prev.likes + Math.floor(Math.random() * 2),
        duration: prev.duration + 1
      }));
    }, 1000);

    return () => {
      clearInterval(callInterval);
      clearInterval(messageInterval);
      clearInterval(statsInterval);
      stopStreaming();
    };
  }, []);

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsLive(true);
    } catch (error) {
      console.error('Error starting stream:', error);
    }
  };

  const stopStreaming = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsLive(false);
  };

  const handleVideoToggle = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const handleAudioToggle = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleAcceptCall = (call: IncomingCall) => {
    setActiveCall(call);
    setIncomingCalls(prev => prev.filter(c => c.id !== call.id));
    setShowIncomingCallDialog(false);
  };

  const handleRejectCall = (callId: string) => {
    setIncomingCalls(prev => prev.filter(c => c.id !== callId));
    setShowIncomingCallDialog(false);
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: user?.id || 'model',
        username: user?.username || 'Modelo',
        avatar: user?.avatar || 'https://picsum.photos/200/307',
        message: newMessage,
        timestamp: new Date(),
        type: 'message'
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{
        backgroundColor: 'rgba(0,0,0,0.8)',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate('/dashboard')}
            sx={{ color: 'white', mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography sx={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>
            Transmisión en Vivo
          </Typography>
          {isLive && (
            <Chip 
              label="EN VIVO" 
              sx={{ 
                ml: 2,
                backgroundColor: '#e91e63',
                color: 'white',
                fontWeight: 600
              }} 
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ color: 'white', fontSize: '14px' }}>
            {formatDuration(stats.duration)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <People sx={{ color: 'white', fontSize: 16 }} />
            <Typography sx={{ color: 'white', fontSize: '14px' }}>
              {stats.viewers}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* Video Area */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Video Controls Overlay */}
          <Box sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '25px',
            p: 1
          }}>
            <IconButton
              onClick={handleVideoToggle}
              sx={{ 
                color: 'white',
                backgroundColor: isVideoEnabled ? 'transparent' : '#e91e63'
              }}
            >
              {isVideoEnabled ? <Videocam /> : <VideocamOff />}
            </IconButton>
            <IconButton
              onClick={handleAudioToggle}
              sx={{ 
                color: 'white',
                backgroundColor: isAudioEnabled ? 'transparent' : '#e91e63'
              }}
            >
              {isAudioEnabled ? <Mic /> : <MicOff />}
            </IconButton>
            <IconButton
              onClick={() => {
                stopStreaming();
                navigate('/dashboard');
              }}
              sx={{ 
                color: 'white',
                backgroundColor: '#f44336'
              }}
            >
              <CallEnd />
            </IconButton>
          </Box>

          {/* Active Call Overlay */}
          {activeCall && (
            <Box sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              backgroundColor: 'rgba(0,0,0,0.8)',
              borderRadius: '12px',
              p: 2,
              minWidth: 200
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={activeCall.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
                <Box>
                  <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>
                    {activeCall.username}
                  </Typography>
                  <Typography sx={{ color: '#4caf50', fontSize: '12px' }}>
                    En llamada
                  </Typography>
                </Box>
              </Box>
              <Button
                fullWidth
                variant="contained"
                color="error"
                size="small"
                onClick={handleEndCall}
                startIcon={<CallEnd />}
              >
                Terminar llamada
              </Button>
            </Box>
          )}

          {/* Stats Overlay */}
          <Box sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            display: 'flex',
            gap: 2
          }}>
            <Chip 
              icon={<Favorite />}
              label={stats.likes}
              sx={{ backgroundColor: 'rgba(233, 30, 99, 0.8)', color: 'white' }}
            />
            <Chip 
              icon={<AttachMoney />}
              label={`$${stats.tips}`}
              sx={{ backgroundColor: 'rgba(76, 175, 80, 0.8)', color: 'white' }}
            />
          </Box>
        </Box>

        {/* Right Panel */}
        <Box sx={{
          width: 350,
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Connected Users */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2 }}>
              Espectadores ({connectedUsers.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {connectedUsers.slice(0, 8).map((user) => (
                <Avatar
                  key={user.id}
                  src={user.avatar}
                  alt={user.username}
                  sx={{ width: 32, height: 32 }}
                />
              ))}
              {connectedUsers.length > 8 && (
                <Avatar sx={{ width: 32, height: 32, backgroundColor: '#e0e0e0' }}>
                  +{connectedUsers.length - 8}
                </Avatar>
              )}
            </Box>
          </Box>

          {/* Chat Messages */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ p: 2, fontSize: '16px', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
              Chat en vivo
            </Typography>
            
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto',
              p: 1,
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '3px' }
            }}>
              {chatMessages.map((msg) => (
                <Box key={msg.id} sx={{ mb: 2, p: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar src={msg.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#e91e63' }}>
                          {msg.username}
                        </Typography>
                        {msg.type === 'tip' && (
                          <Chip 
                            label={`$${msg.amount}`}
                            size="small"
                            sx={{ ml: 1, backgroundColor: '#4caf50', color: 'white', fontSize: '10px' }}
                          />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: '13px', color: '#333' }}>
                        {msg.message}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Message Input */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <IconButton 
                  onClick={handleSendMessage}
                  sx={{ color: '#e91e63' }}
                >
                  <Send />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Incoming Call Dialog */}
      <Dialog 
        open={showIncomingCallDialog && incomingCalls.length > 0}
        onClose={() => setShowIncomingCallDialog(false)}
      >
        {incomingCalls.length > 0 && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={incomingCalls[0].avatar} sx={{ mr: 2 }} />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    Llamada entrante
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#8e8e8e' }}>
                    {incomingCalls[0].username}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogActions>
              <Button 
                onClick={() => handleRejectCall(incomingCalls[0].id)}
                color="error"
              >
                Rechazar
              </Button>
              <Button 
                onClick={() => handleAcceptCall(incomingCalls[0])}
                variant="contained"
                sx={{ backgroundColor: '#4caf50' }}
              >
                Aceptar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default LiveStreamingPage;
