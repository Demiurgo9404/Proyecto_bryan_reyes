import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Badge,
  Fab
} from '@mui/material';
import {
  Add,
  VideoCall,
  PhotoCamera,
  Schedule,
  Analytics,
  MonetizationOn,
  Visibility,
  Favorite,
  Comment,
  Share,
  TrendingUp,
  CalendarToday,
  Edit,
  Delete,
  Publish,
  Draft,
  PlayArrow,
  Pause,
  Stop,
  Settings,
  Notifications,
  Star,
  AttachMoney,
  People,
  ThumbUp,
  Close,
  Upload,
  FilterList,
  Sort
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContentItem {
  id: string;
  type: 'post' | 'reel' | 'story';
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduledAt?: string;
  publishedAt?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  reachCount: number;
  engagementRate: number;
  revenue?: number;
  hashtags: string[];
  location?: string;
  isMonetized: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StudioStats {
  totalContent: number;
  totalViews: number;
  totalLikes: number;
  totalRevenue: number;
  averageEngagement: number;
  followerGrowth: number;
  topPerformingContent: ContentItem[];
  recentActivity: Array<{
    id: string;
    type: 'like' | 'comment' | 'follow' | 'share';
    user: {
      username: string;
      profilePicture?: string;
    };
    content?: {
      id: string;
      title: string;
      thumbnailUrl?: string;
    };
    createdAt: string;
  }>;
  scheduledContent: ContentItem[];
  earnings: Array<{
    date: string;
    amount: number;
    source: 'tips' | 'subscriptions' | 'ads' | 'collaborations';
  }>;
}

const StudioPage: React.FC = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<StudioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  const [newContent, setNewContent] = useState({
    type: 'post' as 'post' | 'reel' | 'story',
    title: '',
    description: '',
    hashtags: [] as string[],
    location: '',
    isMonetized: false,
    scheduledAt: ''
  });

  useEffect(() => {
    fetchStudioData();
  }, []);

  const fetchStudioData = async () => {
    try {
      const [contentResponse, statsResponse] = await Promise.all([
        fetch('/api/studio/content', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/studio/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const contentData = await contentResponse.json();
      const statsData = await statsResponse.json();

      setContent(contentData.content || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching studio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    try {
      const response = await fetch('/api/studio/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newContent)
      });

      if (response.ok) {
        const createdContent = await response.json();
        setContent(prev => [createdContent.content, ...prev]);
        setOpenCreateDialog(false);
        setNewContent({
          type: 'post',
          title: '',
          description: '',
          hashtags: [],
          location: '',
          isMonetized: false,
          scheduledAt: ''
        });
      }
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const handleScheduleContent = async (contentId: string, scheduledAt: string) => {
    try {
      const response = await fetch(`/api/studio/content/${contentId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ scheduledAt })
      });

      if (response.ok) {
        fetchStudioData();
        setOpenScheduleDialog(false);
      }
    } catch (error) {
      console.error('Error scheduling content:', error);
    }
  };

  const handlePublishContent = async (contentId: string) => {
    try {
      const response = await fetch(`/api/studio/content/${contentId}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchStudioData();
      }
    } catch (error) {
      console.error('Error publishing content:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'scheduled': return 'warning';
      case 'draft': return 'default';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  const filteredContent = content.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return b.viewsCount - a.viewsCount;
      case 'engagement':
        return b.engagementRate - a.engagementRate;
      case 'revenue':
        return (b.revenue || 0) - (a.revenue || 0);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Cargando estudio...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Estudio de Contenido
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Crear Contenido
          </Button>
          <Button
            variant="outlined"
            startIcon={<Schedule />}
            onClick={() => setOpenScheduleDialog(true)}
          >
            Programar
          </Button>
        </Box>
      </Box>

      {/* Stats Overview */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Contenido Total
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalContent}
                    </Typography>
                  </Box>
                  <VideoCall color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Vistas Totales
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatNumber(stats.totalViews)}
                    </Typography>
                  </Box>
                  <Visibility color="info" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Engagement Promedio
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.averageEngagement.toFixed(1)}%
                    </Typography>
                  </Box>
                  <TrendingUp color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Ingresos Totales
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ${stats.totalRevenue.toFixed(2)}
                    </Typography>
                  </Box>
                  <MonetizationOn color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Mi Contenido" />
          <Tab label="Programado" />
          <Tab label="Rendimiento" />
          <Tab label="Monetización" />
          <Tab label="Actividad" />
        </Tabs>
      </Paper>

      {/* Content Management */}
      {activeTab === 0 && (
        <>
          {/* Filters */}
          <Box display="flex" gap={2} sx={{ mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterStatus}
                label="Estado"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="draft">Borradores</MenuItem>
                <MenuItem value="scheduled">Programado</MenuItem>
                <MenuItem value="published">Publicado</MenuItem>
                <MenuItem value="archived">Archivado</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                label="Ordenar por"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="createdAt">Fecha</MenuItem>
                <MenuItem value="views">Vistas</MenuItem>
                <MenuItem value="engagement">Engagement</MenuItem>
                <MenuItem value="revenue">Ingresos</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Content Grid */}
          <Grid container spacing={2}>
            {filteredContent.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.thumbnailUrl || item.mediaUrl}
                    alt={item.title}
                  />
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap>
                        {item.title}
                      </Typography>
                      <Chip
                        label={item.status}
                        size="small"
                        color={getStatusColor(item.status) as any}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description.substring(0, 80)}...
                    </Typography>

                    <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Visibility fontSize="small" color="action" />
                        <Typography variant="caption">
                          {formatNumber(item.viewsCount)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Favorite fontSize="small" color="action" />
                        <Typography variant="caption">
                          {formatNumber(item.likesCount)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Comment fontSize="small" color="action" />
                        <Typography variant="caption">
                          {formatNumber(item.commentsCount)}
                        </Typography>
                      </Box>
                      {item.isMonetized && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <MonetizationOn fontSize="small" color="warning" />
                          <Typography variant="caption">
                            ${item.revenue?.toFixed(2) || '0.00'}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                      <IconButton size="small" onClick={() => setSelectedContent(item)}>
                        <Edit />
                      </IconButton>
                      {item.status === 'draft' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handlePublishContent(item.id)}
                        >
                          <Publish />
                        </IconButton>
                      )}
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Scheduled Content */}
      {activeTab === 1 && stats && (
        <Grid container spacing={2}>
          {stats.scheduledContent.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={item.thumbnailUrl || item.mediaUrl}
                      variant="rounded"
                      sx={{ width: 80, height: 80 }}
                    />
                    <Box flex={1}>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.description.substring(0, 100)}...
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip
                          label={item.type}
                          size="small"
                          icon={item.type === 'reel' ? <PlayArrow /> : <PhotoCamera />}
                        />
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="caption">
                            {item.scheduledAt && formatDistanceToNow(new Date(item.scheduledAt), { addSuffix: true, locale: es })}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Performance Tab */}
      {activeTab === 2 && stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contenido Mejor Valorado
              </Typography>
              <List>
                {stats.topPerformingContent.slice(0, 5).map((item) => (
                  <ListItem key={item.id}>
                    <ListItemAvatar>
                      <Avatar src={item.thumbnailUrl || item.mediaUrl} variant="rounded" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <Box display="flex" gap={2}>
                          <Typography variant="caption">
                            {formatNumber(item.viewsCount)} vistas
                          </Typography>
                          <Typography variant="caption">
                            {item.engagementRate.toFixed(1)}% engagement
                          </Typography>
                        </Box>
                      }
                    />
                    <Typography variant="body2" color="success.main">
                      ${item.revenue?.toFixed(2) || '0.00'}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Métricas de Engagement
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Promedio de Engagement
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stats.averageEngagement}
                  sx={{ height: 8, borderRadius: 4, mt: 1 }}
                />
                <Typography variant="caption">
                  {stats.averageEngagement.toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Crecimiento de Seguidores
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUp color="success" />
                  <Typography variant="h6" color="success.main">
                    +{stats.followerGrowth}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Create Content Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Crear Nuevo Contenido</Typography>
            <IconButton onClick={() => setOpenCreateDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tipo de Contenido</InputLabel>
                <Select
                  value={newContent.type}
                  label="Tipo de Contenido"
                  onChange={(e) => setNewContent(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <MenuItem value="post">Post</MenuItem>
                  <MenuItem value="reel">Reel</MenuItem>
                  <MenuItem value="story">Story</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={newContent.title}
                onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descripción"
                value={newContent.description}
                onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ubicación"
                value={newContent.location}
                onChange={(e) => setNewContent(prev => ({ ...prev, location: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newContent.isMonetized}
                    onChange={(e) => setNewContent(prev => ({ ...prev, isMonetized: e.target.checked }))}
                  />
                }
                label="Monetizar contenido"
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
            <Button onClick={() => setOpenCreateDialog(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleCreateContent}>
              Crear Contenido
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={() => setOpenCreateDialog(true)}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default StudioPage;
