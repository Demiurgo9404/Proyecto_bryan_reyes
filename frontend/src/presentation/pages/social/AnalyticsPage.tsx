import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Button
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Visibility,
  Favorite,
  Comment,
  Share,
  PlayArrow,
  Image,
  VideoLibrary,
  Schedule,
  LocationOn,
  Refresh,
  Download,
  FilterList
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    totalReels: number;
    totalStories: number;
    totalEngagement: number;
    growthRate: number;
  };
  userGrowth: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    totalUsers: number;
  }>;
  contentMetrics: Array<{
    date: string;
    posts: number;
    reels: number;
    stories: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
  topContent: Array<{
    id: string;
    type: 'post' | 'reel' | 'story';
    author: {
      username: string;
      profilePicture?: string;
      role: string;
    };
    mediaUrl: string;
    description: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    viewsCount: number;
    createdAt: string;
  }>;
  usersByRole: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  engagementByTime: Array<{
    hour: number;
    engagement: number;
  }>;
  topHashtags: Array<{
    tag: string;
    count: number;
    growth: number;
  }>;
  locationData: Array<{
    country: string;
    users: number;
    engagement: number;
  }>;
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState(0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/social?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Cargando analytics...</Typography>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Error cargando datos</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Analytics de Red Social
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={timeRange}
              label="Período"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">Últimas 24h</MenuItem>
              <MenuItem value="7d">Últimos 7 días</MenuItem>
              <MenuItem value="30d">Últimos 30 días</MenuItem>
              <MenuItem value="90d">Últimos 3 meses</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={fetchAnalytics}>
            <Refresh />
          </IconButton>
          <Button startIcon={<Download />} variant="outlined">
            Exportar
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Usuarios Totales
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(data.overview.totalUsers)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <TrendingUp color="success" fontSize="small" />
                    <Typography variant="body2" color="success.main">
                      +{data.overview.growthRate}%
                    </Typography>
                  </Box>
                </Box>
                <People color="primary" sx={{ fontSize: 40 }} />
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
                    Usuarios Activos
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(data.overview.activeUsers)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {((data.overview.activeUsers / data.overview.totalUsers) * 100).toFixed(1)}% del total
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
                    Contenido Total
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(data.overview.totalPosts + data.overview.totalReels + data.overview.totalStories)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Posts: {formatNumber(data.overview.totalPosts)} | Reels: {formatNumber(data.overview.totalReels)}
                  </Typography>
                </Box>
                <VideoLibrary color="info" sx={{ fontSize: 40 }} />
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
                    Engagement Total
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(data.overview.totalEngagement)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Likes, comentarios, shares
                  </Typography>
                </Box>
                <Favorite color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Crecimiento de Usuarios" />
          <Tab label="Métricas de Contenido" />
          <Tab label="Contenido Popular" />
          <Tab label="Usuarios por Rol" />
          <Tab label="Engagement por Hora" />
          <Tab label="Hashtags Trending" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Crecimiento de Usuarios
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="newUsers" stroke="#8884d8" name="Nuevos Usuarios" />
              <Line type="monotone" dataKey="activeUsers" stroke="#82ca9d" name="Usuarios Activos" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Métricas de Contenido y Engagement
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.contentMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="posts" stackId="1" stroke="#8884d8" fill="#8884d8" name="Posts" />
              <Area type="monotone" dataKey="reels" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Reels" />
              <Area type="monotone" dataKey="stories" stackId="1" stroke="#ffc658" fill="#ffc658" name="Stories" />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Contenido Más Popular
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contenido</TableCell>
                  <TableCell>Autor</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Likes</TableCell>
                  <TableCell align="right">Comentarios</TableCell>
                  <TableCell align="right">Shares</TableCell>
                  <TableCell align="right">Vistas</TableCell>
                  <TableCell>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.topContent.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={content.mediaUrl}
                          variant="rounded"
                          sx={{ width: 60, height: 60 }}
                        />
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {content.description?.substring(0, 50)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar src={content.author.profilePicture} sx={{ width: 32, height: 32 }} />
                        <Box>
                          <Typography variant="body2">@{content.author.username}</Typography>
                          <Chip
                            label={content.author.role}
                            size="small"
                            color={getRoleColor(content.author.role) as any}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={content.type}
                        size="small"
                        icon={content.type === 'reel' ? <PlayArrow /> : <Image />}
                      />
                    </TableCell>
                    <TableCell align="right">{formatNumber(content.likesCount)}</TableCell>
                    <TableCell align="right">{formatNumber(content.commentsCount)}</TableCell>
                    <TableCell align="right">{formatNumber(content.sharesCount)}</TableCell>
                    <TableCell align="right">{formatNumber(content.viewsCount)}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true, locale: es })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Distribución por Roles
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ role, percentage }) => `${role} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Detalles por Rol
              </Typography>
              {data.usersByRole.map((roleData, index) => (
                <Box key={roleData.role} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body1">{roleData.role}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatNumber(roleData.count)} usuarios
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={roleData.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: COLORS[index % COLORS.length]
                      }
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Engagement por Hora del Día
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.engagementByTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="engagement" fill="#8884d8" name="Engagement" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {activeTab === 5 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Hashtags Trending
          </Typography>
          <Grid container spacing={2}>
            {data.topHashtags.map((hashtag, index) => (
              <Grid item xs={12} sm={6} md={4} key={hashtag.tag}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">#{hashtag.tag}</Typography>
                      <Chip
                        label={hashtag.growth > 0 ? `+${hashtag.growth}%` : `${hashtag.growth}%`}
                        color={hashtag.growth > 0 ? 'success' : 'error'}
                        size="small"
                        icon={hashtag.growth > 0 ? <TrendingUp /> : <TrendingDown />}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatNumber(hashtag.count)} usos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default AnalyticsPage;
