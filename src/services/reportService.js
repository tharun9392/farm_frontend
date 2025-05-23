import api from './api';

// Get dashboard analytics
const getDashboardAnalytics = async () => {
  const response = await api.get('/reports/dashboard');
  return response.data;
};

// Get sales analytics with optional period filter
const getSalesAnalytics = async (period = 'month') => {
  const response = await api.get(`/reports/sales?period=${period}`);
  return response.data;
};

// Get inventory analytics
const getInventoryAnalytics = async () => {
  const response = await api.get('/reports/inventory');
  return response.data;
};

// Get farmer analytics
const getFarmerAnalytics = async () => {
  const response = await api.get('/reports/farmers');
  return response.data;
};

const reportService = {
  getDashboardAnalytics,
  getSalesAnalytics,
  getInventoryAnalytics,
  getFarmerAnalytics,
};

export default reportService; 