import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import HttpCoinRepository from '../../infrastructure/repositories/HttpCoinRepository';
import CoinService from '../../application/services/CoinService';

// Create repository and service instances
const coinRepository = new HttpCoinRepository();
const coinService = new CoinService({ coinRepository });

const CoinContext = createContext();

/**
 * Provider component for coin-related state management
 */
export const CoinProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  /**
   * Fetch the current user's coin balance
   */
  const fetchBalance = useCallback(async () => {
    // No intentar obtener balance si no hay token
    const token = localStorage.getItem('token');
    if (!token) {
      setBalance(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const currentBalance = await coinService.getMyBalance();
      setBalance(currentBalance);
    } catch (err) {
      console.error('Error fetching coin balance:', err);
      setError(err.message);
      // Si es error de autenticación, no mostrar error al usuario
      if (err.message.includes('404') || err.message.includes('401') || err.message.includes('403')) {
        setBalance(0);
        setError(null);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Update the balance with a new value or function
   */
  const updateBalance = useCallback((newBalance) => {
    setBalance(prev => (typeof newBalance === 'function' ? newBalance(prev) : newBalance));
  }, []);

  // Fetch balance on mount and when authentication state changes
  useEffect(() => {
    // Solo intentar cargar balance si hay token
    const token = localStorage.getItem('token');
    if (token && isAuthenticated) {
      fetchBalance();
    } else {
      setBalance(0);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchBalance]);

  // Context value
  const contextValue = {
    balance,
    isLoading,
    error,
    refreshBalance: fetchBalance,
    updateBalance,
    coinService // Expose the service for direct use if needed
  };

  return (
    <CoinContext.Provider value={contextValue}>
      {children}
    </CoinContext.Provider>
  );
};

/**
 * Hook to use the coin context
 * @returns {Object} Coin context with balance, loading state, and methods
 */
export const useCoins = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error('useCoins debe usarse dentro de un CoinProvider');
  }
  return context;
};
