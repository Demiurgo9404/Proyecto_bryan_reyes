import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Paper } from '@mui/material';
import { Lock as LockIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Navegar a la página anterior
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 500,
            borderRadius: 2,
          }}
        >
          <LockIcon 
            color="error" 
            sx={{ 
              fontSize: 80, 
              mb: 2,
              opacity: 0.8
            }} 
          />
          
          <Typography component="h1" variant="h3" gutterBottom color="error">
            403 - Acceso Denegado
          </Typography>
          
          <Typography variant="h6" color="textSecondary" paragraph sx={{ mb: 3 }}>
            No tienes permiso para acceder a esta página.
          </Typography>
          
          <Typography variant="body1" color="textSecondary" paragraph>
            El recurso que estás intentando acceder está restringido y no puedes verlo con tu nivel de acceso actual.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ mt: 3, mb: 2, borderRadius: 2, px: 4, py: 1 }}
          >
            Volver atrás
          </Button>
          
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 1 }}
          >
            Ir al inicio
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
