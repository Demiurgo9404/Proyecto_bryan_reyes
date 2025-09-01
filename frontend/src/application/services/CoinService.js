import CoinPackage from '../../domain/entities/CoinPackage';
import Transaction from '../../domain/entities/Transaction';

/**
 * Service class for handling coin-related business logic
 */
class CoinService {
  /**
   * Create a new CoinService instance
   * @param {Object} dependencies - Dependencies
   * @param {Object} dependencies.coinRepository - The coin repository instance
   */
  constructor({ coinRepository }) {
    this.coinRepository = coinRepository;
  }

  /**
   * Get all available coin packages
   * @returns {Promise<CoinPackage[]>} Array of coin packages
   */
  async getCoinPackages() {
    return this.coinRepository.getAllPackages();
  }

  /**
   * Get a specific coin package by ID
   * @param {string} packageId - The ID of the package to retrieve
   * @returns {Promise<CoinPackage>} The requested coin package
   */
  async getPackageById(packageId) {
    return this.coinRepository.getPackageById(packageId);
  }

  /**
   * Get the current user's coin balance
   * @returns {Promise<number>} The user's current coin balance
   */
  async getMyBalance() {
    return this.coinRepository.getMyBalance();
  }

  /**
   * Purchase a coin package
   * @param {string} packageId - The ID of the package to purchase
   * @param {string} paymentMethod - The payment method to use (e.g., 'stripe')
   * @returns {Promise<Object>} Result of the purchase operation
   */
  async purchasePackage(packageId, paymentMethod = 'stripe') {
    if (!packageId) {
      throw new Error('Package ID is required');
    }

    if (!paymentMethod) {
      throw new Error('Payment method is required');
    }

    // Get package details to validate it exists
    const pkg = await this.coinRepository.getPackageById(packageId);
    
    if (!pkg.isActive) {
      throw new Error('This package is not available for purchase');
    }

    // Process the purchase
    return this.coinRepository.purchasePackage(packageId, paymentMethod);
  }

  /**
   * Get the transaction history for the current user
   * @param {Object} filters - Filtering options
   * @param {number} [filters.page=1] - Page number for pagination
   * @param {number} [filters.limit=10] - Number of items per page
   * @param {string} [filters.type] - Filter by transaction type ('credit' or 'debit')
   * @param {string} [filters.status] - Filter by transaction status
   * @param {string} [filters.search] - Search term for transaction descriptions
   * @returns {Promise<{transactions: Array<Transaction>, totalCount: number, totalPages: number}>} Paginated transaction history
   */
  async getMyTransactions({ 
    page = 1, 
    limit = 10, 
    type, 
    status, 
    search 
  } = {}) {
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    const result = await this.coinRepository.getMyTransactions({
      page,
      limit,
      type,
      status,
      search
    });

    return {
      transactions: result.transactions,
      totalCount: result.totalCount,
      totalPages: Math.ceil(result.totalCount / limit)
    };
  }

  /**
   * Get a specific transaction by ID
   * @param {string} transactionId - The ID of the transaction to retrieve
   * @returns {Promise<Transaction>} The requested transaction
   */
  async getTransactionById(transactionId) {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    return this.coinRepository.getTransactionById(transactionId);
  }

  /**
   * Format a coin amount with the appropriate currency symbol
   * @param {number} amount - The amount to format
   * @param {string} [currency='MXN'] - The currency code (default: 'MXN')
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount, currency = 'MXN') {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}

export default CoinService;
