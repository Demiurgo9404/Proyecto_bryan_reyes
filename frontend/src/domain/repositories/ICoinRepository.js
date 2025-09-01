import CoinPackage from '../entities/CoinPackage';

/**
 * Interface for the Coin Repository
 * Defines the contract for coin-related data access operations
 */
class ICoinRepository {
  /**
   * Get all available coin packages
   * @returns {Promise<CoinPackage[]>} Array of coin packages
   */
  async getAllPackages() {
    throw new Error('Method not implemented');
  }

  /**
   * Get a specific coin package by ID
   * @param {string} packageId - The ID of the package to retrieve
   * @returns {Promise<CoinPackage>} The requested coin package
   */
  async getPackageById(packageId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get the current user's coin balance
   * @returns {Promise<number>} The user's current coin balance
   */
  async getMyBalance() {
    throw new Error('Method not implemented');
  }

  /**
   * Purchase a coin package
   * @param {string} packageId - The ID of the package to purchase
   * @param {string} paymentMethod - The payment method to use (e.g., 'stripe')
   * @returns {Promise<Object>} Result of the purchase operation
   */
  async purchasePackage(packageId, paymentMethod) {
    throw new Error('Method not implemented');
  }

  /**
   * Get the transaction history for the current user
   * @param {Object} filters - Filtering options
   * @param {number} [filters.page=1] - Page number for pagination
   * @param {number} [filters.limit=10] - Number of items per page
   * @param {string} [filters.type] - Filter by transaction type ('credit' or 'debit')
   * @param {string} [filters.status] - Filter by transaction status
   * @param {string} [filters.search] - Search term for transaction descriptions
   * @returns {Promise<{transactions: Array, totalCount: number}>} Paginated transaction history
   */
  async getMyTransactions({ page = 1, limit = 10, type, status, search } = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Get a specific transaction by ID
   * @param {string} transactionId - The ID of the transaction to retrieve
   * @returns {Promise<Object>} The requested transaction
   */
  async getTransactionById(transactionId) {
    throw new Error('Method not implemented');
  }
}

export default ICoinRepository;
