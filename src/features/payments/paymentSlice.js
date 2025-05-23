import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService';

// Create a Razorpay order
export const createRazorpayOrder = createAsyncThunk(
  'payment/createRazorpayOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await paymentService.createRazorpayOrder(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating payment order');
    }
  }
);

// Verify a Razorpay payment
export const verifyRazorpayPayment = createAsyncThunk(
  'payment/verifyRazorpayPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentService.verifyRazorpayPayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error verifying payment');
    }
  }
);

// Get payment details
export const getPaymentById = createAsyncThunk(
  'payment/getPaymentById',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentById(paymentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching payment details');
    }
  }
);

// Get user's payment history
export const getMyPayments = createAsyncThunk(
  'payment/getMyPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getMyPayments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching payment history');
    }
  }
);

// Admin - Get payment analytics
export const getPaymentAnalytics = createAsyncThunk(
  'payment/getAnalytics',
  async (dateRange, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentAnalytics(dateRange);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching payment analytics');
    }
  }
);

// Initial state
const initialState = {
  razorpayOrder: null,
  currentPayment: null,
  paymentHistory: [],
  analytics: null,
  loading: false,
  error: null,
  success: false
};

// Create slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearRazorpayOrder: (state) => {
      state.razorpayOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Razorpay order reducers
      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.razorpayOrder = action.payload.data;
        state.success = true;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Verify Razorpay payment reducers
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload.data;
        state.success = true;
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get payment by ID reducers
      .addCase(getPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload.data;
      })
      .addCase(getPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get my payments reducers
      .addCase(getMyPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload.data;
      })
      .addCase(getMyPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get payment analytics reducers
      .addCase(getPaymentAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload.data;
      })
      .addCase(getPaymentAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetPaymentState, clearRazorpayOrder } = paymentSlice.actions;

export default paymentSlice.reducer; 