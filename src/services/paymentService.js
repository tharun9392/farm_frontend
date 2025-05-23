import api from './api';

const paymentService = {
  // Create Razorpay order
  createRazorpayOrder: async (orderId) => {
    const response = await api.post('/payments/create-order', { orderId });
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  // Get user's payment history
  getMyPayments: async () => {
    const response = await api.get('/payments/my-payments');
    return response.data;
  },

  // Admin - Get all payments
  getAllPayments: async (params) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  // Admin - Process refund
  processRefund: async (paymentId, refundData) => {
    const response = await api.post(`/payments/${paymentId}/refund`, refundData);
    return response.data;
  },

  // Admin/User - Generate invoice
  generateInvoice: async (paymentId) => {
    const response = await api.post(`/payments/${paymentId}/invoice`);
    return response.data;
  },

  // Admin - Get payment analytics
  getPaymentAnalytics: async (dateRange) => {
    const response = await api.get('/payments/analytics', { params: dateRange });
    return response.data;
  },

  // Admin - Create farmer payment
  createFarmerPayment: async (paymentData) => {
    const response = await api.post('/payments/farmer', paymentData);
    return response.data;
  }
};

export default paymentService; 