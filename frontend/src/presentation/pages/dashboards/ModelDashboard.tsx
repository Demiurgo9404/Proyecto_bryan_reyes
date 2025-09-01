import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  AttachMoney,
  Schedule,
  Star,
  Videocam,
  Edit,
  Add,
  Delete,
  TrendingUp,
  Person,
  AccessTime
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface ModelDashboardStats {
  totalEarnings: number;
  thisMonth: number;
  activeConnections: number;
  scheduledSessions: Array<{
    id: string;
    clientName: string;
    dateTime: string;
    duration: number;
    type: string;
  }>;
  ratings: {
    averageRating: number;
    totalRatings: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const ModelDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ModelDashboardStats | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAvailabilityDialog, setOpenAvailabilityDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    bio: '',
    hourlyRate: 0,
    tags: [] as string[]
  });

  useEffect(() => {
    fetchDashboardData();
    fetchProfile();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/model/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/model/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (available: boolean) => {
    try {
      const response = await fetch('/api/model/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isAvailable: available,
          slots: availability
        })
      });

      if (response.ok) {
        setIsAvailable(available);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/model/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        setOpenProfileDialog(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayNumber];
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Panel de Modelo
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Bienvenida, {user?.firstName} - Gestiona tu perfil y sesiones
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={isAvailable}
              onChange={(e) => handleToggleAvailability(e.target.checked)}
              color="success"
            />
          }
          label={isAvailable ? 'Disponible' : 'No Disponible'}
        />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {formatCurrency(stats?.totalEarnings || 0)}
                  </Typography>
                  <Typography color="textSecondary">Ganancias Totales</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {formatCurrency(stats?.thisMonth || 0)}
                  </Typography>
                  <Typography color="textSecondary">Este Mes</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Videocam color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats?.activeConnections || 0}</Typography>
                  <Typography color="textSecondary">Conexiones Activas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Star color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats?.ratings.averageRating || 0}</Typography>
                  <Typography color="textSecondary">
                    Calificación ({stats?.ratings.totalRatings || 0} reseñas)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Profile and Availability */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Mi Perfil
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setOpenProfileDialog(true)}
                >
                  Editar
                </Button>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Nombre:</strong> {profile.displayName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Tarifa por hora:</strong> {formatCurrency(profile.hourlyRate)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {profile.bio}
              </Typography>
              <Box>
                {profile.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Disponibilidad
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setOpenAvailabilityDialog(true)}
                >
                  Configurar
                </Button>
              </Box>
              <List dense>
                {availability.map((slot) => (
                  <ListItem key={slot.id}>
                    <ListItemText
                      primary={getDayName(slot.dayOfWeek)}
                      secondary={`${slot.startTime} - ${slot.endTime}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Scheduled Sessions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
            Sesiones Programadas
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha y Hora</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.scheduledSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.clientName}</TableCell>
                    <TableCell>{new Date(session.dateTime).toLocaleString()}</TableCell>
                    <TableCell>{session.duration} min</TableCell>
                    <TableCell>
                      <Chip label={session.type} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label="Programada" color="primary" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Actividad Reciente
          </Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {stats?.recentActivity.map((activity) => (
              <Box key={activity.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>{activity.type}:</strong> {activity.description}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {activity.timestamp}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Profile Edit Dialog */}
      <Dialog open={openProfileDialog} onClose={() => setOpenProfileDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre de Modelo"
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Biografía"
            multiline
            rows={4}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Tarifa por Hora (USD)"
            type="number"
            value={profile.hourlyRate}
            onChange={(e) => setProfile({ ...profile, hourlyRate: parseFloat(e.target.value) })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Etiquetas (separadas por comas)"
            value={profile.tags.join(', ')}
            onChange={(e) => setProfile({ ...profile, tags: e.target.value.split(', ').filter(tag => tag.trim()) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProfileDialog(false)}>Cancelar</Button>
          <Button onClick={handleUpdateProfile} variant="contained">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Availability Dialog */}
      <Dialog open={openAvailabilityDialog} onClose={() => setOpenAvailabilityDialog(false)}>
        <DialogTitle>Configurar Disponibilidad</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Configura tus horarios de disponibilidad para cada día de la semana.
          </Typography>
          {/* Availability configuration would go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAvailabilityDialog(false)}>Cancelar</Button>
          <Button variant="contained">
            Guardar Horarios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModelDashboard;
