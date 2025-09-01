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
  color: ${({ active }) => (active ? '#6366f1' : '#8c8c9e')};
  text-decoration: none;
  font-weight: 600;
  border-bottom: 3px solid ${({ active }) => (active ? '#6366f1' : 'transparent')};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  margin-bottom: -1px;
  
  &:hover {
    color: #6366f1;
  }
`;

const CoinsPage = () => {
  const location = useLocation();
  const isShopTab = location.pathname.endsWith('/shop') || location.pathname.endsWith('/coins');
  
  return (
    <Container>
      <Tabs>
        <Tab to="/app/coins/shop" active={isShopTab ? 1 : 0}>
          <FaCoins />
          Tienda de Monedas
        </Tab>
        <Tab to="/app/coins/transactions" active={!isShopTab ? 1 : 0}>
          <FaHistory />
          Historial de Transacciones
        </Tab>
      </Tabs>
      
      <Routes>
        <Route path="/" element={<CoinShopPage />} />
        <Route path="/shop" element={<CoinShopPage />} />
        <Route path="/transactions" element={<TransactionHistoryPage />} />
      </Routes>
    </Container>
  );
};

export default CoinsPage;
