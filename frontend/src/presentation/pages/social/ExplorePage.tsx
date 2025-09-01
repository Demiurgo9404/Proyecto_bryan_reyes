import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider,
  Badge,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Search,
  TrendingUp,
  People,
  Tag,
  LocationOn,
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Share,
  PlayArrow,
  MoreVert,
  PersonAdd,
  PersonAddDisabled,
  FilterList,
  Close,
  Explore,
  PhotoLibrary,
  Videocam,
  MusicNote
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'reel' | 'hashtag' | 'location';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
    isFollowing: boolean;
    followersCount: number;
  };
  metrics?: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    viewsCount: number;
  };
  hashtags?: string[];
  location?: string;
  createdAt: string;
}

interface TrendingHashtag {
  tag: string;
  postsCount: number;
  growth: number;
}

interface SuggestedUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: string;
  bio?: string;
  followersCount: number;
  mutualFollowersCount: number;
  isFollowing: boolean;
  reason: string; // Why this user is suggested
}

interface ExploreContent {
  id: string;
  type: 'post' | 'reel' | 'story';
  user: {
    id: string;
    username: string;
    profilePicture?: string;
    role: string;
  };
  mediaUrl: string;
  thumbnailUrl?: string;
  description?: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  hashtags?: string[];
}

const ExplorePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [exploreContent, setExploreContent] = useState<ExploreContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ExploreContent | null>(null);
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [contentFilter, setContentFilter] = useState<'all' | 'posts' | 'reels' | 'stories'>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const searchCategories = [
    { label: 'Todo', value: 'all' },
    { label: 'Usuarios', value: 'users' },
    { label: 'Publicaciones', value: 'posts' },
    { label: 'Reels', value: 'reels' },
    { label: 'Hashtags', value: 'hashtags' },
    { label: 'Ubicaciones', value: 'locations' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchExploreContent();
  }, [contentFilter, timeFilter]);

  const fetchInitialData = async () => {
    try {
      const [hashtagsRes, usersRes, contentRes] = await Promise.all([
        fetch('/api/explore/trending-hashtags', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/explore/suggested-users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/explore/content', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const [hashtagsData, usersData, contentData] = await Promise.all([
        hashtagsRes.json(),
        usersRes.json(),
        contentRes.json()
      ]);

      setTrendingHashtags(hashtagsData.hashtags || []);
      setSuggestedUsers(usersData.users || []);
      setExploreContent(contentData.content || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExploreContent = async () => {
    try {
      const params = new URLSearchParams({
        type: contentFilter,
        timeRange: timeFilter
      });

      const response = await fetch(`/api/explore/content?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setExploreContent(data.content || []);
    } catch (error) {
      console.error('Error fetching explore content:', error);
    }
  };

  const performSearch = async () => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        // Update local state
        setSuggestedUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
        ));
        setSearchResults(prev => prev.map(result => 
          result.type === 'user' && result.user?.id === userId 
            ? { ...result, user: { ...result.user!, isFollowing: !result.user!.isFollowing } }
            : result
        ));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleLikeContent = async (contentId: string) => {
    try {
      const response = await fetch(`/api/posts/${contentId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setExploreContent(prev => prev.map(content => 
          content.id === contentId 
            ? { ...content, likesCount: content.likesCount + 1 }
            : content
        ));
      }
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderSearchResults = () => (
    <Box>
      {searchResults.length === 0 && searchQuery.trim() && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          No se encontraron resultados para "{searchQuery}"
        </Typography>
      )}

      {searchResults.map(result => (
        <Card key={`${result.type}-${result.id}`} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              {result.type === 'user' && result.user && (
                <>
                  <Avatar src={result.user.profilePicture} sx={{ width: 50, height: 50 }} />
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {result.user.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {result.user.firstName} {result.user.lastName}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
                      <Chip 
                        label={result.user.role} 
                        size="small"
                        color={
                          result.user.role === 'SuperAdmin' ? 'secondary' :
                          result.user.role === 'Admin' ? 'primary' :
                          result.user.role === 'Model' ? 'error' :
                          result.user.role === 'Study' ? 'success' : 'default'
                        }
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatNumber(result.user.followersCount)} seguidores
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant={result.user.isFollowing ? 'outlined' : 'contained'}
                    size="small"
                    startIcon={result.user.isFollowing ? <PersonAddDisabled /> : <PersonAdd />}
                    onClick={() => handleFollowUser(result.user!.id)}
                  >
                    {result.user.isFollowing ? 'Siguiendo' : 'Seguir'}
                  </Button>
                </>
              )}

              {(result.type === 'post' || result.type === 'reel') && (
                <>
                  <Box sx={{ width: 60, height: 60, borderRadius: 1, overflow: 'hidden' }}>
                    {result.type === 'reel' ? (
                      <Box sx={{ position: 'relative' }}>
                        <img
                          src={result.thumbnailUrl || result.imageUrl}
                          alt=""
                          style={{ width: '100%', height: 60, objectFit: 'cover' }}
                        />
                        <PlayArrow sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white' }} />
                      </Box>
                    ) : (
                      <img
                        src={result.imageUrl}
                        alt=""
                        style={{ width: '100%', height: 60, objectFit: 'cover' }}
                      />
                    )}
                  </Box>
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {result.user?.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {result.title}
                    </Typography>
                    <Box display="flex" gap={2} sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatNumber(result.metrics?.likesCount || 0)} likes
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatNumber(result.metrics?.commentsCount || 0)} comentarios
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}

              {result.type === 'hashtag' && (
                <>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Tag />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      #{result.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatNumber(result.metrics?.viewsCount || 0)} publicaciones
                    </Typography>
                  </Box>
                </>
              )}

              {result.type === 'location' && (
                <>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <LocationOn />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {result.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {result.subtitle}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderTrendingHashtags = () => (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Tendencias
      </Typography>
      <Grid container spacing={2}>
        {trendingHashtags.map((hashtag, index) => (
          <Grid item xs={12} sm={6} md={4} key={hashtag.tag}>
            <Card sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="h6" color="primary.main">
                    #{hashtag.tag}
                  </Typography>
                  <Chip
                    label={`#${index + 1}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {formatNumber(hashtag.postsCount)} publicaciones
                </Typography>
                <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                  <TrendingUp color="success" fontSize="small" />
                  <Typography variant="caption" color="success.main">
                    +{hashtag.growth}% esta semana
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderSuggestedUsers = () => (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Usuarios sugeridos
      </Typography>
      <Grid container spacing={2}>
        {suggestedUsers.map(suggestedUser => (
          <Grid item xs={12} sm={6} md={4} key={suggestedUser.id}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  src={suggestedUser.profilePicture}
                  sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                />
                <Typography variant="subtitle1" fontWeight="bold">
                  {suggestedUser.username}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {suggestedUser.firstName} {suggestedUser.lastName}
                </Typography>
                <Chip 
                  label={suggestedUser.role} 
                  size="small" 
                  sx={{ mb: 2 }}
                  color={
                    suggestedUser.role === 'SuperAdmin' ? 'secondary' :
                    suggestedUser.role === 'Admin' ? 'primary' :
                    suggestedUser.role === 'Model' ? 'error' :
                    suggestedUser.role === 'Study' ? 'success' : 'default'
                  }
                />
                {suggestedUser.bio && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {suggestedUser.bio}
                  </Typography>
                )}
                <Box display="flex" justifyContent="center" gap={2} sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatNumber(suggestedUser.followersCount)} seguidores
                  </Typography>
                  {suggestedUser.mutualFollowersCount > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {suggestedUser.mutualFollowersCount} en común
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" color="primary.main" sx={{ mb: 2, display: 'block' }}>
                  {suggestedUser.reason}
                </Typography>
                <Button
                  fullWidth
                  variant={suggestedUser.isFollowing ? 'outlined' : 'contained'}
                  startIcon={suggestedUser.isFollowing ? <PersonAddDisabled /> : <PersonAdd />}
                  onClick={() => handleFollowUser(suggestedUser.id)}
                >
                  {suggestedUser.isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderExploreGrid = () => (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Explorar contenido
        </Typography>
        <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
          <FilterList />
        </IconButton>
      </Box>

      <Grid container spacing={1}>
        {exploreContent.map(content => (
          <Grid item xs={4} sm={3} md={2} key={content.id}>
            <Card 
              sx={{ 
                aspectRatio: '1/1', 
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 }
              }}
              onClick={() => setSelectedContent(content)}
            >
              <Box sx={{ position: 'relative', height: '100%' }}>
                {content.type === 'reel' ? (
                  <>
                    <img
                      src={content.thumbnailUrl || content.mediaUrl}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        borderRadius: 1,
                        p: 0.5
                      }}
                    >
                      <Videocam sx={{ color: 'white', fontSize: 16 }} />
                    </Box>
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
                        {formatNumber(content.viewsCount)}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <img
                      src={content.mediaUrl}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {content.type === 'story' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          borderRadius: 1,
                          p: 0.5
                        }}
                      >
                        <MusicNote sx={{ color: 'white', fontSize: 16 }} />
                      </Box>
                    )}
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
                        {formatNumber(content.likesCount)}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Search bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar usuarios, publicaciones, hashtags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Search results or main content */}
      {searchQuery.trim() ? (
        renderSearchResults()
      ) : (
        <>
          {/* Navigation tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<Explore />} label="Explorar" />
              <Tab icon={<TrendingUp />} label="Tendencias" />
              <Tab icon={<People />} label="Usuarios" />
            </Tabs>
          </Paper>

          {/* Tab content */}
          {activeTab === 0 && renderExploreGrid()}
          {activeTab === 1 && renderTrendingHashtags()}
          {activeTab === 2 && renderSuggestedUsers()}
        </>
      )}

      {/* Content detail dialog */}
      <Dialog
        open={!!selectedContent}
        onClose={() => setSelectedContent(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedContent && (
          <DialogContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={selectedContent.user.profilePicture} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedContent.user.username}
                  </Typography>
                  <Chip 
                    label={selectedContent.user.role} 
                    size="small"
                    color={
                      selectedContent.user.role === 'SuperAdmin' ? 'secondary' :
                      selectedContent.user.role === 'Admin' ? 'primary' :
                      selectedContent.user.role === 'Model' ? 'error' :
                      selectedContent.user.role === 'Study' ? 'success' : 'default'
                    }
                  />
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedContent(null)}>
                <Close />
              </IconButton>
            </Box>

            {selectedContent.type === 'reel' ? (
              <video
                src={selectedContent.mediaUrl}
                controls
                style={{ width: '100%', maxHeight: 400, borderRadius: 8 }}
              />
            ) : (
              <img
                src={selectedContent.mediaUrl}
                alt=""
                style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
              />
            )}

            {selectedContent.description && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                {selectedContent.description}
              </Typography>
            )}

            {selectedContent.hashtags && (
              <Box sx={{ mt: 1 }}>
                {selectedContent.hashtags.map(tag => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}

            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
              <Box display="flex" gap={2}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <IconButton onClick={() => handleLikeContent(selectedContent.id)}>
                    <Favorite color="error" />
                  </IconButton>
                  <Typography variant="body2">
                    {formatNumber(selectedContent.likesCount)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <IconButton>
                    <ChatBubbleOutline />
                  </IconButton>
                  <Typography variant="body2">
                    {formatNumber(selectedContent.commentsCount)}
                  </Typography>
                </Box>
                <IconButton>
                  <Share />
                </IconButton>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(selectedContent.createdAt), { addSuffix: true, locale: es })}
              </Typography>
            </Box>
          </DialogContent>
        )}
      </Dialog>

      {/* Filter menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <MenuItem>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value as any)}
            >
              <MenuItem value="all">Todo</MenuItem>
              <MenuItem value="posts">Publicaciones</MenuItem>
              <MenuItem value="reels">Reels</MenuItem>
              <MenuItem value="stories">Historias</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Tiempo</InputLabel>
            <Select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
            >
              <MenuItem value="all">Todo</MenuItem>
              <MenuItem value="today">Hoy</MenuItem>
              <MenuItem value="week">Esta semana</MenuItem>
              <MenuItem value="month">Este mes</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ExplorePage;
