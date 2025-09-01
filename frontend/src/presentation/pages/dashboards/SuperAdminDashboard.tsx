import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Home,
  People,
  PersonAdd,
  Settings,
  ExitToApp,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Cancel,
  AdminPanelSettings,
  Dashboard as DashboardIcon,
  TrendingUp,
  Security
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  avatar_url: string;
  is_active: boolean;
  roles: string[];
  created_at: string;
  last_active: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalModels: number;
  activeModels: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

const SuperAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [models, setModels] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('home');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    display_name: '',
    role: 'User'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchModels(),
        fetchSystemStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/models`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setModels(data.models || []);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        await fetchUsers();
        setOpenUserDialog(false);
        setNewUser({ username: '', email: '', display_name: '', role: 'User' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ is_active: !isActive })
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: <Home /> },
    { id: 'users', label: 'Users', icon: <People /> },
    { id: 'models', label: 'Models', icon: <AdminPanelSettings /> },
    { id: 'settings', label: 'Settings', icon: <Settings /> }
  ];

  const renderSidebar = () => (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        bgcolor: '#f8f9fa',
        borderRight: '1px solid #e9ecef',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e9ecef' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#ff5f56', borderRadius: '50%', mr: 1 }} />
          <Box sx={{ width: 12, height: 12, bgcolor: '#ffbd2e', borderRadius: '50%', mr: 1 }} />
          <Box sx={{ width: 12, height: 12, bgcolor: '#27ca3f', borderRadius: '50%' }} />
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, p: 2 }}>
        {sidebarItems.map((item) => (
          <Button
            key={item.id}
            fullWidth
            startIcon={item.icon}
            onClick={() => setSelectedView(item.id)}
            sx={{
              justifyContent: 'flex-start',
              mb: 1,
              py: 1.5,
              px: 2,
              color: selectedView === item.id ? '#000' : '#6c757d',
              bgcolor: selectedView === item.id ? '#fff' : 'transparent',
              fontWeight: selectedView === item.id ? 600 : 400,
              borderRadius: 2,
              boxShadow: selectedView === item.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              '&:hover': {
                bgcolor: selectedView === item.id ? '#fff' : '#f1f3f4'
              }
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      {/* Logout */}
      <Box sx={{ p: 2, borderTop: '1px solid #e9ecef' }}>
        <Button
          fullWidth
          startIcon={<ExitToApp />}
          onClick={logout}
          sx={{
            justifyContent: 'flex-start',
            py: 1.5,
            px: 2,
            color: '#6c757d',
            '&:hover': { bgcolor: '#f1f3f4' }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  const renderHomeView = () => (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, color: '#212529' }}>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ color: '#6c5ce7', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Users
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#212529' }}>
                {stats?.totalUsers || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d', mt: 1 }}>
                {stats?.activeUsers || 0} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AdminPanelSettings sx={{ color: '#fd79a8', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Models
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#212529' }}>
                {stats?.totalModels || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d', mt: 1 }}>
                {stats?.activeModels || 0} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ color: '#00b894', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Revenue
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#212529' }}>
                ${stats?.totalRevenue || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d', mt: 1 }}>
                ${stats?.monthlyRevenue || 0} this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ color: '#e17055', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  System Health
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#00b894' }}>
                100%
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d', mt: 1 }}>
                All systems operational
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderUsersView = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
          Users
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setOpenUserDialog(true)}
            sx={{
              bgcolor: '#000',
              color: '#fff',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              '&:hover': { bgcolor: '#333' }
            }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <List sx={{ p: 0 }}>
          {users.map((user, index) => (
            <React.Fragment key={user.id}>
              <ListItem sx={{ py: 3, px: 4 }}>
                <ListItemAvatar>
                  <Avatar
                    src={user.avatar_url}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  >
                    {user.display_name?.charAt(0) || user.username?.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {user.display_name || user.username}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: '#6c757d' }}>
                      {user.email}
                    </Typography>
                  }
                  sx={{ ml: 2 }}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      color={user.is_active ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        fontWeight: 500,
                        borderColor: '#e9ecef',
                        color: '#6c757d',
                        '&:hover': {
                          borderColor: '#000',
                          color: '#000'
                        }
                      }}
                    >
                      Edit
                    </Button>
                    <IconButton
                      onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                      sx={{ color: user.is_active ? '#e74c3c' : '#00b894' }}
                    >
                      {user.is_active ? <Block /> : <CheckCircle />}
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              {index < users.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );

  const renderModelsView = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
          Models
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            sx={{
              bgcolor: '#000',
              color: '#fff',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              '&:hover': { bgcolor: '#333' }
            }}
          >
            Add Model
          </Button>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <List sx={{ p: 0 }}>
          {models.map((model, index) => (
            <React.Fragment key={model.id}>
              <ListItem sx={{ py: 3, px: 4 }}>
                <ListItemAvatar>
                  <Avatar
                    src={model.avatar_url}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  >
                    {model.display_name?.charAt(0) || model.username?.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {model.display_name || model.username}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: '#6c757d' }}>
                      {model.email}
                    </Typography>
                  }
                  sx={{ ml: 2 }}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        fontWeight: 500,
                        borderColor: '#e9ecef',
                        color: '#6c757d',
                        '&:hover': {
                          borderColor: '#000',
                          color: '#000'
                        }
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        fontWeight: 500,
                        borderColor: '#e9ecef',
                        color: '#6c757d',
                        '&:hover': {
                          borderColor: '#e74c3c',
                          color: '#e74c3c'
                        }
                      }}
                    >
                      Reset Password
                    </Button>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              {index < models.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );

  const renderContent = () => {
    switch (selectedView) {
      case 'home':
        return renderHomeView();
      case 'users':
        return renderUsersView();
      case 'models':
        return renderModelsView();
      case 'settings':
        return (
          <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, color: '#212529' }}>
              Settings
            </Typography>
            <Typography variant="body1" sx={{ color: '#6c757d' }}>
              System settings and configuration options will be available here.
            </Typography>
          </Box>
        );
      default:
        return renderHomeView();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#fff' }}>
      {renderSidebar()}
      
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
          {renderContent()}
        </Box>
      </Box>

      {/* Add User Dialog */}
      <Dialog 
        open={openUserDialog} 
        onClose={() => setOpenUserDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
          Add New User
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Display Name"
            value={newUser.display_name}
            onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Model">Model</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="SuperAdmin">SuperAdmin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenUserDialog(false)}
            sx={{ color: '#6c757d' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateUser}
            variant="contained"
            sx={{
              bgcolor: '#000',
              color: '#fff',
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              '&:hover': { bgcolor: '#333' }
            }}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminDashboard;
