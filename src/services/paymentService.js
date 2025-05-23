import axios from 'axios';
import { API_URL } from '../config';
import { authHeader } from './authHeader';

// Create instance with authorization headers
const instance = axios.create({
  baseURL: `${API_URL}/payments`,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth header to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const paymentService = {
  // Create Razorpay order
  createRazorpayOrder: async (orderId) => {
    return instance.post('/razorpay/create', { orderId });
  },

  // Verify Razorpay payment
  verifyRazorpayPayment: async (paymentData) => {
    return instance.post('/razorpay/verify', paymentData);
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    return instance.get(`/${paymentId}`);
  },

  // Get user's payment history
  getMyPayments: async () => {
    return instance.get('/my-payments');
  },

  // Admin - Get all payments
  getAllPayments: async (params) => {
    return instance.get('/', { params });
  },

  // Admin - Process refund
  processRefund: async (paymentId, refundData) => {
    return instance.post(`/${paymentId}/refund`, refundData);
  },

  // Admin/User - Generate invoice
  generateInvoice: async (paymentId) => {
    return instance.post(`/${paymentId}/invoice`);
  },

  // Admin - Get payment analytics
  getPaymentAnalytics: async (dateRange) => {
    return instance.get('/analytics', { params: dateRange });
  },

  // Admin - Create farmer payment
  createFarmerPayment: async (paymentData) => {
    return instance.post('/farmer', paymentData);
  }
};

export default paymentService; 