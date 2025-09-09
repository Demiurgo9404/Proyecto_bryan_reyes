import React, { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useModelService } from '@/presentation/hooks/useModelService';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Grid,
  Paper,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

export interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
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
  // Auth and service hooks
  const { user, logout } = useAuth();
  const modelService = useModelService();
  
  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState<ModelProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<Partial<ModelProfile>>({});
  const [openProfileDialog, setOpenProfileDialog] = useState<boolean>(false);
  
  // Availability state
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [openAddSlotDialog, setOpenAddSlotDialog] = useState<boolean>(false);
  const [newSlot, setNewSlot] = useState<{ startTime: string; endTime: string }>({ 
    startTime: '', 
    endTime: '' 
  });
  
  // Stats state
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    totalSessions: 0,
    totalViews: 0,
    rating: 0,
    availableSlots: 0,
    upcomingSessions: 0
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  
  // Derived state
  const openMenu = Boolean(anchorEl);
  const openNotificationsMenu = Boolean(notificationsAnchorEl);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'PPP', { locale: es });
  };

  // Format time
  const formatTime = (timeString: string): string => {
    return format(new Date(timeString), 'HH:mm');
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load profile
      const profileData = await modelService.getModelProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        setEditingProfile({
          displayName: profileData.displayName || '',
          bio: profileData.bio || '',
          pricePerMinute: profileData.pricePerMinute || 0,
          categories: profileData.categories || [],
          languages: profileData.languages || []
        });
      }
      
      // Load availability
      const availability = await modelService.getAvailabilitySlots(user.id);
      setAvailabilitySlots(availability || []);
      
      // Load stats
      const statsData = await modelService.getModelStats(user.id);
      if (statsData) {
        setStats({
          totalEarnings: statsData.totalEarnings || 0,
          totalSessions: statsData.totalSessions || 0,
          totalViews: statsData.totalViews || 0,
          rating: statsData.rating || 0,
          availableSlots: statsData.availableSlots || 0,
          upcomingSessions: statsData.upcomingSessions || 0
        });
      }
      
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!user?.id || !editingProfile) return;
    
    try {
      setLoading(true);
      const updatedProfile = await modelService.updateModelProfile(user.id, editingProfile as ModelProfile);
      setProfile(prev => ({
        ...(prev || {}),
        ...updatedProfile
      }));
      setOpenProfileDialog(false);
      setSuccess('Perfil actualizado correctamente');
    } catch (err) {
      setError('Error al actualizar el perfil');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle add availability slot
  const handleAddAvailabilitySlot = async () => {
    if (!user?.id || !newSlot.startTime || !newSlot.endTime) return;
    
    try {
      setLoading(true);
      const slot = await modelService.addAvailabilitySlot(user.id, {
        startTime: new Date(newSlot.startTime),
        endTime: new Date(newSlot.endTime)
      });
      
      setAvailabilitySlots(prev => [...(prev || []), slot]);
      setOpenAddSlotDialog(false);
      setNewSlot({ startTime: '', endTime: '' });
      setSuccess('Horario agregado correctamente');
    } catch (err) {
      setError('Error al agregar el horario');
      console.error('Error adding availability slot:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete availability slot
  const handleDeleteAvailabilitySlot = async (slotId: string) => {
    if (!user?.id || !slotId) return;
    
    try {
      setLoading(true);
      await modelService.deleteAvailabilitySlot(user.id, slotId);
      setAvailabilitySlots(prev => prev.filter(slot => slot.id !== slotId));
      setSuccess('Horario eliminado correctamente');
    } catch (err) {
      setError('Error al eliminar el horario');
      console.error('Error deleting availability slot:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle menu actions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingProfile(prev => ({
      ...prev!,
      [name]: value
    }));
  };

  // Handle close alerts
  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" onClose={handleCloseError}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Main render
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Panel de Control
        </Typography>
        <Box>
          <IconButton
            size="large"
            aria-label="show notifications"
            color="inherit"
            onClick={handleNotificationsOpen}
          >
            <NotificationsIcon />
          </IconButton>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <PersonIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={openMenu}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { setOpenProfileDialog(true); handleMenuClose(); }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mi Perfil</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Configuración</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={logout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cerrar Sesión</ListItemText>
            </MenuItem>
          </Menu>
          
          <Menu
            anchorEl={notificationsAnchorEl}
            open={openNotificationsMenu}
            onClose={handleNotificationsClose}
          >
            <MenuItem onClick={handleNotificationsClose}>
              <ListItemText primary="No hay notificaciones nuevas" />
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">Ganancias Totales</Typography>
              </Box>
              <Typography variant="h5">{formatCurrency(stats.totalEarnings)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">Sesiones</Typography>
              </Box>
              <Typography variant="h5">{stats.totalSessions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <VisibilityIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">Visitas</Typography>
              </Box>
              <Typography variant="h5">{stats.totalViews}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <StarIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">Calificación</Typography>
              </Box>
              <Typography variant="h5">{stats.rating.toFixed(1)}/5.0</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                <Avatar 
                  src={profile?.profileImage} 
                  alt={profile?.displayName}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {profile?.displayName || 'Usuario'}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  @{profile?.username || 'usuario'}
                </Typography>
                <Box display="flex" mb={2} flexWrap="wrap" justifyContent="center">
                  {profile?.categories?.map((category, index) => (
                    <Chip 
                      key={index} 
                      label={category} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="textSecondary" align="center" paragraph>
                  {profile?.bio || 'No hay biografía disponible'}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenProfileDialog(true)}
                  fullWidth
                >
                  Editar Perfil
                </Button>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle2" gutterBottom>Información de Contacto</Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  <strong>Email:</strong> {profile?.email || 'No disponible'}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  <strong>Precio por minuto:</strong> {profile?.pricePerMinute ? formatCurrency(profile.pricePerMinute) : 'No definido'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Idiomas:</strong> {profile?.languages?.join(', ') || 'No especificado'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Disponibilidad" />
              <Tab label="Estadísticas" />
              <Tab label="Mensajes" />
            </Tabs>
            
            <CardContent>
              {activeTab === 0 && (
                <Box>
                  <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenAddSlotDialog(true)}
                    >
                      Agregar Horario
                    </Button>
                  </Box>
                  
                  {availabilitySlots.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <ScheduleIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No hay horarios disponibles
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Agrega horarios de disponibilidad para que los usuarios puedan agendar sesiones contigo.
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {availabilitySlots.map((slot) => (
                        <Grid item xs={12} sm={6} md={4} key={slot.id}>
                          <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
                            <Typography variant="subtitle2">
                              {formatDate(slot.startTime)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </Typography>
                            <Box position="absolute" top={8} right={8}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteAvailabilitySlot(slot.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            {slot.isBooked && (
                              <Chip 
                                label="Reservado" 
                                size="small" 
                                color="success" 
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}
              
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Estadísticas de Sesiones
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Aquí puedes ver las estadísticas de tus sesiones y rendimiento.
                  </Typography>
                  {/* Add charts or more detailed stats here */}
                </Box>
              )}
              
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Mensajes
                  </Typography>
                  <Typography variant="body1" paragraph>
                    No tienes mensajes nuevos.
                  </Typography>
                  {/* Add messages list here */}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={openProfileDialog} 
        onClose={() => setOpenProfileDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Nombre para mostrar"
              name="displayName"
              value={editingProfile?.displayName || ''}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Biografía"
              name="bio"
              value={editingProfile?.bio || ''}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />
            
            <TextField
              fullWidth
              type="number"
              label="Precio por minuto (USD)"
              name="pricePerMinute"
              value={editingProfile?.pricePerMinute || ''}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: '$',
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProfileDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleUpdateProfile} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Slot Dialog */}
      <Dialog 
        open={openAddSlotDialog} 
        onClose={() => setOpenAddSlotDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Horario Disponible</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Hora de inicio"
              type="datetime-local"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
              margin="normal"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <TextField
              fullWidth
              label="Hora de fin"
              type="datetime-local"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
              margin="normal"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddSlotDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleAddAvailabilitySlot} 
            variant="contained" 
            color="primary"
            disabled={loading || !newSlot.startTime || !newSlot.endTime}
          >
            {loading ? <CircularProgress size={24} /> : 'Agregar Horario'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
      >
        <Alert onClose={handleCloseSuccess} severity="success">
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ModelDashboard;
