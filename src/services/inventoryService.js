import { toast } from 'react-toastify';
import api from './api';

// Update the API_URL to use the configured api instance
// const API_URL = '/inventory';

/**
 * Get all inventory items with filtering and pagination
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} List of inventory items
 */
const getAllInventoryItems = async (params = {}) => {
  try {
    const response = await api.get('/inventory', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch inventory items';
    toast.error(message);
    throw error;
  }
};

/**
 * Get inventory item by ID
 * @param {string} id - Inventory item ID
 * @returns {Promise} Inventory item details
 */
const getInventoryById = async (id) => {
  try {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch inventory item';
    toast.error(message);
    throw error;
  }
};

/**
 * Purchase product from farmer to inventory
 * @param {Object} purchaseData - Purchase data
 * @returns {Promise} Created inventory item
 */
const purchaseFromFarmer = async (purchaseData) => {
  try {
    const response = await api.post(`/inventory/purchase`, purchaseData);
    // Don't show toast here since we'll handle it in the component
    return response.data;
  } catch (error) {
    console.error('Error in purchaseFromFarmer:', error);
    // Extract error message from response if available
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      'Failed to record purchase. Please try again.';
    
    // Add formatted message to error object
    error.formattedMessage = errorMessage;
    
    // Don't show toast here since we'll handle it in the component
    throw error;
  }
};

/**
 * Update inventory item
 * @param {string} id - Inventory item ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} Updated inventory item
 */
const updateInventory = async (id, inventoryData) => {
  try {
    const response = await api.put(`/inventory/${id}`, inventoryData);
    toast.success('Inventory updated successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update inventory';
    toast.error(message);
    throw error;
  }
};

/**
 * Get low stock items
 * @returns {Promise} List of low stock items
 */
const getLowStockItems = async () => {
  try {
    const response = await api.get(`/inventory/low-stock`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch low stock items';
    toast.error(message);
    throw error;
  }
};

/**
 * Get inventory metrics
 * @returns {Promise} Inventory metrics
 */
const getInventoryMetrics = async () => {
  try {
    const response = await api.get(`/inventory/metrics`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch inventory metrics';
    toast.error(message);
    throw error;
  }
};

/**
 * Adjust inventory stock
 * @param {string} id - Inventory item ID
 * @param {Object} adjustmentData - Adjustment data
 * @returns {Promise} Adjusted inventory item
 */
const adjustInventoryStock = async (id, adjustmentData) => {
  try {
    const response = await api.post(`/inventory/${id}/adjust`, adjustmentData);
    toast.success('Inventory adjusted successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to adjust inventory';
    toast.error(message);
    throw error;
  }
};

/**
 * Update quality assessment
 * @param {string} id - Inventory item ID
 * @param {Object} assessmentData - Assessment data
 * @returns {Promise} Updated quality assessment
 */
const updateQualityAssessment = async (id, assessmentData) => {
  try {
    const response = await api.post(`/inventory/${id}/quality`, assessmentData);
    toast.success('Quality assessment updated successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update quality assessment';
    toast.error(message);
    throw error;
  }
};

/**
 * Get inventory forecast
 * @param {string} id - Inventory item ID
 * @returns {Promise} Inventory forecast
 */
const getInventoryForecast = async (id) => {
  try {
    const response = await api.get(`/inventory/${id}/forecast`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch forecast data';
    console.error('Error fetching forecast:', errorMessage);
    throw error;
  }
};

/**
 * Run bulk forecasting
 * @returns {Promise} Result of bulk forecasting
 */
const runBulkForecasting = async () => {
  try {
    const response = await api.post(`/inventory/run-forecasting`);
    toast.success('Forecasting completed successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to run forecasting';
    toast.error(message);
    throw error;
  }
};

/**
 * Create a test paddy product for debugging
 * @returns {Promise} Created test paddy product
 */
const createTestPaddyProduct = async () => {
  try {
    // Use the dedicated test endpoint for creating paddy
    const response = await api.post('/products/test/create-paddy');
    return response.data;
  } catch (error) {
    console.error('Error creating test paddy:', error);
    throw error;
  }
};

const inventoryService = {
  getAllInventoryItems,
  getInventoryById,
  purchaseFromFarmer,
  updateInventory,
  getLowStockItems,
  getInventoryMetrics,
  adjustInventoryStock,
  updateQualityAssessment,
  getInventoryForecast,
  runBulkForecasting,
  createTestPaddyProduct
};

export default inventoryService; 