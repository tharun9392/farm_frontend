import api from './api';
import { toast } from 'react-toastify';

const API_URL = '/orders';

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order
 */
const createOrder = async (orderData) => {
  try {
    // Always generate an orderNumber even if one is provided
    // The server will replace this with a proper one via pre-save middleware
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    orderData.orderNumber = `TEMP-${year}${month}${day}-${random}`;
    console.log('Using orderNumber:', orderData.orderNumber);
    
    const response = await api.post(API_URL, orderData);
    return response.data;
  } catch (error) {
    console.error('Order creation error details:', {
      message: error.response?.data?.message || 'Failed to create order',
      status: error.response?.status,
      data: error.response?.data
    });
    
    const message = error.response?.data?.message || 'Failed to create order';
    toast.error(message);
    throw error;
  }
};

/**
 * Get all orders for the current user
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise<Array>} List of orders
 */
const getUserOrders = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_URL}/my-orders?${queryString}` : `${API_URL}/my-orders`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch orders';
    toast.error(message);
    throw error;
  }
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`${API_URL}/${orderId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch order details';
    toast.error(message);
    throw error;
  }
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Updated order
 */
const cancelOrder = async (orderId, reason) => {
  try {
    const response = await api.put(`${API_URL}/${orderId}/cancel`, { reason });
    toast.success('Order cancelled successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to cancel order';
    toast.error(message);
    throw error;
  }
};

/**
 * Update order payment status
 * @param {string} orderId - Order ID
 * @param {Object} paymentResult - Payment result data
 * @returns {Promise<Object>} Updated order
 */
const updateOrderToPaid = async (orderId, paymentResult) => {
  try {
    const response = await api.put(`${API_URL}/${orderId}/pay`, paymentResult);
    toast.success('Payment updated successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update payment';
    toast.error(message);
    throw error;
  }
};

/**
 * Get order statistics (admin/staff)
 * @param {string} range - Time range (week, month, year)
 * @returns {Promise<Object>} Order statistics
 */
const getOrderStats = async (range = 'week') => {
  try {
    const response = await api.get(`${API_URL}/stats?range=${range}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch order statistics';
    toast.error(message);
    throw error;
  }
};

/**
 * Get all orders (admin/staff)
 * @param {Object} filters - Filter parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Paginated orders
 */
const getAllOrders = async (filters = {}, page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters
    }).toString();
    
    const response = await api.get(`${API_URL}?${queryParams}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch orders';
    toast.error(message);
    throw error;
  }
};

/**
 * Update order status (admin/staff)
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @param {string} note - Status update note
 * @returns {Promise<Object>} Updated order
 */
const updateOrderStatus = async (orderId, status, note = '') => {
  try {
    const response = await api.put(`${API_URL}/${orderId}/status`, { status, note });
    toast.success(`Order status updated to ${status}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update order status';
    toast.error(message);
    throw error;
  }
};

/**
 * Update order tracking information (admin/staff)
 * @param {string} orderId - Order ID
 * @param {Object} trackingInfo - Tracking information
 * @returns {Promise<Object>} Updated order
 */
const updateTracking = async (orderId, trackingInfo) => {
  try {
    const response = await api.put(`${API_URL}/${orderId}/tracking`, trackingInfo);
    toast.success('Tracking information updated');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update tracking information';
    toast.error(message);
    throw error;
  }
};

const orderService = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderToPaid,
  getOrderStats,
  getAllOrders,
  updateOrderStatus,
  updateTracking
};

export default orderService; 