import React from 'react';
import { useCoins } from '../../contexts/CoinContext';
import styled from '@emotion/styled';
import { FaCoins } from 'react-icons/fa';

const CoinBalanceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 215, 0, 0.1);
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 600;
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.3);
  
  &:hover {
    background-color: rgba(255, 215, 0, 0.2);
    cursor: pointer;
  }
`;

const CoinIcon = styled(FaCoins)`
  color: #ffd700;
`;

const BalanceText = styled.span`
  font-size: 0.9rem;
`;

const CoinBalance = ({ onClick }) => {
  const { balance, isLoading } = useCoins();
  
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <CoinBalanceContainer onClick={onClick}>
      <CoinIcon />
      <BalanceText>{balance.toLocaleString()}</BalanceText>
    </CoinBalanceContainer>
  );
};

export default CoinBalance;
