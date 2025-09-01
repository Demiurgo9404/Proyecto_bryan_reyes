import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Avatar,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogContent,
  TextField,
  Fab,
  Chip,
  Card,
  CardContent,
  Slider,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Close,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Share,
  MoreVert,
  MusicNote,
  Videocam,
  FilterVintage,
  LocationOn,
  Tag,
  Send,
  Reply,
  Download
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Reel {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
  };
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  musicTitle?: string;
  musicArtist?: string;
  musicUrl?: string;
  filterName?: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hashtags?: string;
  locationName?: string;
  createdAt: string;
  hasLiked: boolean;
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
}

interface CreateReelData {
  file?: File;
  description: string;
  musicTitle?: string;
  musicArtist?: string;
  filterName?: string;
  hashtags: string;
  locationName?: string;
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
}

const ReelsPage: React.FC = () => {
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openCreateReel, setOpenCreateReel] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const [newReel, setNewReel] = useState<CreateReelData>({
    description: '',
    hashtags: '',
    allowComments: true,
    allowDuet: true,
    allowStitch: true
  });

  // Available filters
  const videoFilters = [
    { name: 'Normal', value: 'none' },
    { name: 'Vintage', value: 'sepia(100%)' },
    { name: 'B&W', value: 'grayscale(100%)' },
    { name: 'Warm', value: 'hue-rotate(30deg) saturate(1.2)' },
    { name: 'Cool', value: 'hue-rotate(-30deg) saturate(1.2)' },
    { name: 'Bright', value: 'brightness(1.2) contrast(1.1)' },
    { name: 'Dramatic', value: 'contrast(1.5) brightness(0.9)' }
  ];

  // Popular music tracks (mock data)
  const popularMusic = [
    { title: 'Trending Sound 1', artist: 'Artist 1', url: '/audio/track1.mp3' },
    { title: 'Viral Beat', artist: 'Artist 2', url: '/audio/track2.mp3' },
    { title: 'Popular Song', artist: 'Artist 3', url: '/audio/track3.mp3' }
  ];

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      
      if (newIndex !== currentReelIndex && newIndex < reels.length) {
        setCurrentReelIndex(newIndex);
        pauseAllVideos();
        playCurrentVideo(newIndex);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentReelIndex, reels.length]);

  const fetchReels = async () => {
    try {
      const response = await fetch('/api/reels/feed', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setReels(data.reels || []);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const pauseAllVideos = () => {
    Object.values(videoRefs.current).forEach(video => {
      if (video) video.pause();
    });
  };

  const playCurrentVideo = (index: number) => {
    const currentReel = reels[index];
    if (currentReel && videoRefs.current[currentReel.id]) {
      const video = videoRefs.current[currentReel.id];
      if (isPlaying) {
        video.play().catch(console.error);
      }
    }
  };

  const togglePlayPause = () => {
    const currentReel = reels[currentReelIndex];
    if (currentReel && videoRefs.current[currentReel.id]) {
      const video = videoRefs.current[currentReel.id];
      if (isPlaying) {
        video.pause();
      } else {
        video.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    Object.values(videoRefs.current).forEach(video => {
      if (video) video.muted = !isMuted;
    });
    setIsMuted(!isMuted);
  };

  const handleLike = async (reelId: string) => {
    try {
      const response = await fetch(`/api/reels/${reelId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setReels(prev => prev.map(reel => {
          if (reel.id === reelId) {
            return {
              ...reel,
              hasLiked: !reel.hasLiked,
              likesCount: reel.hasLiked ? reel.likesCount - 1 : reel.likesCount + 1
            };
          }
          return reel;
        }));
      }
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  const handleComment = async (reelId: string) => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/reels/${reelId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        
        // Update comments count
        setReels(prev => prev.map(reel => 
          reel.id === reelId 
            ? { ...reel, commentsCount: reel.commentsCount + 1 }
            : reel
        ));
      }
    } catch (error) {
      console.error('Error commenting on reel:', error);
    }
  };

  const fetchComments = async (reelId: string) => {
    try {
      const response = await fetch(`/api/reels/${reelId}/comments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCreateReel = async () => {
    if (!newReel.file) return;

    try {
      const formData = new FormData();
      formData.append('video', newReel.file);
      formData.append('description', newReel.description);
      formData.append('hashtags', newReel.hashtags);
      formData.append('allowComments', newReel.allowComments.toString());
      formData.append('allowDuet', newReel.allowDuet.toString());
      formData.append('allowStitch', newReel.allowStitch.toString());
      
      if (newReel.musicTitle) formData.append('musicTitle', newReel.musicTitle);
      if (newReel.musicArtist) formData.append('musicArtist', newReel.musicArtist);
      if (newReel.filterName) formData.append('filterName', newReel.filterName);
      if (newReel.locationName) formData.append('locationName', newReel.locationName);

      const response = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (response.ok) {
        await fetchReels();
        setOpenCreateReel(false);
        resetNewReel();
      }
    } catch (error) {
      console.error('Error creating reel:', error);
    }
  };

  const resetNewReel = () => {
    setNewReel({
      description: '',
      hashtags: '',
      allowComments: true,
      allowDuet: true,
      allowStitch: true
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setNewReel(prev => ({ ...prev, file }));
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Reels feed */}
      <Box
        ref={containerRef}
        sx={{
          height: '100vh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}
      >
        {reels.map((reel, index) => (
          <Box
            key={reel.id}
            sx={{
              height: '100vh',
              position: 'relative',
              scrollSnapAlign: 'start',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'black'
            }}
          >
            {/* Video */}
            <video
              ref={(el) => {
                if (el) videoRefs.current[reel.id] = el;
              }}
              src={reel.videoUrl}
              loop
              muted={isMuted}
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: reel.filterName && reel.filterName !== 'none' 
                  ? videoFilters.find(f => f.name === reel.filterName)?.value || 'none'
                  : 'none'
              }}
              onLoadedData={() => {
                if (index === currentReelIndex && isPlaying) {
                  videoRefs.current[reel.id]?.play().catch(console.error);
                }
              }}
            />

            {/* Video overlay - tap to play/pause */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={togglePlayPause}
            >
              {!isPlaying && (
                <PlayArrow sx={{ fontSize: 80, color: 'white', opacity: 0.8 }} />
              )}
            </Box>

            {/* User info and description */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 80,
                p: 2,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                color: 'white'
              }}
            >
              <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <Avatar src={reel.user.profilePicture} sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {reel.user.username}
                    <Chip 
                      label={reel.user.role} 
                      size="small" 
                      sx={{ ml: 1, height: 20 }}
                      color={
                        reel.user.role === 'SuperAdmin' ? 'secondary' :
                        reel.user.role === 'Admin' ? 'primary' :
                        reel.user.role === 'Model' ? 'error' :
                        reel.user.role === 'Study' ? 'success' : 'default'
                      }
                    />
                  </Typography>
                  <Typography variant="caption" color="grey.300">
                    {formatDistanceToNow(new Date(reel.createdAt), { addSuffix: true, locale: es })}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ mb: 1 }}>
                {reel.description}
              </Typography>

              {reel.hashtags && (
                <Typography variant="body2" color="primary.light" sx={{ mb: 1 }}>
                  {reel.hashtags.split(',').map(tag => `#${tag.trim()}`).join(' ')}
                </Typography>
              )}

              {reel.musicTitle && (
                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <MusicNote sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="caption">
                    {reel.musicTitle} - {reel.musicArtist}
                  </Typography>
                </Box>
              )}

              {reel.locationName && (
                <Box display="flex" alignItems="center">
                  <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="caption">
                    {reel.locationName}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Action buttons */}
            <Box
              sx={{
                position: 'absolute',
                right: 16,
                bottom: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Box textAlign="center">
                <IconButton
                  sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}
                  onClick={() => handleLike(reel.id)}
                >
                  {reel.hasLiked ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
                <Typography variant="caption" color="white" display="block">
                  {formatNumber(reel.likesCount)}
                </Typography>
              </Box>

              <Box textAlign="center">
                <IconButton
                  sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}
                  onClick={() => {
                    setShowComments(true);
                    fetchComments(reel.id);
                  }}
                >
                  <ChatBubbleOutline />
                </IconButton>
                <Typography variant="caption" color="white" display="block">
                  {formatNumber(reel.commentsCount)}
                </Typography>
              </Box>

              <Box textAlign="center">
                <IconButton sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}>
                  <Share />
                </IconButton>
                <Typography variant="caption" color="white" display="block">
                  {formatNumber(reel.sharesCount)}
                </Typography>
              </Box>

              <Box textAlign="center">
                <IconButton
                  sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeOff /> : <VolumeUp />}
                </IconButton>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Create reel button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenCreateReel(true)}
      >
        <Add />
      </Fab>

      {/* Create reel dialog */}
      <Dialog open={openCreateReel} onClose={() => setOpenCreateReel(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Crear Reel
          </Typography>

          {/* Video upload */}
          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<Videocam />}
            sx={{ mb: 2, height: 60 }}
          >
            {newReel.file ? newReel.file.name : 'Seleccionar Video'}
            <input type="file" hidden accept="video/*" onChange={handleFileSelect} />
          </Button>

          {/* Video preview */}
          {newReel.file && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <video
                src={URL.createObjectURL(newReel.file)}
                controls
                style={{ maxWidth: '100%', maxHeight: 200 }}
              />
            </Box>
          )}

          {/* Description */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Descripción"
            placeholder="Describe tu reel..."
            value={newReel.description}
            onChange={(e) => setNewReel(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          {/* Hashtags */}
          <TextField
            fullWidth
            label="Hashtags"
            placeholder="música, baile, divertido"
            value={newReel.hashtags}
            onChange={(e) => setNewReel(prev => ({ ...prev, hashtags: e.target.value }))}
            sx={{ mb: 2 }}
          />

          {/* Music selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Música</InputLabel>
            <Select
              value={newReel.musicTitle || ''}
              onChange={(e) => {
                const selectedMusic = popularMusic.find(m => m.title === e.target.value);
                setNewReel(prev => ({
                  ...prev,
                  musicTitle: selectedMusic?.title,
                  musicArtist: selectedMusic?.artist
                }));
              }}
            >
              <MenuItem value="">Sin música</MenuItem>
              {popularMusic.map(music => (
                <MenuItem key={music.title} value={music.title}>
                  {music.title} - {music.artist}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filter selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Filtro</InputLabel>
            <Select
              value={newReel.filterName || 'Normal'}
              onChange={(e) => setNewReel(prev => ({ ...prev, filterName: e.target.value }))}
            >
              {videoFilters.map(filter => (
                <MenuItem key={filter.name} value={filter.name}>
                  {filter.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Location */}
          <TextField
            fullWidth
            label="Ubicación"
            placeholder="Agregar ubicación..."
            value={newReel.locationName || ''}
            onChange={(e) => setNewReel(prev => ({ ...prev, locationName: e.target.value }))}
            sx={{ mb: 2 }}
          />

          {/* Privacy settings */}
          <Typography variant="subtitle2" gutterBottom>
            Configuración:
          </Typography>
          <Box display="flex" flexDirection="column" gap={1} sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">Permitir comentarios</Typography>
              <Button
                size="small"
                variant={newReel.allowComments ? 'contained' : 'outlined'}
                onClick={() => setNewReel(prev => ({ ...prev, allowComments: !prev.allowComments }))}
              >
                {newReel.allowComments ? 'Sí' : 'No'}
              </Button>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">Permitir duetos</Typography>
              <Button
                size="small"
                variant={newReel.allowDuet ? 'contained' : 'outlined'}
                onClick={() => setNewReel(prev => ({ ...prev, allowDuet: !prev.allowDuet }))}
              >
                {newReel.allowDuet ? 'Sí' : 'No'}
              </Button>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">Permitir stitch</Typography>
              <Button
                size="small"
                variant={newReel.allowStitch ? 'contained' : 'outlined'}
                onClick={() => setNewReel(prev => ({ ...prev, allowStitch: !prev.allowStitch }))}
              >
                {newReel.allowStitch ? 'Sí' : 'No'}
              </Button>
            </Box>
          </Box>

          {/* Action buttons */}
          <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button onClick={() => setOpenCreateReel(false)}>
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCreateReel}
              disabled={!newReel.file || !newReel.description}
            >
              Publicar Reel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Comments dialog */}
      <Dialog open={showComments} onClose={() => setShowComments(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Comentarios
          </Typography>

          {/* Comments list */}
          <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
            {comments.map(comment => (
              <Box key={comment.id} display="flex" alignItems="start" sx={{ mb: 2 }}>
                <Avatar src={comment.user.profilePicture} sx={{ mr: 2, width: 32, height: 32 }} />
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {comment.user.username}
                  </Typography>
                  <Typography variant="body2">
                    {comment.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Add comment */}
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Agregar comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && reels[currentReelIndex]) {
                  handleComment(reels[currentReelIndex].id);
                }
              }}
            />
            <IconButton 
              color="primary"
              onClick={() => reels[currentReelIndex] && handleComment(reels[currentReelIndex].id)}
              disabled={!newComment.trim()}
            >
              <Send />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ReelsPage;
