import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { getCoinPackages, purchaseCoins } from '../../api/coinService';
import { useCoins } from '../../contexts/CoinContext';
import { FaCoins, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  color: #fff;
  margin-bottom: 2rem;
`;

const PackagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const PackageCard = styled.div`
  background: #1e1e2d;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid #2a2a3c;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  
  ${({ isPopular }) => 
    isPopular && `
      border: 2px solid #ffd700;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: 'MÁS POPULAR';
        position: absolute;
        top: 15px;
        right: -30px;
        background: #ffd700;
        color: #000;
        padding: 3px 30px;
        font-size: 0.8rem;
        font-weight: bold;
        transform: rotate(45deg);
      }
    `}
`;

const PackageName = styled.h2`
  color: #fff;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
`;

const CoinAmount = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 2rem;
  color: #ffd700;
  margin-bottom: 1rem;
`;

const Price = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  margin: 1rem 0;
  
  span {
    font-size: 1rem;
    opacity: 0.8;
  }
`;

const PricePerCoin = styled.div`
  color: #8c8c9e;
  margin-bottom: 1.5rem;
`;

const BuyButton = styled.button`
  background: ${({ isPurchasing }) => (isPurchasing ? '#4CAF50' : '#6366f1')};
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
  margin-top: auto;
  width: 100%;
  justify-content: center;
  
  &:hover {
    background: ${({ isPurchasing }) => (isPurchasing ? '#43a047' : '#4f46e5')};
  }
  
  &:disabled {
    background: #4a4a5a;
    cursor: not-allowed;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  width: 100%;
  
  li {
    padding: 0.5rem 0;
    color: #c9c9d8;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      color: #4CAF50;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #8c8c9e;
`;

const ErrorContainer = styled.div`
  color: #ef4444;
  text-align: center;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
  margin: 1rem 0;
`;

const CoinShopPage = () => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasingPackage, setPurchasingPackage] = useState(null);
  const { refreshBalance } = useCoins();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCoinPackages();
        setPackages(data);
      } catch (err) {
        console.error('Error fetching coin packages:', err);
        setError('No se pudieron cargar los paquetes de monedas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePurchase = async (packageId) => {
    try {
      setPurchasingPackage(packageId);
      
      // Aquí deberías integrar con tu sistema de pago
      // Por ahora simulamos una compra exitosa
      await purchaseCoins(packageId, 'stripe');
      
      // Actualizar el saldo después de la compra
      await refreshBalance();
      
      toast.success('¡Compra realizada con éxito!');
      
      // Redirigir al historial de transacciones
      navigate('/dashboard/transactions');
    } catch (error) {
      console.error('Error purchasing coins:', error);
      toast.error(error.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setPurchasingPackage(null);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Title>Tienda de Monedas</Title>
        <LoadingContainer>Cargando paquetes...</LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Tienda de Monedas</Title>
        <ErrorContainer>{error}</ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Tienda de Monedas</Title>
      
      <PackagesGrid>
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} isPopular={pkg.id === 2}>
            <PackageName>{pkg.name}</PackageName>
            
            <CoinAmount>
              <FaCoins />
              {pkg.coinAmount.toLocaleString()}
            </CoinAmount>
            
            <Price>
              ${pkg.price.toFixed(2)}
              <span>USD</span>
            </Price>
            
            <PricePerCoin>
              ${(pkg.price / pkg.coinAmount).toFixed(4)} por moneda
            </PricePerCoin>
            
            <FeaturesList>
              <li><FaCheck /> Monedas instantáneas</li>
              <li><FaCheck /> Soporte 24/7</li>
              <li><FaCheck /> Sin cargos ocultos</li>
            </FeaturesList>
            
            <BuyButton 
              onClick={() => handlePurchase(pkg.id)}
              disabled={purchasingPackage === pkg.id}
              isPurchasing={purchasingPackage === pkg.id}
            >
              {purchasingPackage === pkg.id ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : (
                <>
                  <FaShoppingCart />
                  Comprar Ahora
                </>
              )}
            </BuyButton>
          </PackageCard>
        ))}
      </PackagesGrid>
    </Container>
  );
};

export default CoinShopPage;
