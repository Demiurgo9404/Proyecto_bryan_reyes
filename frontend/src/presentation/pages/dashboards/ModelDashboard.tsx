import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useModelService } from '@/presentation/hooks/useModelService';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
  Avatar,
  Divider,
  Paper,
  Tabs,
  Tab,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material';
import {
  VideoCall as GoLiveIcon,
  PhotoLibrary as GalleryIcon,
  Chat as ChatIcon,
  Schedule as ScheduleIcon,
  AttachMoney as EarningsIcon,
  BarChart as StatsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import ModelDashboardLayout from '@/presentation/layouts/ModelDashboardLayout';

// Interfaces
export interface ModelProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  profileImage: string;
  coverImage: string;
  isOnline: boolean;
  lastSeen: string;
  categories: string[];
  languages: string[];
  pricePerMinute: number;
  rating: number;
  totalSessions: number;
  totalEarnings: number;
  totalViews: number;
  isFavorite: boolean;
}

interface DashboardStats {
  totalEarnings: number;
  totalSessions: number;
  totalViews: number;
  rating: number;
  availableSlots: number;
  upcomingSessions: number;
}

const ModelDashboard: React.FC = () => {
  const { user } = useAuth();
  const modelService = useModelService();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ModelProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Simulate API calls - replace with actual service calls
      // const profileData = await modelService.getModelProfile(user.id);
      // setProfile(profileData);
      // 
      // const statsData = await modelService.getModelStats(user.id);
      // setStats(statsData);
      
      // Mock data for demonstration
      setProfile({
        id: user.id,
        username: user.username || 'modelo1',
        displayName: user.displayName || 'Modelo Ejemplo',
        email: user.email || 'modelo@example.com',
        bio: '¡Hola! Soy una modelo profesional con experiencia en transmisiones en vivo.',
        profileImage: user.profileImage || '',
        coverImage: '',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        categories: ['Entretenimiento', 'Música', 'Baile'],
        languages: ['Español', 'Inglés'],
        pricePerMinute: 5.99,
        rating: 4.8,
        totalSessions: 124,
        totalEarnings: 5240.50,
        totalViews: 8452,
        isFavorite: true,
      });
      
      setStats({
        totalEarnings: 5240.50,
        totalSessions: 124,
        totalViews: 8452,
        rating: 4.8,
        availableSlots: 12,
        upcomingSessions: 5,
      });
      
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle navigation
  const handleGoLive = () => {
    navigate('/model/live');
  };

  const handleViewProfile = () => {
    navigate('/model/profile');
  };

  if (loading) {
    return (
      <ModelDashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </ModelDashboardLayout>
    );
  }

  if (error) {
    return (
      <ModelDashboardLayout>
        <Box p={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      </ModelDashboardLayout>
    );
  }

  return (
    <ModelDashboardLayout>
      <Container maxWidth="xl">
        {/* Header with Quick Actions */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Hola, {profile?.displayName || 'Modelo'}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Bienvenida a tu panel de control
              </Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<GoLiveIcon />}
                onClick={handleGoLive}
                sx={{ mr: 2 }}
              >
                Transmitir en Vivo
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PersonIcon />}
                onClick={handleViewProfile}
              >
                Ver Perfil
              </Button>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <StatCard
                title="Ganancias Totales"
                value={`$${stats?.totalEarnings.toFixed(2) || '0.00'}`}
                icon={<EarningsIcon />}
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <StatCard
                title="Sesiones"
                value={stats?.totalSessions.toString() || '0'}
                icon={<ScheduleIcon />}
                color={theme.palette.success.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <StatCard
                title="Vistas"
                value={stats?.totalViews.toString() || '0'}
                icon={<VisibilityIcon />}
                color={theme.palette.info.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <StatCard
                title="Calificación"
                value={stats?.rating.toFixed(1) || '0.0'}
                icon={<StarIcon />}
                color={theme.palette.warning.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <StatCard
                title="Próximas Sesiones"
                value={stats?.upcomingSessions.toString() || '0'}
                icon={<ScheduleIcon />}
                color={theme.palette.secondary.main}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Acciones Rápidas
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={3}>
                    <ActionButton
                      icon={<GoLiveIcon />}
                      label="Transmitir"
                      onClick={handleGoLive}
                      color={theme.palette.error.main}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <ActionButton
                      icon={<GalleryIcon />}
                      label="Galería"
                      onClick={() => navigate('/model/gallery')}
                      color={theme.palette.primary.main}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <ActionButton
                      icon={<ChatIcon />}
                      label="Mensajes"
                      onClick={() => navigate('/model/messages')}
                      color={theme.palette.info.main}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <ActionButton
                      icon={<ScheduleIcon />}
                      label="Agenda"
                      onClick={() => navigate('/model/schedule')}
                      color={theme.palette.success.main}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actividad Reciente
                </Typography>
                <Box p={2} bgcolor={alpha(theme.palette.primary.main, 0.05)} borderRadius={1} mb={2}>
                  <Typography variant="body2">
                    <strong>Nuevo seguidor:</strong> usuario123 empezó a seguirte
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hace 2 horas
                  </Typography>
                </Box>
                <Box p={2} bgcolor={alpha(theme.palette.success.main, 0.05)} borderRadius={1} mb={2}>
                  <Typography variant="body2">
                    <strong>Pago recibido:</strong> $25.00 por sesión privada
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ayer, 14:30
                  </Typography>
                </Box>
                <Box p={2} bgcolor={alpha(theme.palette.info.main, 0.05)} borderRadius={1}>
                  <Typography variant="body2">
                    <strong>Nuevo mensaje</strong> de usuario456
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ayer, 10:15
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Profile Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar 
                    src={profile?.profileImage} 
                    sx={{ width: 80, height: 80, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{profile?.displayName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{profile?.username}
                    </Typography>
                    <Chip 
                      label={profile?.isOnline ? 'En línea' : 'Desconectada'} 
                      size="small" 
                      color={profile?.isOnline ? 'success' : 'default'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                <Typography variant="body2" paragraph>
                  {profile?.bio || 'No hay biografía disponible.'}
                </Typography>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  onClick={() => navigate('/model/profile/edit')}
                >
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estadísticas Rápidas
                </Typography>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Seguidores
                  </Typography>
                  <Typography variant="h6">1,245</Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Calificación Promedio
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <StarIcon color="warning" />
                    <Typography variant="h6" ml={0.5}>
                      {profile?.rating.toFixed(1) || '0.0'}
                      <Typography component="span" variant="body2" color="text.secondary" ml={0.5}>
                        (124 reseñas)
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Precio por Minuto
                  </Typography>
                  <Typography variant="h6">
                    ${profile?.pricePerMinute?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ModelDashboardLayout>
  );
};

// Helper Components
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: 2, 
      height: '100%',
      border: `1px solid rgba(0, 0, 0, 0.12)`,
      borderRadius: 2,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3,
      },
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: alpha(color, 0.1),
          width: 48,
          height: 48,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}
      >
        {React.cloneElement(icon as React.ReactElement, { fontSize: 'large' })}
      </Box>
    </Box>
  </Paper>
);

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, color }) => (
  <Button
    fullWidth
    variant="outlined"
    onClick={onClick}
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 100,
      border: `1px solid ${alpha(color, 0.3)}`,
      '&:hover': {
        borderColor: color,
        backgroundColor: alpha(color, 0.05),
      },
    }}
  >
    <Box 
      sx={{ 
        color,
        mb: 1,
        '& > svg': {
          fontSize: 32,
        },
      }}
    >
      {icon}
    </Box>
    <Typography variant="body2" color="text.primary">
      {label}
    </Typography>
  </Button>
);

export default ModelDashboard;
