import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import reducers
import authReducer from '../features/auth/authSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import productReducer from '../features/products/productSlice';
import cartReducer from '../features/cart/cartSlice';
import orderReducer from '../features/orders/orderSlice';
import paymentReducer from '../features/payments/paymentSlice';
// import inventoryReducer from '../features/inventory/inventorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    payments: paymentReducer,
    // inventory: inventoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable listener behavior for RTK-Query
setupListeners(store.dispatch);

export default store; 