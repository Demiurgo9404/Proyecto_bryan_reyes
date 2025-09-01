import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMyBalance } from '../api/coinService';
import { useAuth } from './AuthContext';

const CoinContext = createContext();

export const CoinProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchBalance = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyBalance();
      setBalance(data.balance || 0);
    } catch (err) {
      console.error('Error fetching coin balance:', err);
      setError('No se pudo cargar el saldo de monedas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [isAuthenticated]);

  const updateBalance = (newBalance) => {
    setBalance(prev => typeof newBalance === 'function' ? newBalance(prev) : newBalance);
  };

  return (
    <CoinContext.Provider value={{ balance, isLoading, error, refreshBalance: fetchBalance, updateBalance }}>
      {children}
    </CoinContext.Provider>
  );
};

export const useCoins = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error('useCoins debe usarse dentro de un CoinProvider');
  }
  return context;
};
