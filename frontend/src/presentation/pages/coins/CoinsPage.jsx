import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import CoinShopPage from './CoinShopPage';
import TransactionHistoryPage from './TransactionHistoryPage';
import { FaCoins, FaHistory } from 'react-icons/fa';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 120px);
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #2a2a3c;
  margin-bottom: 2rem;
`;

const Tab = styled(Link)`
  padding: 1rem 2rem;
  text-decoration: none;
  color: ${({ active }) => (active ? '#fff' : '#8c8c9e')};
  font-weight: 600;
  border-bottom: 2px solid ${({ active }) => (active ? '#6366f1' : 'transparent')};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  
  &:hover {
    color: #fff;
    background: rgba(99, 102, 241, 0.1);
  }
`;

const CoinsPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  return (
    <Container>
      <Tabs>
        <Tab 
          to="/dashboard/coins/shop" 
          active={activeTab.includes('shop') ? 'true' : undefined}
          onClick={() => setActiveTab('/dashboard/coins/shop')}
        >
          <FaCoins /> Tienda de Monedas
        </Tab>
        <Tab 
          to="/dashboard/coins/transactions" 
          active={activeTab.includes('transactions') ? 'true' : undefined}
          onClick={() => setActiveTab('/dashboard/coins/transactions')}
        >
          <FaHistory /> Historial de Transacciones
        </Tab>
      </Tabs>
      
      <Routes>
        <Route path="shop" element={<CoinShopPage />} />
        <Route path="transactions" element={<TransactionHistoryPage />} />
        <Route index element={<CoinShopPage />} />
      </Routes>
    </Container>
  );
};

export default CoinsPage;
