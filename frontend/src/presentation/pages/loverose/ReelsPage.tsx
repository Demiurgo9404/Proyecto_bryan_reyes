import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Avatar,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Share,
  MoreVert,
  VolumeOff,
  VolumeUp,
  Add,
  PlayArrow,
  Pause,
  Verified,
} from '@mui/icons-material';
import { styled } from "@mui/material/styles";
import { useAuth } from '../../contexts/AuthContext';

const ReelsContainer = styled(Box)({
  height: '100vh',
  backgroundColor: '#000000',
  position: 'relative',
  overflow: 'hidden',
});

const ReelVideo = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ReelOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(transparent 60%, rgba(0,0,0,0.4))',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '20px',
  zIndex: 2,
});

const TopActions = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
});

const BottomContent = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
});

const ReelInfo = styled(Box)({
  flex: 1,
  marginRight: '16px',
});

const UserInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '12px',
});

const Username = styled(Typography)({
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  marginLeft: '8px',
  marginRight: '8px',
});

const FollowButton = styled(Button)({
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'none',
  border: '1px solid #ffffff',
  borderRadius: '4px',
  padding: '2px 8px',
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const ReelCaption = styled(Typography)({
  color: '#ffffff',
  fontSize: '14px',
  lineHeight: 1.4,
  marginBottom: '8px',
});

const ReelMusic = styled(Typography)({
  color: '#ffffff',
  fontSize: '12px',
  opacity: 0.8,
});

const SideActions = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
});

const ActionButton = styled(IconButton)({
  color: '#ffffff',
  padding: '8px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const ActionCount = styled(Typography)({
  color: '#ffffff',
  fontSize: '12px',
  textAlign: 'center',
  marginTop: '4px',
});

const CreateReelFab = styled(Fab)({
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  backgroundColor: '#0095f6',
  color: '#ffffff',
  zIndex: 1000,
  '&:hover': {
    backgroundColor: '#1877f2',
  },
});

const VolumeControl = styled(IconButton)({
  position: 'absolute',
  top: '20px',
  right: '20px',
  color: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

const PlayPauseOverlay = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 3,
});

interface Reel {
  id: number;
  video_url: string;
  thumbnail_url: string;
  caption: string;
  music_name?: string;
  music_artist?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  user: {
    id: number;
    username: string;
    avatar: string;
    is_verified: boolean;
  };
  is_liked: boolean;
  created_at: string;
}

const ReelsPage: React.FC = () => {
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    loadReels();
  }, []);

  useEffect(() => {
    // Auto-play current reel and pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentReelIndex) {
          video.currentTime = 0;
          if (isPlaying) {
            video.play().catch(console.error);
          }
        } else {
          video.pause();
        }
        video.muted = isMuted;
      }
    });
  }, [currentReelIndex, isPlaying, isMuted]);

  const loadReels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reels`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReels(data.reels || []);
      } else {
        loadMockReels();
      }
    } catch (error) {
      console.error('Error loading reels:', error);
      loadMockReels();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockReels = () => {
    const mockReels: Reel[] = [
      {
        id: 1,
        video_url: '/api/placeholder/video/400/600',
        thumbnail_url: '/api/placeholder/400/600',
        caption: 'Amazing sunset at the beach 🌅 #sunset #beach #nature',
        music_name: 'Summer Vibes',
        music_artist: 'Chill Beats',
        likes_count: 1234,
        comments_count: 89,
        shares_count: 45,
        user: {
          id: 1,
          username: 'emma_model',
          avatar: '/api/placeholder/32/32',
          is_verified: true,
        },
        is_liked: false,
        created_at: '2024-01-15T10:30:00Z',
      },
      {
        id: 2,
        video_url: '/api/placeholder/video/400/600',
        thumbnail_url: '/api/placeholder/400/600',
        caption: 'Dance moves on point! 💃 Who wants to learn this? #dance #tutorial',
        music_name: 'Dance Floor',
        music_artist: 'Beat Master',
        likes_count: 2567,
        comments_count: 156,
        shares_count: 78,
        user: {
          id: 2,
          username: 'sofia_dance',
          avatar: '/api/placeholder/32/32',
          is_verified: false,
        },
        is_liked: true,
        created_at: '2024-01-14T15:45:00Z',
      },
      {
        id: 3,
        video_url: '/api/placeholder/video/400/600',
        thumbnail_url: '/api/placeholder/400/600',
        caption: 'Cooking hack that will change your life! 👨‍🍳 #cooking #lifehack #food',
        music_name: 'Kitchen Beats',
        music_artist: 'Chef Sounds',
        likes_count: 987,
        comments_count: 234,
        shares_count: 123,
        user: {
          id: 3,
          username: 'chef_marco',
          avatar: '/api/placeholder/32/32',
          is_verified: true,
        },
        is_liked: false,
        created_at: '2024-01-13T12:20:00Z',
      },
    ];

    setReels(mockReels);
  };

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'down' && currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(prev => prev + 1);
    } else if (direction === 'up' && currentReelIndex > 0) {
      setCurrentReelIndex(prev => prev - 1);
    }
  };

  const handleLike = async (reelId: number) => {
    try {
      const reel = reels[currentReelIndex];
      const method = reel.is_liked ? 'DELETE' : 'POST';
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reels/${reelId}/like`,
        {
          method,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        setReels(prev => prev.map(r => 
          r.id === reelId 
            ? { 
                ...r, 
                is_liked: !r.is_liked,
                likes_count: r.is_liked ? r.likes_count - 1 : r.likes_count + 1
              }
            : r
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${userId}/follow`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        // Update UI to show followed state
        console.log('User followed successfully');
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleVideoClick = () => {
    const video = videoRefs.current[currentReelIndex];
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
        setShowPlayButton(false);
      } else {
        video.pause();
        setIsPlaying(false);
        setShowPlayButton(true);
        setTimeout(() => setShowPlayButton(false), 1000);
      }
    }
  };

  const handleCreateReel = () => {
    setCreateDialogOpen(true);
  };

  const handleShare = async (reelId: number) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this LoveRose Reel!',
          url: `${window.location.origin}/loverose/reels/${reelId}`,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/loverose/reels/${reelId}`);
        console.log('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return (
      <ReelsContainer>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography color="white">Loading reels...</Typography>
        </Box>
      </ReelsContainer>
    );
  }

  if (reels.length === 0) {
    return (
      <ReelsContainer>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
          <Typography color="white" variant="h6" mb={2}>No reels available</Typography>
          <Button variant="contained" onClick={handleCreateReel}>
            Create your first reel
          </Button>
        </Box>
      </ReelsContainer>
    );
  }

  const currentReel = reels[currentReelIndex];

  return (
    <ReelsContainer>
      {/* Current Reel Video */}
      <ReelVideo
        ref={(el) => (videoRefs.current[currentReelIndex] = el)}
        src={currentReel.video_url}
        poster={currentReel.thumbnail_url}
        loop
        playsInline
        onClick={handleVideoClick}
      />

      {/* Volume Control */}
      <VolumeControl onClick={() => setIsMuted(!isMuted)}>
        {isMuted ? <VolumeOff /> : <VolumeUp />}
      </VolumeControl>

      {/* Play/Pause Overlay */}
      {showPlayButton && (
        <PlayPauseOverlay>
          <IconButton size="large" sx={{ color: 'white', fontSize: '3rem' }}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
        </PlayPauseOverlay>
      )}

      {/* Reel Overlay Content */}
      <ReelOverlay>
        <TopActions>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: '600' }}>
            Reels
          </Typography>
          <IconButton sx={{ color: 'white' }}>
            <MoreVert />
          </IconButton>
        </TopActions>

        <BottomContent>
          <ReelInfo>
            <UserInfo>
              <Avatar
                src={currentReel.user.avatar}
                sx={{ width: 32, height: 32 }}
              />
              <Username>{currentReel.user.username}</Username>
              {currentReel.user.is_verified && (
                <Verified sx={{ fontSize: 14, color: '#0095f6', mr: 1 }} />
              )}
              {currentReel.user.id !== user?.id && (
                <FollowButton onClick={() => handleFollow(currentReel.user.id)}>
                  Follow
                </FollowButton>
              )}
            </UserInfo>

            <ReelCaption>{currentReel.caption}</ReelCaption>

            {currentReel.music_name && (
              <ReelMusic>
                ♪ {currentReel.music_name} - {currentReel.music_artist}
              </ReelMusic>
            )}
          </ReelInfo>

          <SideActions>
            <Box textAlign="center">
              <ActionButton onClick={() => handleLike(currentReel.id)}>
                {currentReel.is_liked ? (
                  <Favorite sx={{ color: '#ff3040' }} />
                ) : (
                  <FavoriteBorder />
                )}
              </ActionButton>
              <ActionCount>{currentReel.likes_count.toLocaleString()}</ActionCount>
            </Box>

            <Box textAlign="center">
              <ActionButton>
                <ChatBubbleOutline />
              </ActionButton>
              <ActionCount>{currentReel.comments_count}</ActionCount>
            </Box>

            <Box textAlign="center">
              <ActionButton onClick={() => handleShare(currentReel.id)}>
                <Share />
              </ActionButton>
              <ActionCount>{currentReel.shares_count}</ActionCount>
            </Box>
          </SideActions>
        </BottomContent>
      </ReelOverlay>

      {/* Navigation Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          transform: 'translateY(-50%)',
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {currentReelIndex > 0 && (
          <IconButton
            onClick={() => handleScroll('up')}
            sx={{ 
              color: 'white', 
              pointerEvents: 'auto',
              backgroundColor: 'rgba(0,0,0,0.3)',
              ml: 2,
            }}
          >
            ↑
          </IconButton>
        )}
        {currentReelIndex < reels.length - 1 && (
          <IconButton
            onClick={() => handleScroll('down')}
            sx={{ 
              color: 'white', 
              pointerEvents: 'auto',
              backgroundColor: 'rgba(0,0,0,0.3)',
              mr: 2,
            }}
          >
            ↓
          </IconButton>
        )}
      </Box>

      {/* Create Reel FAB */}
      <CreateReelFab onClick={handleCreateReel}>
        <Add />
      </CreateReelFab>

      {/* Create Reel Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Reel</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Upload a video to create your reel
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write a caption..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
          >
            Choose Video
            <input
              type="file"
              accept="video/*"
              hidden
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create Reel</Button>
        </DialogActions>
      </Dialog>
    </ReelsContainer>
  );
};

export default ReelsPage;
