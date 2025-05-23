import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for product operations
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters, { rejectWithValue }) => {
    try {
      // Construct query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.categories?.length) {
          filters.categories.forEach(category => {
            queryParams.append('category', category);
          });
        }
        
        if (filters.qualities?.length) {
          filters.qualities.forEach(quality => {
            queryParams.append('quality', quality);
          });
        }
        
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
        if (filters.inStock) queryParams.append('inStock', true);
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.limit) queryParams.append('limit', filters.limit);
        if (filters.search) queryParams.append('search', filters.search);
      }
      
      const response = await axios.get(`/api/products?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch products' });
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch product' });
    }
  }
);

export const fetchProductCategories = createAsyncThunk(
  'products/fetchProductCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/products/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch categories' });
    }
  }
);

export const fetchProductQualities = createAsyncThunk(
  'products/fetchProductQualities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/products/qualities');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch qualities' });
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'products/fetchProductReviews',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/reviews/product/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch reviews' });
    }
  }
);

export const submitProductReview = createAsyncThunk(
  'products/submitProductReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/reviews', reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to submit review' });
    }
  }
);

// For development, use sample data
const sampleProducts = [
  {
    _id: '1',
    name: 'Premium Basmati Rice',
    description: 'Long grain aromatic rice. Perfect for biryanis and pulao dishes.',
    price: 120,
    images: ['/images/products/basmati.jpg'],
    stockQuantity: 200,
    rating: 4.5,
    ratingCount: 28,
    category: 'Basmati',
    quality: 'Premium',
    farmer: {
      _id: 'f1',
      name: 'Ravi Kumar',
      farmName: 'Green Fields Farm'
    }
  },
  {
    _id: '2',
    name: 'Organic Brown Rice',
    description: 'Nutrient-rich brown rice with bran layer intact. High in fiber and minerals.',
    price: 95,
    originalPrice: 110,
    images: ['/images/products/brown-rice.jpg'],
    stockQuantity: 150,
    rating: 4.2,
    ratingCount: 15,
    category: 'Brown Rice',
    quality: 'Organic',
    farmer: {
      _id: 'f2',
      name: 'Sunita Patel',
      farmName: 'Organic Harvest'
    }
  },
  {
    _id: '3',
    name: 'Jasmine Rice',
    description: 'Fragrant jasmine rice, perfect for Thai and Asian cuisines.',
    price: 140,
    images: ['/images/products/jasmine-rice.jpg'],
    stockQuantity: 80,
    rating: 4.7,
    ratingCount: 32,
    category: 'Jasmine',
    quality: 'Premium',
    farmer: {
      _id: 'f3',
      name: 'Mohammad Ali',
      farmName: 'Sunrise Farms'
    }
  },
  {
    _id: '4',
    name: 'Sona Masoori Rice',
    description: 'Medium-grain rice popular in South Indian cuisine. Light and easy to digest.',
    price: 85,
    images: ['/images/products/sona-masoori.jpg'],
    stockQuantity: 250,
    rating: 4.3,
    ratingCount: 45,
    category: 'Sona Masoori',
    quality: 'Standard',
    farmer: {
      _id: 'f4',
      name: 'Lakshmi Devi',
      farmName: 'Golden Harvest'
    }
  },
  {
    _id: '5',
    name: 'Ponni Rice',
    description: 'Traditional South Indian rice variety, ideal for idli and dosa batter.',
    price: 90,
    images: ['/images/products/ponni-rice.jpg'],
    stockQuantity: 120,
    rating: 4.1,
    ratingCount: 19,
    category: 'Ponni',
    quality: 'Premium',
    farmer: {
      _id: 'f5',
      name: 'Venkatesh Rao',
      farmName: 'Heritage Rice Fields'
    }
  },
  {
    _id: '6',
    name: 'Red Rice',
    description: 'Nutritious red rice with high antioxidant content. Great for health-conscious consumers.',
    price: 110,
    originalPrice: 130,
    images: ['/images/products/red-rice.jpg'],
    stockQuantity: 0, // Out of stock
    rating: 4.8,
    ratingCount: 12,
    category: 'Red Rice',
    quality: 'Organic',
    farmer: {
      _id: 'f2',
      name: 'Sunita Patel',
      farmName: 'Organic Harvest'
    }
  }
];

// Sample categories and qualities
const sampleCategories = ['Basmati', 'Brown Rice', 'Jasmine', 'Sona Masoori', 'Ponni', 'Red Rice'];
const sampleQualities = ['Premium', 'Standard', 'Organic', 'Export Quality'];

const initialState = {
  products: [],
  product: null,
  categories: [],
  qualities: [],
  reviews: [],
  filteredCount: 0,
  totalCount: 0,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  recentlyViewed: [],
  isUsingDummyData: true, // For development
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addToRecentlyViewed: (state, action) => {
      const productId = action.payload;
      // Remove if exists and add to front
      state.recentlyViewed = [
        productId,
        ...state.recentlyViewed.filter(id => id !== productId)
      ].slice(0, 5); // Keep only 5 most recent
    },
    resetProductState: (state) => {
      state.product = null;
      state.reviews = [];
      state.error = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.isUsingDummyData) {
          // For development, use sample data
          state.products = sampleProducts;
          state.filteredCount = sampleProducts.length;
          state.totalCount = sampleProducts.length;
        } else {
          state.products = action.payload.products;
          state.filteredCount = action.payload.filteredCount;
          state.totalCount = action.payload.totalCount;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch products';
        // Fallback to sample data for development
        state.products = sampleProducts;
        state.filteredCount = sampleProducts.length;
        state.totalCount = sampleProducts.length;
      })
      
      // Fetch Product By ID
      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.isUsingDummyData) {
          // For development, use sample data
          state.product = sampleProducts.find(p => p._id === action.meta.arg) || null;
        } else {
          state.product = action.payload;
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch product';
        // Fallback to sample data for development
        state.product = sampleProducts.find(p => p._id === action.meta.arg) || null;
      })
      
      // Fetch Categories
      .addCase(fetchProductCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.isUsingDummyData) {
          state.categories = sampleCategories;
        } else {
          state.categories = action.payload;
        }
      })
      .addCase(fetchProductCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch categories';
        state.categories = sampleCategories; // Fallback
      })
      
      // Fetch Qualities
      .addCase(fetchProductQualities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductQualities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.isUsingDummyData) {
          state.qualities = sampleQualities;
        } else {
          state.qualities = action.payload;
        }
      })
      .addCase(fetchProductQualities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch qualities';
        state.qualities = sampleQualities; // Fallback
      })
      
      // Fetch Product Reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reviews = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch reviews';
        state.reviews = []; // Empty array if failed
      })
      
      // Submit Product Review
      .addCase(submitProductReview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(submitProductReview.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reviews = [action.payload, ...state.reviews];
        // Update product rating if available
        if (state.product && action.payload.product === state.product._id) {
          const totalRating = state.product.rating * state.product.ratingCount;
          const newCount = state.product.ratingCount + 1;
          const newRating = (totalRating + action.payload.rating) / newCount;
          
          state.product.rating = newRating;
          state.product.ratingCount = newCount;
        }
      })
      .addCase(submitProductReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to submit review';
      });
  }
});

export const { addToRecentlyViewed, resetProductState } = productSlice.actions;

export default productSlice.reducer; 