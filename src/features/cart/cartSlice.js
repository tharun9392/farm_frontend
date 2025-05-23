import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Get cart from localStorage
const getCartFromStorage = () => {
  try {
    const cartItems = localStorage.getItem('cartItems');
    return cartItems ? JSON.parse(cartItems) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (cartItems) => {
  try {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Calculate cart totals
const calculateTotals = (cartItems) => {
  let itemCount = 0;
  let subtotal = 0;
  
  cartItems.forEach(item => {
    itemCount += item.quantity;
    subtotal += item.price * item.quantity;
  });
  
  // Calculate shipping based on subtotal
  const shipping = subtotal > 0 ? (subtotal < 500 ? 50 : 0) : 0;
  // GST at 5% for food products
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;
  
  return {
    itemCount,
    subtotal,
    shipping,
    tax,
    total
  };
};

// Async thunk to fetch product details when adding to cart
export const addProductToCart = createAsyncThunk(
  'cart/addProductToCart',
  async ({ productId, quantity = 1 }, { getState, rejectWithValue }) => {
    try {
      // First check if the product already exists in cart
      const { cart } = getState();
      const existingItem = cart.items.find(item => item._id === productId);
      
      if (existingItem) {
        return { 
          productId, 
          increment: quantity 
        };
      }
      
      // Fetch product details
      const response = await axios.get(`/api/products/${productId}`);
      const product = response.data;
      
      // If product is not in stock, reject
      if (product.stockQuantity <= 0) {
        toast.error('Product is out of stock');
        return rejectWithValue('Product is out of stock');
      }
      
      return {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        farmer: product.farmer?.farmName || 'Unknown Farm',
        stockQuantity: product.stockQuantity,
        quantity: quantity
      };
    } catch (error) {
      toast.error('Failed to add product to cart');
      return rejectWithValue(error.response?.data || { message: 'Failed to add to cart' });
    }
  }
);

// Initial state
const initialState = {
  items: getCartFromStorage(),
  ...calculateTotals(getCartFromStorage()),
  status: 'idle',
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { _id, name, price, image, farmer, quantity = 1, stockQuantity } = action.payload;
      const existingItem = state.items.find(item => item._id === _id);
      
      if (existingItem) {
        // Don't exceed stock quantity
        const newQuantity = Math.min(existingItem.quantity + quantity, stockQuantity);
        existingItem.quantity = newQuantity;
        toast.success(`Updated ${name} quantity in cart`);
      } else {
        state.items.push({
          _id,
          name,
          price, 
          image,
          farmer,
          quantity,
          stockQuantity
        });
        toast.success(`Added ${name} to cart`);
      }
      
      // Update totals
      const totals = calculateTotals(state.items);
      state.itemCount = totals.itemCount;
      state.subtotal = totals.subtotal;
      state.shipping = totals.shipping;
      state.tax = totals.tax;
      state.total = totals.total;
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    updateQuantity: (state, action) => {
      const { _id, quantity } = action.payload;
      const item = state.items.find(item => item._id === _id);
      
      if (item) {
        // Ensure quantity is within valid range
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter(item => item._id !== _id);
          toast.info(`Removed ${item.name} from cart`);
        } else {
          // Limit quantity to available stock
          item.quantity = Math.min(quantity, item.stockQuantity);
        }
        
        // Update totals
        const totals = calculateTotals(state.items);
        state.itemCount = totals.itemCount;
        state.subtotal = totals.subtotal;
        state.shipping = totals.shipping;
        state.tax = totals.tax;
        state.total = totals.total;
        
        // Save to localStorage
        saveCartToStorage(state.items);
      }
    },
    
    removeFromCart: (state, action) => {
      const _id = action.payload;
      const item = state.items.find(item => item._id === _id);
      
      if (item) {
        state.items = state.items.filter(item => item._id !== _id);
        toast.info(`Removed ${item.name} from cart`);
        
        // Update totals
        const totals = calculateTotals(state.items);
        state.itemCount = totals.itemCount;
        state.subtotal = totals.subtotal;
        state.shipping = totals.shipping;
        state.tax = totals.tax;
        state.total = totals.total;
        
        // Save to localStorage
        saveCartToStorage(state.items);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.itemCount = 0;
      state.subtotal = 0;
      state.shipping = 0;
      state.tax = 0;
      state.total = 0;
      
      // Clear localStorage
      saveCartToStorage([]);
      toast.info('Cart cleared');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProductToCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addProductToCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // If it's an update to existing item
        if (action.payload.increment) {
          const { productId, increment } = action.payload;
          const existingItem = state.items.find(item => item._id === productId);
          
          if (existingItem) {
            // Don't exceed stock quantity
            existingItem.quantity = Math.min(
              existingItem.quantity + increment,
              existingItem.stockQuantity
            );
            
            toast.success(`Updated ${existingItem.name} quantity in cart`);
          }
        } else {
          // It's a new item
          state.items.push(action.payload);
          toast.success(`Added ${action.payload.name} to cart`);
        }
        
        // Update totals
        const totals = calculateTotals(state.items);
        state.itemCount = totals.itemCount;
        state.subtotal = totals.subtotal;
        state.shipping = totals.shipping;
        state.tax = totals.tax;
        state.total = totals.total;
        
        // Save to localStorage
        saveCartToStorage(state.items);
      })
      .addCase(addProductToCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to add product to cart';
      });
  }
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer; 