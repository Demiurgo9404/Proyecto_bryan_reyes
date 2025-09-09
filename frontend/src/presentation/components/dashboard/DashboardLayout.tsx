import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  InputBase,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Search,
  Notifications,
  Message,
  Add,
  AccountBalanceWallet,
  Person,
  ExitToApp,
  Videocam
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
  transition: 'all 0.2s ease',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(theme.palette.common.white, 0.7),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(0.5),
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
}));

const BalanceChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, #e91e63 0%, #ff6b9d 100%)',
  color: 'white',
  fontWeight: 600,
  '&:hover': {
    background: 'linear-gradient(135deg, #d81b60 0%, #f06292 100%)',
    transform: 'translateY(-1px)',
  },
  transition: 'all 0.2s ease',
  cursor: 'pointer',
}));

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  showLiveButton?: boolean;
  onLiveClick?: () => void;
  onSectionChange?: (section: string) => void;
  userRole?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = "LoveRose",
  showLiveButton = false,
  onLiveClick,
  onSectionChange,
  userRole,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSectionChange = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleLiveClick = () => {
    if (onLiveClick) {
      onLiveClick();
    } else {
      navigate('/live-streaming');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #e91e63 0%, #ff6b9d 100%)',
          boxShadow: '0 4px 20px rgba(233, 30, 99, 0.3)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #fff 30%, #ffcdd2 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {title}
            </Typography>
            {user?.role === 'Model' && (
              <Chip
                label="Modelo"
                size="small"
                sx={{
                  backgroundColor: alpha('#fff', 0.2),
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>

          {/* Search Bar */}
          <SearchContainer sx={{ display: { xs: 'none', md: 'block' } }}>
            <SearchIconWrapper>
              <Search />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Buscar usuarios, contenido..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </SearchContainer>

          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Balance */}
            <BalanceChip
              icon={<AccountBalanceWallet />}
              label="$250"
              onClick={() => navigate('/wallet')}
            />

            {/* Action Buttons */}
            <ActionButtonsContainer>
              {showLiveButton && (
                <IconButton
                  color="inherit"
                  onClick={onLiveClick}
                  sx={{
                    backgroundColor: '#ff1744',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#d50000',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Videocam />
                </IconButton>
              )}
              
              <IconButton
                color="inherit"
                sx={{ '&:hover': { backgroundColor: alpha('#fff', 0.1) } }}
              >
                <Badge badgeContent={4} color="error">
                  <Message />
                </Badge>
              </IconButton>

              <IconButton
                color="inherit"
                sx={{ '&:hover': { backgroundColor: alpha('#fff', 0.1) } }}
              >
                <Badge badgeContent={2} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              <IconButton
                color="inherit"
                sx={{ '&:hover': { backgroundColor: alpha('#fff', 0.1) } }}
              >
                <Add />
              </IconButton>
            </ActionButtonsContainer>

            {/* Profile Avatar */}
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar
                src={user?.avatar || 'https://picsum.photos/200/200?random=1'}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    border: '2px solid rgba(255,255,255,0.6)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              />
            </IconButton>

            {/* Profile Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText>Ver perfil</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToApp fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cerrar sesión</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main">
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
