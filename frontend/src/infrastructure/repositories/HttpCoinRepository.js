import ICoinRepository from '../../domain/repositories/ICoinRepository';
import CoinPackage from '../../domain/entities/CoinPackage';
import Transaction from '../../domain/entities/Transaction';
import { authApi } from '../../api/client';

const COIN_API_BASE = '/coin';

/**
 * HTTP implementation of the ICoinRepository interface
 * Handles all coin-related API calls
 */
class HttpCoinRepository extends ICoinRepository {
  /**
   * Get all available coin packages
   * @returns {Promise<CoinPackage[]>} Array of coin packages
   */
  async getAllPackages() {
    try {
      const response = await authApi.request({
        url: `${COIN_API_BASE}/packages`,
        method: 'GET'
      });
      return response.data.map(pkg => CoinPackage.fromJSON(pkg));
    } catch (error) {
      console.error('Error fetching coin packages:', error);
      throw error;
    }
  }

  /**
   * Get a specific coin package by ID
   * @param {string} packageId - The ID of the package to retrieve
   * @returns {Promise<CoinPackage>} The requested coin package
   */
  async getPackageById(packageId) {
    try {
      const response = await authApi.request({
        url: `${COIN_API_BASE}/packages/${packageId}`,
        method: 'GET'
      });
      return CoinPackage.fromJSON(response.data);
    } catch (error) {
      console.error(`Error fetching coin package ${packageId}:`, error);
      throw error;
    }
  }

  /**
   * Get the current user's coin balance
   * @returns {Promise<number>} The user's current coin balance
   */
  async getMyBalance() {
    try {
      const response = await authApi.request({
        url: `${COIN_API_BASE}/transactions/my-balance`,
        method: 'GET'
      });
      return response.data.balance || 0;
    } catch (error) {
      console.error('Error fetching coin balance:', error);
      throw error;
    }
  }

  /**
   * Purchase a coin package
   * @param {string} packageId - The ID of the package to purchase
   * @param {string} paymentMethod - The payment method to use (e.g., 'stripe')
   * @returns {Promise<Object>} Result of the purchase operation
   */
  async purchasePackage(packageId, paymentMethod = 'stripe') {
    try {
      const response = await authApi.request({
        url: `${COIN_API_BASE}/transactions/purchase`,
        method: 'POST',
        data: {
          packageId,
          paymentMethod
        }
      });
      
      return {
        success: true,
        transaction: response.data.transaction ? 
          Transaction.fromJSON(response.data.transaction) : null,
        paymentIntent: response.data.paymentIntent
      };
    } catch (error) {
      console.error('Error purchasing coin package:', error);
      throw error;
    }
  }

  /**
   * Get the transaction history for the current user
   * @param {Object} filters - Filtering options
   * @param {number} [filters.page=1] - Page number for pagination
   * @param {number} [filters.limit=10] - Number of items per page
   * @param {string} [filters.type] - Filter by transaction type ('credit' or 'debit')
   * @param {string} [filters.status] - Filter by transaction status
   * @param {string} [filters.search] - Search term for transaction descriptions
   * @returns {Promise<{transactions: Array<Transaction>, totalCount: number}>} Paginated transaction history
   */
  async getMyTransactions({ 
    page = 1, 
    limit = 10, 
    type, 
    status, 
    search 
  } = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(type && { type }),
        ...(status && { status }),
        ...(search && { search })
      });

      const response = await authApi.request({
        url: `${COIN_API_BASE}/transactions/my?${params}`,
        method: 'GET'
      });
      
      return {
        transactions: response.data.transactions.map(tx => Transaction.fromJSON(tx)),
        totalCount: response.data.totalCount || 0
      };
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  /**
   * Get a specific transaction by ID
   * @param {string} transactionId - The ID of the transaction to retrieve
   * @returns {Promise<Transaction>} The requested transaction
   */
  async getTransactionById(transactionId) {
    try {
      const response = await authApi.request({
        url: `${COIN_API_BASE}/transactions/${transactionId}`,
        method: 'GET'
      });
      return Transaction.fromJSON(response.data);
    } catch (error) {
      console.error(`Error fetching transaction ${transactionId}:`, error);
      throw error;
    }
  }
}

export default HttpCoinRepository;
