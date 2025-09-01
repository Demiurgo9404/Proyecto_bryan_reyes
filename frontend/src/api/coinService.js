import api from './client';

const COIN_API_BASE = '/api/coin';

export const getCoinPackages = async () => {
  try {
    const response = await api.get(`${COIN_API_BASE}-packages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching coin packages:', error);
    throw error;
  }
};

export const getMyBalance = async () => {
  try {
    const response = await api.get(`${COIN_API_BASE}-transactions/my-balance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching coin balance:', error);
    throw error;
  }
};

export const getMyTransactions = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get(`${COIN_API_BASE}-transactions/my-transactions`, {
      params: { pageNumber: page, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const purchaseCoins = async (packageId, paymentMethod) => {
  try {
    const response = await api.post(`${COIN_API_BASE}-transactions/purchase`, {
      coinPackageId: packageId,
      paymentMethod: paymentMethod
    });
    return response.data;
  } catch (error) {
    console.error('Error purchasing coins:', error);
    throw error;
  }
};

export const adminGetTransactions = async (filters = {}) => {
  try {
    const response = await api.get(`${COIN_API_BASE}-transactions/admin/transactions`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin transactions:', error);
    throw error;
  }
};

export const adminAdjustCoins = async (userId, amount, reason, addCoins = true) => {
  try {
    const response = await api.post(`${COIN_API_BASE}-transactions/admin/adjust`, {
      userId,
      amount,
      reason,
      addCoins
    });
    return response.data;
  } catch (error) {
    console.error('Error adjusting coins:', error);
    throw error;
  }
};
