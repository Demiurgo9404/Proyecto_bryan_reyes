import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Science,
  People,
  Assessment,
  CloudDownload,
  Add,
  Edit,
  Delete,
  Visibility,
  GetApp,
  TrendingUp,
  DataUsage
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface StudyDashboardStats {
  activeStudies: number;
  completedStudies: number;
  totalParticipants: number;
  dataCollection: {
    totalDataPoints: number;
    lastCollection: string;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

interface Study {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
  participantCount: number;
  maxParticipants: number;
  dataPoints: number;
}

const StudyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudyDashboardStats | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [newStudy, setNewStudy] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    maxParticipants: 100,
    requiredCriteria: [] as string[]
  });
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    fields: [] as string[],
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    fetchDashboardData();
    fetchStudies();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/study/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchStudies = async () => {
    try {
      const response = await fetch('/api/study/studies', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStudies(data.studies || []);
    } catch (error) {
      console.error('Error fetching studies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudy = async () => {
    try {
      const response = await fetch('/api/study/studies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newStudy)
      });

      if (response.ok) {
        await fetchStudies();
        setOpenCreateDialog(false);
        setNewStudy({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          maxParticipants: 100,
          requiredCriteria: []
        });
      }
    } catch (error) {
      console.error('Error creating study:', error);
    }
  };

  const handleExportData = async () => {
    if (!selectedStudy) return;

    try {
      const response = await fetch(`/api/study/studies/${selectedStudy.id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(exportOptions)
      });

      const data = await response.json();
      if (response.ok && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
        setOpenExportDialog(false);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getProgressPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Panel de Investigación
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Bienvenido, {user?.firstName} - Gestiona tus estudios y datos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Nuevo Estudio
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Science color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats?.activeStudies || 0}</Typography>
                  <Typography color="textSecondary">Estudios Activos</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats?.completedStudies || 0}</Typography>
                  <Typography color="textSecondary">Estudios Completados</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats?.totalParticipants || 0}</Typography>
                  <Typography color="textSecondary">Total Participantes</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DataUsage color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats?.dataCollection.totalDataPoints || 0}</Typography>
                  <Typography color="textSecondary">Puntos de Datos</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Collection Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Estado de Recolección de Datos
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Última recolección: {stats?.dataCollection.lastCollection || 'N/A'}
              </Typography>
              <Typography variant="h3" color="primary">
                {stats?.dataCollection.totalDataPoints || 0}
              </Typography>
              <Typography variant="body2">
                Puntos de datos recolectados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {stats?.recentActivity.map((activity) => (
                  <Box key={activity.id} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
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
        </Grid>
      </Grid>

      {/* Studies Management */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Mis Estudios
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Participantes</TableCell>
                  <TableCell>Progreso</TableCell>
                  <TableCell>Fecha Fin</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studies.map((study) => (
                  <TableRow key={study.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {study.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {study.description.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={study.status}
                        color={getStatusColor(study.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {study.participantCount} / {study.maxParticipants}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={getProgressPercentage(study.participantCount, study.maxParticipants)} 
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {getProgressPercentage(study.participantCount, study.maxParticipants)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(study.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => {/* View study */}}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" onClick={() => {/* Edit study */}}>
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedStudy(study);
                          setOpenExportDialog(true);
                        }}
                      >
                        <GetApp />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Study Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nuevo Estudio</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Título del Estudio"
            value={newStudy.title}
            onChange={(e) => setNewStudy({ ...newStudy, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Descripción"
            multiline
            rows={4}
            value={newStudy.description}
            onChange={(e) => setNewStudy({ ...newStudy, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Fecha de Inicio"
                type="date"
                value={newStudy.startDate}
                onChange={(e) => setNewStudy({ ...newStudy, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Fecha de Fin"
                type="date"
                value={newStudy.endDate}
                onChange={(e) => setNewStudy({ ...newStudy, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="Máximo de Participantes"
            type="number"
            value={newStudy.maxParticipants}
            onChange={(e) => setNewStudy({ ...newStudy, maxParticipants: parseInt(e.target.value) })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateStudy} variant="contained">
            Crear Estudio
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle>Exportar Datos del Estudio</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Exportar datos de: {selectedStudy?.title}
          </Typography>
          <TextField
            select
            fullWidth
            label="Formato"
            value={exportOptions.format}
            onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
            <MenuItem value="xlsx">Excel</MenuItem>
          </TextField>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Desde"
                type="date"
                value={exportOptions.fromDate}
                onChange={(e) => setExportOptions({ ...exportOptions, fromDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hasta"
                type="date"
                value={exportOptions.toDate}
                onChange={(e) => setExportOptions({ ...exportOptions, toDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>Cancelar</Button>
          <Button onClick={handleExportData} variant="contained" startIcon={<CloudDownload />}>
            Exportar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudyDashboard;
