import React from 'react';
import PropTypes from 'prop-types';
import { useCoins } from '../../contexts/CoinContext';
import styled from '@emotion/styled';
import { FaCoins, FaSyncAlt } from 'react-icons/fa';
import { keyframes } from '@emotion/react';

// Animation for the refresh icon
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

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
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 215, 0, 0.2);
    cursor: pointer;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.1);
  }
  
  ${({ $isLoading }) => $isLoading && `
    opacity: 0.8;
    cursor: wait;
  `}
`;

const CoinIcon = styled(FaCoins)`
  color: #ffd700;
  flex-shrink: 0;
`;

const BalanceText = styled.span`
  font-size: 0.9rem;
  white-space: nowrap;
`;

const RefreshIcon = styled(FaSyncAlt)`
  color: rgba(255, 215, 0, 0.7);
  font-size: 0.8em;
  margin-left: 4px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  
  ${({ $isLoading }) => $isLoading && `
    animation: ${spin} 1s linear infinite;
  `}
`;

const ErrorTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 6px 12px;
  background-color: #ef4444;
  color: white;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1000;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #ef4444 transparent transparent transparent;
  }
`;

const BalanceWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  &:hover ${ErrorTooltip} {
    opacity: 1;
  }
`;

/**
 * Displays the user's coin balance with loading and error states
 */
const CoinBalance = ({ onClick, showRefresh = true, className }) => {
  const { 
    balance, 
    isLoading, 
    error, 
    refreshBalance, 
    updateBalance 
  } = useCoins();
  
  const handleClick = async (e) => {
    if (onClick) {
      onClick(e);
    } else if (showRefresh) {
      // Only refresh if not already loading and no explicit click handler
      if (!isLoading) {
        try {
          await refreshBalance();
        } catch (err) {
          console.error('Error refreshing balance:', err);
        }
      }
    }
  };

  return (
    <BalanceWrapper>
      <CoinBalanceContainer 
        onClick={handleClick}
        $isLoading={isLoading}
        className={className}
        aria-busy={isLoading}
        aria-live="polite"
      >
        <CoinIcon />
        <BalanceText>
          {isLoading ? 'Cargando...' : balance.toLocaleString()}
        </BalanceText>
        {showRefresh && (
          <RefreshIcon 
            $isLoading={isLoading}
            aria-label={isLoading ? 'Actualizando...' : 'Actualizar saldo'}
          />
        )}
      </CoinBalanceContainer>
      
      {error && (
        <ErrorTooltip role="alert">
          {error}
        </ErrorTooltip>
      )}
    </BalanceWrapper>
  );
};

CoinBalance.propTypes = {
  /** Click handler for the balance container */
  onClick: PropTypes.func,
  /** Whether to show the refresh icon */
  showRefresh: PropTypes.bool,
  /** Additional CSS class name */
  className: PropTypes.string,
};

export default CoinBalance;
