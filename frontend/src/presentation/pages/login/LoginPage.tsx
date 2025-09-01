import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Link as MuiLink, 
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLoginForm } from '../../hooks/useLoginForm';

// Estilos personalizados
const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  margin: '0 auto',
}));

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(3),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  height: 48,
}));

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    handleSubmit,
  } = useLoginForm();

  const handleRegisterClick = () => {
    navigate('/register', { state: { from: location.state?.from } });
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper elevation={3}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Iniciar sesión
        </Typography>
        
        {error && (
          <Box mt={2} width="100%">
            <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
          </Box>
        )}
        
        <StyledForm onSubmit={handleSubmit} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
          
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Iniciar sesión'
            )}
          </SubmitButton>
          
          <Grid container justifyContent="center">
            <Grid item>
              <MuiLink 
                component="button" 
                type="button" 
                variant="body2"
                onClick={handleRegisterClick}
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                ¿No tienes una cuenta? Regístrate
              </MuiLink>
            </Grid>
          </Grid>
        </StyledForm>
      </StyledPaper>
      
      <Box mt={5} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()} Love Rose. Todos los derechos reservados.
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;
