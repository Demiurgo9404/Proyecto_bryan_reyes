import React, { useState, useEffect } from 'react';
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
  CircularProgress 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import authService from '../services/authService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  // Validar formato de correo electrónico
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Manejador de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación de campos
    if (!email || !password) {
      setFormError('Por favor, completa todos los campos');
      return;
    }

    // Validar formato de correo
    if (!validateEmail(email)) {
      setFormError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);
    setFormError('');

    try {
      const response = await authService.login(email, password);
      
      if (response.token) {
        toast.success('¡Inicio de sesión exitoso!');
        // Redirigir al dashboard o a la ruta anterior
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejador para el botón de registro
  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper elevation={3}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Iniciar sesión
        </Typography>
        
        {formError && (
          <Box mt={2} width="100%" p={2} bgcolor="error.light" color="white" borderRadius={1}>
            <Typography variant="body2" align="center">{formError}</Typography>
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
            disabled={isLoading}
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
            disabled={isLoading}
          />
          
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? (
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
                disabled={isLoading}
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
