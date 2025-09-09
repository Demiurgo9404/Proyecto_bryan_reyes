import React, { useState, useEffect, useCallback } from 'react';
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
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useModelService } from '../../hooks/useModelService';

// Interfaces
export interface ModelProfile {
  id: string;
  displayName: string;
  username: string;
  bio: string;
  profileImage: string;
  coverImage: string;
  pricePerMinute: number;
  isOnline: boolean;
  isAvailable: boolean;
  categories: string[];
  hourlyRate: number;
  languages: string[];
  isVerified?: boolean;
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AvailabilitySlot {
  id: string;
  day: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  timezone?: string;
}

interface DashboardStats {
  totalEarnings: number;
  totalSessions: number;
  totalClients: number;
  rating: number;
  activeConnections: number;
  upcomingSessions: number;
  thisMonthEarnings: number;
  scheduledSessions: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    client: string;
  }>;
  ratings: {
    averageRating: number;
    totalRatings: number;
  };
  recentActivity?: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
    timestamp?: string;
  }>;
}

const ModelDashboard: React.FC = () => {
  // Hooks
  const { user } = useAuth();
  const modelService = useModelService();
  
  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<ModelProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<Partial<ModelProfile>>({});
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    totalSessions: 0,
    totalClients: 0,
    rating: 0,
    activeConnections: 0,
    upcomingSessions: 0,
    thisMonthEarnings: 0,
    scheduledSessions: [],
    ratings: {
      averageRating: 0,
      totalRatings: 0
    }
  });
  const [openProfileDialog, setOpenProfileDialog] = useState<boolean>(false);
  const [openNewSlotDialog, setOpenNewSlotDialog] = useState<boolean>(false);
  const [newSlot, setNewSlot] = useState<Omit<AvailabilitySlot, 'id'>>({
    day: 0,
    dayOfWeek: 'Lunes',
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Helper function to get day name
  const getDayName = useCallback((dayIndex: number): string => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayIndex] || '';
  }, []);

  // Format currency
  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value);
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Load profile data
      const profileData = await modelService.getModelProfile(user.id);
      setProfile(profileData);
      
      // Initialize editing profile
      setEditingProfile({
        displayName: profileData.displayName || '',
        bio: profileData.bio || '',
        hourlyRate: profileData.hourlyRate || 0,
        categories: profileData.categories || [],
        languages: profileData.languages || []
      });
      
      // Load availability slots
      const availability = await modelService.getModelAvailability(user.id);
      setAvailabilitySlots(availability);
      
      // Load stats
      const statsData = await modelService.getDashboardStats(user.id);
      setStats(statsData);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, [user?.id, modelService]);

  // Handle delete availability slot
  const handleDeleteAvailabilitySlot = useCallback(async (slotId: string) => {
    if (!user?.id) return;
    
    try {
      await modelService.deleteAvailabilitySlot(user.id, slotId);
      setAvailabilitySlots(prev => prev.filter(slot => slot.id !== slotId));
      setSuccess('Horario eliminado correctamente');
    } catch (err) {
      setError('Error al eliminar el horario');
    }
  }, [user?.id, modelService]);

  // Handle save profile
  const handleSaveProfile = useCallback(async () => {
    if (!user?.id || !editingProfile) return;
    
    try {
      const updatedProfile = await modelService.updateModelProfile(user.id, editingProfile as ModelProfile);
      setProfile(prev => ({
        ...(prev || {}),
        ...updatedProfile
      }));
      setOpenProfileDialog(false);
      setSuccess('Perfil actualizado correctamente');
    } catch (err) {
      setError('Error al actualizar el perfil');
    }
  }, [user?.id, editingProfile, modelService]);

  // Handle add new availability slot
  const handleAddAvailabilitySlot = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const newSlotWithId = {
        ...newSlot,
        id: `temp-${Date.now()}`,
        dayOfWeek: getDayName(newSlot.day)
      };
      
      // Optimistic update
      setAvailabilitySlots(prev => [...prev, newSlotWithId as AvailabilitySlot]);
      setOpenNewSlotDialog(false);
      
      // Reset form
      setNewSlot({
        day: 0,
        dayOfWeek: 'Lunes',
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      // API call
      await modelService.addAvailabilitySlot(user.id, newSlot);
      
      // Refresh data
      loadDashboardData();
      setSuccess('Horario agregado correctamente');
    } catch (err) {
      console.error('Error adding availability slot:', err);
      setError('Error al agregar el horario');
      // Revert optimistic update
      setAvailabilitySlots(prev => prev.filter(slot => !slot.id.startsWith('temp-')));
    }
  }, [user?.id, newSlot, modelService, getDayName, loadDashboardData]);

  // Handle input changes for profile form
  const handleProfileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditingProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Handle input changes for new slot form
  const handleNewSlotChange = useCallback((e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setNewSlot(prev => ({
      ...prev,
      [name]: name === 'day' ? Number(value) : value
    }));
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <div>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </div>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <div>
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </div>
      </Snackbar>

      {/* Profile Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Mi Perfil</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setOpenProfileDialog(true)}
            >
              Editar Perfil
            </Button>
          </Box>
          
          {profile && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">
                  <strong>Nombre:</strong> {profile.displayName}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Usuario:</strong> @{profile.username}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Tarifa por hora:</strong> {formatCurrency(profile.hourlyRate || 0)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">
                  <strong>Estado:</strong> {profile.isOnline ? 'En línea' : 'Desconectado'}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Disponible:</strong> {profile.isAvailable ? 'Sí' : 'No'}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Idiomas:</strong> {profile.languages?.join(', ') || 'No especificado'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <strong>Biografía:</strong>
                </Typography>
                <Typography variant="body1">
                  {profile.bio || 'No hay biografía disponible'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ganancias Totales
              </Typography>
              <Typography variant="h5">
                {formatCurrency(stats.totalEarnings)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {formatCurrency(stats.thisMonthEarnings)} este mes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Sesiones Totales
              </Typography>
              <Typography variant="h5">{stats.totalSessions}</Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.upcomingSessions} próximas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Clientes
              </Typography>
              <Typography variant="h5">{stats.totalClients}</Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.activeConnections} activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Availability Section */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Disponibilidad</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewSlotDialog(true)}
            >
              Agregar Horario
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Día</TableCell>
                  <TableCell>Horario</TableCell>
                  <TableCell>Recurrente</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availabilitySlots.length > 0 ? (
                  availabilitySlots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>{slot.dayOfWeek}</TableCell>
                      <TableCell>{`${slot.startTime} - ${slot.endTime}`}</TableCell>
                      <TableCell>{slot.isRecurring ? 'Sí' : 'No'}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteAvailabilitySlot(slot.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No hay horarios de disponibilidad configurados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={openProfileDialog} onClose={() => setOpenProfileDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre para mostrar"
                name="displayName"
                value={editingProfile.displayName || ''}
                onChange={handleProfileChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Biografía"
                name="bio"
                value={editingProfile.bio || ''}
                onChange={handleProfileChange}
                margin="normal"
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tarifa por hora"
                name="hourlyRate"
                type="number"
                value={editingProfile.hourlyRate || ''}
                onChange={handleProfileChange}
                margin="normal"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Idiomas</InputLabel>
                <Select
                  multiple
                  name="languages"
                  value={editingProfile.languages || []}
                  onChange={(e) =>
                    setEditingProfile(prev => ({
                      ...prev,
                      languages: e.target.value as string[]
                    }))
                  }
                  renderValue={(selected) => (selected as string[]).join(', ')}
                >
                  {['Español', 'Inglés', 'Portugués', 'Francés', 'Italiano', 'Alemán'].map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingProfile.isAvailable || false}
                    onChange={(e) =>
                      setEditingProfile(prev => ({
                        ...prev,
                        isAvailable: e.target.checked
                      }))
                    }
                    name="isAvailable"
                    color="primary"
                  />
                }
                label="Disponible"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProfileDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            color="primary"
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Availability Slot Dialog */}
      <Dialog open={openNewSlotDialog} onClose={() => setOpenNewSlotDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Horario de Disponibilidad</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Día de la semana</InputLabel>
            <Select
              name="day"
              value={newSlot.day}
              onChange={handleNewSlotChange}
              label="Día de la semana"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <MenuItem key={day} value={day}>
                  {getDayName(day)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Hora de inicio"
            type="time"
            name="startTime"
            value={newSlot.startTime}
            onChange={handleNewSlotChange}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Hora de fin"
            type="time"
            name="endTime"
            value={newSlot.endTime}
            onChange={handleNewSlotChange}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newSlot.isRecurring}
                onChange={(e) =>
                  setNewSlot(prev => ({
                    ...prev,
                    isRecurring: e.target.checked
                  }))
                }
                name="isRecurring"
                color="primary"
              />
            }
            label="Horario recurrente"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewSlotDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleAddAvailabilitySlot}
            variant="contained"
            color="primary"
          >
            Agregar Horario
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ModelDashboard;
