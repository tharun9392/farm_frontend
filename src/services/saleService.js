import api from './api';

/**
 * Get all sales
 * @param {Object} params - Optional query parameters
 * @returns {Promise} - List of sales
 */
const getAllSales = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await api.get(`/sales?${queryParams}`);
  return response.data;
};

/**
 * Get sales by farmer ID
 * @param {string} farmerId - Farmer ID
 * @returns {Promise} - List of farmer's sales
 */
const getSalesByFarmer = async (farmerId) => {
  const response = await api.get(`/sales/farmer/${farmerId}`);
  return response.data;
};

/**
 * Get sale by ID
 * @param {string} saleId - Sale ID
 * @returns {Promise} - Sale data
 */
const getSaleById = async (saleId) => {
  const response = await api.get(`/sales/${saleId}`);
  return response.data;
};

/**
 * Create a new sale
 * @param {Object} saleData - Sale data
 * @returns {Promise} - Created sale
 */
const createSale = async (saleData) => {
  try {
    console.log('Creating sale with data:', saleData);
    const response = await api.post('/sales', saleData);
    return response.data;
  } catch (error) {
    console.error('Error in createSale:', error);
    
    // Get detailed error from response if available
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      'Failed to create sale';
    
    // Create a custom error with the message
    error.message = errorMessage;
    
    throw error;
  }
};

/**
 * Update sale status
 * @param {string} saleId - Sale ID
 * @param {string} status - New status
 * @returns {Promise} - Updated sale
 */
const updateSaleStatus = async (saleId, status) => {
  const response = await api.put(`/sales/${saleId}/status`, { status });
  return response.data;
};

const saleService = {
  getAllSales,
  getSalesByFarmer,
  getSaleById,
  createSale,
  updateSaleStatus
};

export default saleService; 