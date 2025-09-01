import React from 'react';
import { Container, Grid, Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';

const CoinShopPage = () => {
  const coinPackages = [
    { id: 1, amount: 100, price: 4.99 },
    { id: 2, amount: 250, price: 9.99 },
    { id: 3, amount: 500, price: 19.99, popular: true },
    { id: 4, amount: 1000, price: 34.99 },
  ];

  const handlePurchase = (packageId: number) => {
    console.log('Compra iniciada para el paquete:', packageId);
    // Aquí irá la lógica de compra
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tienda de Monedas
      </Typography>
      <Grid container spacing={3}>
        {coinPackages.map((pkg) => (
          <Grid item key={pkg.id} xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                border: pkg.popular ? '2px solid' : '1px solid rgba(0,0,0,0.12)',
                borderColor: pkg.popular ? 'primary.main' : 'inherit'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {pkg.amount} Monedas
                </Typography>
                <Typography variant="h4" color="primary" sx={{ my: 2 }}>
                  ${pkg.price.toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant={pkg.popular ? "contained" : "outlined"} 
                  color="primary"
                  onClick={() => handlePurchase(pkg.id)}
                >
                  Comprar Ahora
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CoinShopPage;