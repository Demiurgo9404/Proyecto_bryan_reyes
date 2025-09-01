import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Avatar,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Badge,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Fab
} from '@mui/material';
import {
  Edit,
  Settings,
  MoreVert,
  PersonAdd,
  PersonAddDisabled,
  Message,
  Call,
  Videocam,
  Share,
  Block,
  Report,
  PhotoCamera,
  GridOn,
  PlayArrow,
  Favorite,
  ChatBubbleOutline,
  LocationOn,
  Link as LinkIcon,
  Email,
  Phone,
  Cake,
  Work,
  School,
  Public,
  Lock,
  Group,
  Star,
  Verified,
  Close,
  Add,
  Remove
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  coverImage?: string;
  bio?: string;
  website?: string;
  location?: string;
  birthDate?: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isBlocked: boolean;
  isMuted: boolean;
  joinedAt: string;
  lastActiveAt?: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
  };
  interests: string[];
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

interface ProfileContent {
  id: string;
  type: 'post' | 'reel' | 'story';
  mediaUrl: string;
  thumbnailUrl?: string;
  description?: string;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  createdAt: string;
  isHighlight?: boolean;
}

interface Follower {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: string;
  isFollowing: boolean;
  mutualFollowersCount: number;
}

const ProfilePage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [content, setContent] = useState<ProfileContent[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [openFollowers, setOpenFollowers] = useState(false);
  const [openFollowing, setOpenFollowing] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ProfileContent | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    website: '',
    location: '',
    phone: '',
    isPrivate: false,
    socialLinks: {
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: '',
      youtube: ''
    },
    interests: [] as string[]
  });

  const isOwnProfile = profile?.id === currentUser?.id;

  const availableInterests = [
    'Tecnología', 'Arte', 'Música', 'Deportes', 'Viajes', 'Fotografía',
    'Cocina', 'Libros', 'Películas', 'Gaming', 'Fitness', 'Moda',
    'Naturaleza', 'Ciencia', 'Historia', 'Educación', 'Negocios', 'Salud'
  ];

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  useEffect(() => {
    if (profile) {
      setEditData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio || '',
        website: profile.website || '',
        location: profile.location || '',
        phone: profile.phone || '',
        isPrivate: profile.isPrivate,
        socialLinks: profile.socialLinks,
        interests: profile.interests
      });
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${username}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setProfile(data.user);
      
      // Fetch user content
      const contentResponse = await fetch(`/api/users/${username}/content`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const contentData = await contentResponse.json();
      setContent(contentData.content || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await fetch(`/api/users/${username}/followers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setFollowers(data.followers || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`/api/users/${username}/following`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setFollowing(data.following || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`/api/users/${profile.id}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setProfile(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
        } : null);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleBlock = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`/api/users/${profile.id}/block`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, isBlocked: !prev.isBlocked } : null);
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile.user);
        setOpenEditProfile(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch('/api/users/profile-picture', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, profilePicture: data.profilePicture } : null);
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SuperAdmin': return 'secondary';
      case 'Admin': return 'primary';
      case 'Model': return 'error';
      case 'Study': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Cargando perfil...</Typography>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Usuario no encontrado</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Profile Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Cover Image */}
        {profile.coverImage && (
          <Box
            sx={{
              height: 200,
              backgroundImage: `url(${profile.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 2,
              mb: 2
            }}
          />
        )}

        <Box display="flex" alignItems="start" gap={3}>
          {/* Profile Picture */}
          <Box position="relative">
            <Avatar
              src={profile.profilePicture}
              sx={{ width: 150, height: 150, border: '4px solid white' }}
            />
            {isOwnProfile && (
              <>
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <PhotoCamera />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </IconButton>
              </>
            )}
          </Box>

          {/* Profile Info */}
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Typography variant="h4" fontWeight="bold">
                {profile.firstName} {profile.lastName}
              </Typography>
              <Chip
                label={profile.role}
                color={getRoleColor(profile.role) as any}
                size="small"
              />
              {profile.isVerified && (
                <Verified color="primary" />
              )}
              {profile.isPrivate && (
                <Lock color="action" />
              )}
            </Box>

            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              @{profile.username}
            </Typography>

            {profile.bio && (
              <Typography variant="body1" sx={{ mb: 2, maxWidth: 600 }}>
                {profile.bio}
              </Typography>
            )}

            {/* Profile Details */}
            <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
              {profile.location && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {profile.location}
                  </Typography>
                </Box>
              )}
              {profile.website && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <LinkIcon fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    color="primary"
                    component="a"
                    href={profile.website}
                    target="_blank"
                    sx={{ textDecoration: 'none' }}
                  >
                    {profile.website}
                  </Typography>
                </Box>
              )}
              <Box display="flex" alignItems="center" gap={0.5}>
                <Cake fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Se unió {formatDistanceToNow(new Date(profile.joinedAt), { addSuffix: true, locale: es })}
                </Typography>
              </Box>
            </Box>

            {/* Stats */}
            <Box display="flex" gap={3} sx={{ mb: 2 }}>
              <Button
                variant="text"
                onClick={() => {
                  fetchFollowers();
                  setOpenFollowers(true);
                }}
              >
                <Typography variant="body2">
                  <strong>{formatNumber(profile.followersCount)}</strong> seguidores
                </Typography>
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  fetchFollowing();
                  setOpenFollowing(true);
                }}
              >
                <Typography variant="body2">
                  <strong>{formatNumber(profile.followingCount)}</strong> siguiendo
                </Typography>
              </Button>
              <Typography variant="body2">
                <strong>{formatNumber(profile.postsCount)}</strong> publicaciones
              </Typography>
            </Box>

            {/* Interests */}
            {profile.interests.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Intereses:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {profile.interests.map(interest => (
                    <Chip key={interest} label={interest} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Achievements */}
            {profile.achievements.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Logros:
                </Typography>
                <Box display="flex" gap={1}>
                  {profile.achievements.slice(0, 5).map(achievement => (
                    <Badge key={achievement.id} badgeContent={achievement.icon} color="primary">
                      <Star color="action" />
                    </Badge>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box display="flex" flexDirection="column" gap={1}>
            {isOwnProfile ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setOpenEditProfile(true)}
              >
                Editar perfil
              </Button>
            ) : (
              <>
                <Button
                  variant={profile.isFollowing ? 'outlined' : 'contained'}
                  startIcon={profile.isFollowing ? <PersonAddDisabled /> : <PersonAdd />}
                  onClick={handleFollow}
                >
                  {profile.isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
                <Button variant="outlined" startIcon={<Message />}>
                  Mensaje
                </Button>
                <IconButton onClick={() => handleFollow()}>
                  <Call />
                </IconButton>
              </>
            )}
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Content Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<GridOn />} label="Publicaciones" />
          <Tab icon={<PlayArrow />} label="Reels" />
          <Tab icon={<Star />} label="Destacados" />
          {isOwnProfile && <Tab icon={<Settings />} label="Configuración" />}
        </Tabs>
      </Paper>

      {/* Content Grid */}
      {activeTab === 0 && (
        <Grid container spacing={1}>
          {content.filter(item => item.type === 'post').map(item => (
            <Grid item xs={4} sm={3} md={2} key={item.id}>
              <Card
                sx={{
                  aspectRatio: '1/1',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={() => setSelectedContent(item)}
              >
                <CardMedia
                  component="img"
                  image={item.thumbnailUrl || item.mediaUrl}
                  alt=""
                  sx={{ height: '100%', objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <Favorite fontSize="small" />
                  <Typography variant="caption">
                    {formatNumber(item.likesCount)}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={1}>
          {content.filter(item => item.type === 'reel').map(item => (
            <Grid item xs={4} sm={3} md={2} key={item.id}>
              <Card
                sx={{
                  aspectRatio: '9/16',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={() => setSelectedContent(item)}
              >
                <CardMedia
                  component="img"
                  image={item.thumbnailUrl || item.mediaUrl}
                  alt=""
                  sx={{ height: '100%', objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <PlayArrow fontSize="small" />
                  <Typography variant="caption">
                    {formatNumber(item.viewsCount || 0)}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={openEditProfile} onClose={() => setOpenEditProfile(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Editar perfil</Typography>
            <IconButton onClick={() => setOpenEditProfile(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={editData.firstName}
                onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido"
                value={editData.lastName}
                onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Biografía"
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sitio web"
                value={editData.website}
                onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ubicación"
                value={editData.location}
                onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Intereses:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                {availableInterests.map(interest => (
                  <Chip
                    key={interest}
                    label={interest}
                    size="small"
                    color={editData.interests.includes(interest) ? 'primary' : 'default'}
                    onClick={() => {
                      setEditData(prev => ({
                        ...prev,
                        interests: prev.interests.includes(interest)
                          ? prev.interests.filter(i => i !== interest)
                          : [...prev.interests, interest]
                      }));
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editData.isPrivate}
                    onChange={(e) => setEditData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  />
                }
                label="Cuenta privada"
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
            <Button onClick={() => setOpenEditProfile(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleUpdateProfile}>
              Guardar cambios
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Followers Dialog */}
      <Dialog open={openFollowers} onClose={() => setOpenFollowers(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Seguidores</DialogTitle>
        <DialogContent>
          <List>
            {followers.map(follower => (
              <ListItem key={follower.id}>
                <ListItemAvatar>
                  <Avatar src={follower.profilePicture} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2">
                        {follower.username}
                      </Typography>
                      <Chip
                        label={follower.role}
                        size="small"
                        color={getRoleColor(follower.role) as any}
                      />
                    </Box>
                  }
                  secondary={`${follower.firstName} ${follower.lastName}`}
                />
                <Button
                  size="small"
                  variant={follower.isFollowing ? 'outlined' : 'contained'}
                >
                  {follower.isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Following Dialog */}
      <Dialog open={openFollowing} onClose={() => setOpenFollowing(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Siguiendo</DialogTitle>
        <DialogContent>
          <List>
            {following.map(user => (
              <ListItem key={user.id}>
                <ListItemAvatar>
                  <Avatar src={user.profilePicture} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2">
                        {user.username}
                      </Typography>
                      <Chip
                        label={user.role}
                        size="small"
                        color={getRoleColor(user.role) as any}
                      />
                    </Box>
                  }
                  secondary={`${user.firstName} ${user.lastName}`}
                />
                <Button
                  size="small"
                  variant="outlined"
                >
                  Siguiendo
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Profile Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {!isOwnProfile && (
          <>
            <MenuItem onClick={handleBlock}>
              <Block sx={{ mr: 1 }} />
              {profile.isBlocked ? 'Desbloquear' : 'Bloquear'}
            </MenuItem>
            <MenuItem>
              <Report sx={{ mr: 1 }} />
              Reportar
            </MenuItem>
          </>
        )}
        <MenuItem>
          <Share sx={{ mr: 1 }} />
          Compartir perfil
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ProfilePage;
