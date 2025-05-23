import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { clearCart } from '../cart/cartSlice';
import { toast } from 'react-toastify';

// Async thunks for order operations
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post('/api/orders', orderData);
      
      // Clear the cart after successful order
      dispatch(clearCart());
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create order' });
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/orders/my-orders');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch orders' });
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch order details' });
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to cancel order' });
    }
  }
);

// Sample data for development
const sampleOrders = [
  {
    _id: 'ord1',
    orderNumber: 'ORD12345',
    items: [
      {
        product: {
          _id: '1',
          name: 'Premium Basmati Rice',
          images: ['/images/products/basmati.jpg'],
        },
        price: 120,
        quantity: 2,
        subtotal: 240
      },
      {
        product: {
          _id: '3',
          name: 'Jasmine Rice',
          images: ['/images/products/jasmine-rice.jpg'],
        },
        price: 140,
        quantity: 1,
        subtotal: 140
      }
    ],
    shippingAddress: {
      fullName: 'Rajesh Kumar',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      phoneNumber: '+91 9876543210'
    },
    paymentMethod: 'Card',
    paymentResult: {
      id: 'pay_123456',
      status: 'Completed',
      updateTime: '2023-08-15T10:30:00Z'
    },
    itemsPrice: 380,
    taxPrice: 19,
    shippingPrice: 0,
    totalPrice: 399,
    status: 'Delivered',
    isPaid: true,
    paidAt: '2023-08-15T10:35:00Z',
    isDelivered: true,
    deliveredAt: '2023-08-18T14:20:00Z',
    createdAt: '2023-08-15T10:30:00Z',
    updatedAt: '2023-08-18T14:20:00Z'
  },
  {
    _id: 'ord2',
    orderNumber: 'ORD12346',
    items: [
      {
        product: {
          _id: '2',
          name: 'Organic Brown Rice',
          images: ['/images/products/brown-rice.jpg'],
        },
        price: 95,
        quantity: 3,
        subtotal: 285
      }
    ],
    shippingAddress: {
      fullName: 'Rajesh Kumar',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      phoneNumber: '+91 9876543210'
    },
    paymentMethod: 'UPI',
    paymentResult: {
      id: 'pay_123457',
      status: 'Completed',
      updateTime: '2023-08-10T14:30:00Z'
    },
    itemsPrice: 285,
    taxPrice: 14.25,
    shippingPrice: 50,
    totalPrice: 349.25,
    status: 'Processing',
    isPaid: true,
    paidAt: '2023-08-10T14:35:00Z',
    isDelivered: false,
    createdAt: '2023-08-10T14:30:00Z',
    updatedAt: '2023-08-10T14:35:00Z'
  },
  {
    _id: 'ord3',
    orderNumber: 'ORD12347',
    items: [
      {
        product: {
          _id: '4',
          name: 'Sona Masoori Rice',
          images: ['/images/products/sona-masoori.jpg'],
        },
        price: 85,
        quantity: 5,
        subtotal: 425
      },
      {
        product: {
          _id: '5',
          name: 'Ponni Rice',
          images: ['/images/products/ponni-rice.jpg'],
        },
        price: 90,
        quantity: 2,
        subtotal: 180
      }
    ],
    shippingAddress: {
      fullName: 'Rajesh Kumar',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      phoneNumber: '+91 9876543210'
    },
    paymentMethod: 'Cash on Delivery',
    itemsPrice: 605,
    taxPrice: 30.25,
    shippingPrice: 0,
    totalPrice: 635.25,
    status: 'Shipped',
    isPaid: false,
    isDelivered: false,
    createdAt: '2023-08-05T09:15:00Z',
    updatedAt: '2023-08-07T10:20:00Z'
  }
];

const initialState = {
  orders: [],
  order: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  isUsingDummyData: true, // For development
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.order = null;
      state.error = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.order = action.payload;
        state.orders.unshift(action.payload); // Add to start of orders list
        toast.success('Order placed successfully!');
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to create order';
        toast.error(state.error);
      })
      
      // Fetch User Orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        if (state.isUsingDummyData) {
          // For development, use sample data
          state.orders = sampleOrders;
        } else {
          state.orders = action.payload;
        }
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch orders';
        
        if (state.isUsingDummyData) {
          // Fallback to sample data
          state.orders = sampleOrders;
        }
      })
      
      // Fetch Order By ID
      .addCase(fetchOrderById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        if (state.isUsingDummyData) {
          // For development, use sample data
          state.order = sampleOrders.find(order => order._id === action.meta.arg) || null;
        } else {
          state.order = action.payload;
        }
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch order details';
        
        if (state.isUsingDummyData) {
          // Fallback to sample data
          state.order = sampleOrders.find(order => order._id === action.meta.arg) || null;
        }
      })
      
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update order in state
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
        
        // Update order in orders list
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        
        toast.success('Order cancelled successfully');
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to cancel order';
        toast.error(state.error);
      });
  }
});

export const { resetOrderState } = orderSlice.actions;

export default orderSlice.reducer; 