import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Chip,
  Avatar,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Security,
  Lock,
  Shield,
  Block,
  Key,
  Fingerprint,
  Delete,
  Add,
  Close,
  Download,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  sessionTimeout: number;
  loginHistory: Array<{
    id: string;
    device: string;
    location: string;
    timestamp: string;
    isSuccessful: boolean;
  }>;
}

interface PrivacySettings {
  accountPrivacy: 'public' | 'private' | 'friends';
  profileVisibility: 'everyone' | 'followers' | 'nobody';
  messagePermissions: 'everyone' | 'followers' | 'nobody';
  locationSharing: boolean;
  onlineStatus: boolean;
  readReceipts: boolean;
}

interface BlockedUser {
  id: string;
  username: string;
  profilePicture?: string;
  blockedAt: string;
}

const SecurityPage: React.FC = () => {
  const { user } = useAuth();
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const [securityResponse, privacyResponse, blockedResponse] = await Promise.all([
        fetch('/api/security/settings', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/privacy/settings', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/users/blocked', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const securityData = await securityResponse.json();
      const privacyData = await privacyResponse.json();
      const blockedData = await blockedResponse.json();

      setSecuritySettings(securityData.settings);
      setPrivacySettings(privacyData.settings);
      setBlockedUsers(blockedData.users || []);

      calculateSecurityScore(securityData.settings, privacyData.settings);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSecurityScore = (security: SecuritySettings, privacy: PrivacySettings) => {
    let score = 0;
    if (security.twoFactorEnabled) score += 30;
    if (security.loginNotifications) score += 15;
    if (security.suspiciousActivityAlerts) score += 15;
    if (security.sessionTimeout <= 30) score += 20;
    if (privacy.accountPrivacy !== 'public') score += 20;
    setSecurityScore(Math.min(score, 100));
  };

  const handleUpdateSecuritySettings = async (newSettings: Partial<SecuritySettings>) => {
    try {
      const response = await fetch('/api/security/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        const data = await response.json();
        setSecuritySettings(data.settings);
        calculateSecurityScore(data.settings, privacySettings!);
      }
    } catch (error) {
      console.error('Error updating security settings:', error);
    }
  };

  const handleUpdatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    try {
      const response = await fetch('/api/privacy/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        const data = await response.json();
        setPrivacySettings(data.settings);
        calculateSecurityScore(securitySettings!, data.settings);
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setOpenPasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Contraseña cambiada exitosamente');
      }
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/unblock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setBlockedUsers(prev => prev.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Cargando configuración de seguridad...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Seguridad y Privacidad
        </Typography>
      </Box>

      {/* Security Score */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Puntuación de Seguridad
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Basada en tus configuraciones actuales
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ width: 100 }}>
                <LinearProgress
                  variant="determinate"
                  value={securityScore}
                  color={getSecurityScoreColor(securityScore) as any}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="h4" fontWeight="bold" color={`${getSecurityScoreColor(securityScore)}.main`}>
                {securityScore}%
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Seguridad de Cuenta" />
          <Tab label="Privacidad" />
          <Tab label="Usuarios Bloqueados" />
          <Tab label="Historial de Sesiones" />
        </Tabs>
      </Paper>

      {/* Security Settings */}
      {activeTab === 0 && securitySettings && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  <Security sx={{ mr: 1 }} />
                  Autenticación
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.twoFactorEnabled}
                        onChange={(e) => handleUpdateSecuritySettings({ twoFactorEnabled: e.target.checked })}
                      />
                    }
                    label="Autenticación de dos factores (2FA)"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Añade una capa extra de seguridad a tu cuenta
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<Key />}
                  onClick={() => setOpenPasswordDialog(true)}
                  fullWidth
                >
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  <Shield sx={{ mr: 1 }} />
                  Alertas de Seguridad
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.loginNotifications}
                        onChange={(e) => handleUpdateSecuritySettings({ loginNotifications: e.target.checked })}
                      />
                    }
                    label="Notificaciones de inicio de sesión"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.suspiciousActivityAlerts}
                        onChange={(e) => handleUpdateSecuritySettings({ suspiciousActivityAlerts: e.target.checked })}
                      />
                    }
                    label="Alertas de actividad sospechosa"
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Tiempo de sesión</InputLabel>
                  <Select
                    value={securitySettings.sessionTimeout}
                    label="Tiempo de sesión"
                    onChange={(e) => handleUpdateSecuritySettings({ sessionTimeout: e.target.value as number })}
                  >
                    <MenuItem value={15}>15 minutos</MenuItem>
                    <MenuItem value={30}>30 minutos</MenuItem>
                    <MenuItem value={60}>1 hora</MenuItem>
                    <MenuItem value={120}>2 horas</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Privacy Settings */}
      {activeTab === 1 && privacySettings && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  <Lock sx={{ mr: 1 }} />
                  Visibilidad del Perfil
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Privacidad de la cuenta</InputLabel>
                  <Select
                    value={privacySettings.accountPrivacy}
                    label="Privacidad de la cuenta"
                    onChange={(e) => handleUpdatePrivacySettings({ accountPrivacy: e.target.value as any })}
                  >
                    <MenuItem value="public">Pública</MenuItem>
                    <MenuItem value="private">Privada</MenuItem>
                    <MenuItem value="friends">Solo amigos</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Visibilidad del perfil</InputLabel>
                  <Select
                    value={privacySettings.profileVisibility}
                    label="Visibilidad del perfil"
                    onChange={(e) => handleUpdatePrivacySettings({ profileVisibility: e.target.value as any })}
                  >
                    <MenuItem value="everyone">Todos</MenuItem>
                    <MenuItem value="followers">Solo seguidores</MenuItem>
                    <MenuItem value="nobody">Nadie</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Permisos de mensajes</InputLabel>
                  <Select
                    value={privacySettings.messagePermissions}
                    label="Permisos de mensajes"
                    onChange={(e) => handleUpdatePrivacySettings({ messagePermissions: e.target.value as any })}
                  >
                    <MenuItem value="everyone">Todos</MenuItem>
                    <MenuItem value="followers">Solo seguidores</MenuItem>
                    <MenuItem value="nobody">Nadie</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Configuraciones Adicionales
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacySettings.locationSharing}
                        onChange={(e) => handleUpdatePrivacySettings({ locationSharing: e.target.checked })}
                      />
                    }
                    label="Compartir ubicación"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacySettings.onlineStatus}
                        onChange={(e) => handleUpdatePrivacySettings({ onlineStatus: e.target.checked })}
                      />
                    }
                    label="Mostrar estado en línea"
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacySettings.readReceipts}
                        onChange={(e) => handleUpdatePrivacySettings({ readReceipts: e.target.checked })}
                      />
                    }
                    label="Confirmaciones de lectura"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Blocked Users */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              <Block sx={{ mr: 1 }} />
              Usuarios Bloqueados ({blockedUsers.length})
            </Typography>
            
            {blockedUsers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No has bloqueado a ningún usuario
              </Typography>
            ) : (
              <List>
                {blockedUsers.map((user, index) => (
                  <React.Fragment key={user.id}>
                    <ListItem>
                      <Avatar src={user.profilePicture} sx={{ mr: 2 }}>
                        {user.username[0].toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={`@${user.username}`}
                        secondary={`Bloqueado ${formatDistanceToNow(new Date(user.blockedAt), { addSuffix: true, locale: es })}`}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          onClick={() => handleUnblockUser(user.id)}
                        >
                          Desbloquear
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < blockedUsers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Login History */}
      {activeTab === 3 && securitySettings && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Historial de Inicios de Sesión
            </Typography>
            
            <List>
              {securitySettings.loginHistory.map((login, index) => (
                <React.Fragment key={login.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2">
                            {login.device}
                          </Typography>
                          <Chip
                            label={login.isSuccessful ? 'Exitoso' : 'Fallido'}
                            size="small"
                            color={login.isSuccessful ? 'success' : 'error'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {login.location}
                          </Typography>
                          <Typography variant="caption">
                            {formatDistanceToNow(new Date(login.timestamp), { addSuffix: true, locale: es })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < securitySettings.loginHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Change Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Contraseña actual"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Nueva contraseña"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Confirmar nueva contraseña"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleChangePassword}>
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SecurityPage;
