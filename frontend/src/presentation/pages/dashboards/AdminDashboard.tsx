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
  Switch,
  FormControlLabel,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Badge,
  Tooltip,
  LinearProgress,
  Alert,
  Fab
} from '@mui/material';
import {
  People,
  Psychology,
  Science,
  AttachMoney,
  TrendingUp,
  Edit,
  Block,
  CheckCircle,
  Assessment,
  Dashboard,
  Group,
  ContentPaste,
  Settings,
  Notifications,
  Security,
  BarChart,
  Add,
  Search,
  FilterList,
  GetApp,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Warning,
  CheckCircleOutline,
  ErrorOutline
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

interface AdminDashboardStats {
  totalUsers: number;
  totalModels: number;
  totalStudies: number;
  activeConnections: number;
  monthlyRevenue: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    user: string;
    timestamp: string;
  }>;
  pendingReports: number;
  systemHealth: number;
  contentModerationQueue: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  lastActivity?: string;
  avatar?: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: <Dashboard /> },
    { id: 'users', label: 'Gestión de Usuarios', icon: <Group /> },
    { id: 'content', label: 'Moderación de Contenido', icon: <ContentPaste /> },
    { id: 'reports', label: 'Reportes y Análisis', icon: <BarChart /> },
    { id: 'security', label: 'Seguridad', icon: <Security /> },
    { id: 'notifications', label: 'Notificaciones', icon: <Notifications /> },
    { id: 'settings', label: 'Configuración', icon: <Settings /> }
  ];

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Expected array but got:', typeof data, data);
        setUsers([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/assign-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: newRole
        })
      });

      if (response.ok) {
        await fetchUsers();
        setOpenRoleDialog(false);
        setSelectedUser(null);
        setNewRole('');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SuperAdmin': return 'error';
      case 'Admin': return 'primary';
      case 'Model': return 'secondary';
      case 'Study': return 'success';
      default: return 'default';
    }
  };

  const getSystemHealthColor = (health: number) => {
    if (health >= 90) return 'success';
    if (health >= 70) return 'warning';
    return 'error';
  };

  const filteredUsers = users.filter(userData => {
    const matchesSearch = userData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${userData.firstName} ${userData.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactiveUsers || userData.isActive;
    return matchesSearch && matchesStatus;
  });

  const renderDashboardContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Box>
            {/* System Health Alert */}
            {stats && stats.systemHealth < 90 && (
              <Alert 
                severity={stats.systemHealth < 70 ? 'error' : 'warning'} 
                sx={{ mb: 3 }}
                icon={<Warning />}
              >
                Estado del sistema: {stats.systemHealth}% - Se requiere atención
              </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {stats?.totalUsers || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Total Usuarios
                        </Typography>
                      </Box>
                      <People sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {stats?.totalModels || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Modelos Activos
                        </Typography>
                      </Box>
                      <Psychology sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {stats?.totalStudies || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Estudios Activos
                        </Typography>
                      </Box>
                      <Science sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {formatCurrency(stats?.monthlyRevenue || 0)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Ingresos Mensuales
                        </Typography>
                      </Box>
                      <AttachMoney sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Activity Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                      <TrendingUp color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Conexiones Activas</Typography>
                    </Box>
                    <Typography variant="h2" color="primary" sx={{ mb: 1 }}>
                      {stats?.activeConnections || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Usuarios conectados ahora
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                      <Warning color="warning" sx={{ mr: 1 }} />
                      <Typography variant="h6">Reportes Pendientes</Typography>
                    </Box>
                    <Typography variant="h2" color="warning.main" sx={{ mb: 1 }}>
                      {stats?.pendingReports || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Requieren revisión
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                      <Assessment color="info" sx={{ mr: 1 }} />
                      <Typography variant="h6">Estado del Sistema</Typography>
                    </Box>
                    <Typography variant="h2" color={getSystemHealthColor(stats?.systemHealth || 0)} sx={{ mb: 1 }}>
                      {stats?.systemHealth || 0}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats?.systemHealth || 0}
                      color={getSystemHealthColor(stats?.systemHealth || 0)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Transactions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assessment sx={{ mr: 1 }} />
                  Transacciones Recientes
                </Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {stats?.recentTransactions.map((transaction) => (
                    <Box 
                      key={transaction.id} 
                      sx={{ 
                        mb: 1, 
                        p: 2, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {transaction.user}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {transaction.type} • {transaction.timestamp}
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="primary">
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case 'users':
        return (
          <Box>
            {/* User Management Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Gestión de Usuarios
              </Typography>
              <Box display="flex" gap={2}>
                <TextField
                  size="small"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showInactiveUsers}
                      onChange={(e) => setShowInactiveUsers(e.target.checked)}
                    />
                  }
                  label="Mostrar inactivos"
                />
                <Button variant="contained" startIcon={<GetApp />}>
                  Exportar
                </Button>
              </Box>
            </Box>

            {/* Users Table */}
            <Card>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Roles</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Última Actividad</TableCell>
                      <TableCell>Fecha Registro</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((userData) => (
                      <TableRow key={userData.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar 
                              src={userData.avatar} 
                              sx={{ mr: 2, width: 40, height: 40 }}
                            >
                              {userData.firstName[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {`${userData.firstName} ${userData.lastName}`}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {userData.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {userData.roles.map((role) => (
                              <Chip 
                                key={role} 
                                label={role} 
                                size="small" 
                                color={getRoleColor(role)}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={userData.isActive ? <CheckCircleOutline /> : <ErrorOutline />}
                            label={userData.isActive ? 'Activo' : 'Inactivo'}
                            color={userData.isActive ? 'success' : 'error'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {userData.lastActivity ? 
                              new Date(userData.lastActivity).toLocaleDateString('es-ES') : 
                              'Nunca'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(userData.createdAt).toLocaleDateString('es-ES')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center" gap={1}>
                            <Tooltip title="Editar roles">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedUser(userData);
                                  setOpenRoleDialog(true);
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={userData.isActive ? 'Desactivar' : 'Activar'}>
                              <IconButton
                                size="small"
                                color={userData.isActive ? 'error' : 'success'}
                                onClick={() => handleToggleUserStatus(userData.id, !userData.isActive)}
                              >
                                {userData.isActive ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        );

      default:
        return (
          <Box display="flex" alignItems="center" justifyContent="center" height="400px">
            <Typography variant="h6" color="textSecondary">
              Sección en desarrollo: {activeSection}
            </Typography>
          </Box>
        );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography>Cargando panel de administración...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'white',
            borderRight: '1px solid',
            borderColor: 'grey.200'
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'grey.200' }}>
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <AdminPanelSettings />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Panel Admin
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user?.firstName} {user?.lastName}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation */}
        <List sx={{ px: 2, py: 1 }}>
          {sidebarItems.map((item) => (
            <ListItem
              key={item.id}
              button
              onClick={() => setActiveSection(item.id)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: activeSection === item.id ? 'primary.main' : 'transparent',
                color: activeSection === item.id ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: activeSection === item.id ? 'primary.dark' : 'grey.100'
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: activeSection === item.id ? 'white' : 'text.secondary',
                minWidth: 40
              }}>
                {item.id === 'reports' && stats?.pendingReports ? (
                  <Badge badgeContent={stats.pendingReports} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: activeSection === item.id ? 600 : 400
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {renderDashboardContent()}
      </Box>

      {/* Assign Role Dialog */}
      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Edit sx={{ mr: 1 }} />
            Asignar Rol de Usuario
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              Usuario seleccionado:
            </Typography>
            <Box display="flex" alignItems="center" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Avatar sx={{ mr: 2 }}>
                {selectedUser?.firstName[0]}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {selectedUser?.firstName} {selectedUser?.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedUser?.email}
                </Typography>
              </Box>
            </Box>
          </Box>
          <TextField
            select
            fullWidth
            label="Nuevo Rol"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="User">Usuario</MenuItem>
            <MenuItem value="Model">Modelo</MenuItem>
            <MenuItem value="Study">Estudio</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenRoleDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAssignRole} 
            variant="contained"
            disabled={!newRole}
          >
            Asignar Rol
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
