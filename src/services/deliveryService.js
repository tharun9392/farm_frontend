import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = '/deliveries';

/**
 * Create a new delivery
 * @param {Object} deliveryData - Delivery data
 * @returns {Promise<Object>} Created delivery
 */
const createDelivery = async (deliveryData) => {
  try {
    const response = await axios.post(API_URL, deliveryData);
    toast.success('Delivery scheduled successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to schedule delivery';
    toast.error(message);
    throw error;
  }
};

/**
 * Get all deliveries with filtering and pagination
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Deliveries list with pagination
 */
const getAllDeliveries = async (params = {}) => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch deliveries';
    toast.error(message);
    throw error;
  }
};

/**
 * Get delivery by ID
 * @param {string} id - Delivery ID
 * @returns {Promise<Object>} Delivery details
 */
const getDeliveryById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch delivery details';
    toast.error(message);
    throw error;
  }
};

/**
 * Update delivery status
 * @param {string} id - Delivery ID
 * @param {Object} statusData - Status update data
 * @returns {Promise<Object>} Updated delivery
 */
const updateDeliveryStatus = async (id, statusData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/status`, statusData);
    toast.success(`Delivery status updated to ${statusData.status}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update delivery status';
    toast.error(message);
    throw error;
  }
};

/**
 * Get customer's deliveries
 * @returns {Promise<Object>} Customer's deliveries
 */
const getMyDeliveries = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-deliveries`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch your deliveries';
    toast.error(message);
    throw error;
  }
};

/**
 * Get delivery agent's assignments
 * @returns {Promise<Object>} Assigned deliveries
 */
const getMyAssignments = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-assignments`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch your assignments';
    toast.error(message);
    throw error;
  }
};

const deliveryService = {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  getMyDeliveries,
  getMyAssignments
};

export default deliveryService; 