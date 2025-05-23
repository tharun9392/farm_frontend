import api from './api';

// Hard-coded default farmer ID for admin products
const DEFAULT_FARMER_ID = '6829c0a3190621ad210c4399';

/**
 * Get all products with optional filtering
 * @param {Object} params - Query parameters for filtering and pagination
 * @returns {Promise} - List of products
 */
const getProducts = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await api.get(`/products?${queryParams}`);
  return response.data;
};

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @returns {Promise} - Product data
 */
const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

/**
 * Get products by farmer ID
 * @param {string} farmerId - Farmer ID
 * @returns {Promise} - List of farmer's products
 */
const getProductsByFarmer = async (farmerId) => {
  const response = await api.get(`/products/farmer/${farmerId}`);
  return response.data;
};

/**
 * Get current user info
 * @returns {Promise} - User data
 */
const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise} - Created product
 */
const createProduct = async (productData) => {
  try {
    console.log('Creating product with data:', productData);
    
    // Validate description meets minimum length requirement
    if (!productData.description || productData.description.trim().length < 10) {
      throw new Error('Description must be at least 10 characters long');
    }
    
    // Prepare a minimal dataset that matches the server's requirements exactly
    const minimalData = {
      name: productData.name?.trim(),
      description: productData.description?.trim(),
      category: productData.category,
      riceType: productData.riceType,
      price: Number(productData.price),
      farmerPrice: Number(productData.price) * 0.8, // Set farmerPrice to 80% of price
      availableQuantity: Number(productData.availableQuantity),
      stockQuantity: Number(productData.availableQuantity),
      unit: productData.unit || 'kg',
      organicCertified: !!productData.organicCertified,
      images: Array.isArray(productData.images) ? productData.images : []
      // These fields will be set by the server:
      // isProcessedRice: true,
      // status: 'approved',
      // farmer: DEFAULT_FARMER_ID
    };
    
    console.log('Sending product data to server:', minimalData);
    
    const response = await api.post('/products', minimalData);
    return response.data;
  } catch (error) {
    console.error('Error in createProduct:', error);
    
    // Get detailed error from response if available
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      'Failed to create product';
    
    // Add error details to the error object
    error.details = errorMessage;
    
    // Additional debugging info for 400 errors
    if (error.response?.status === 400) {
      console.error('Bad Request Error Details:', {
        data: error.response.data,
        message: errorMessage
      });
    }
    
    throw error;
  }
};

/**
 * Update a product
 * @param {string} productId - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise} - Updated product
 */
const updateProduct = async (productId, productData) => {
  const response = await api.put(`/products/${productId}`, productData);
  return response.data;
};

/**
 * Delete a product
 * @param {string} productId - Product ID to delete
 * @returns {Promise} - Deletion result
 */
const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

/**
 * Upload product images
 * @param {FormData} formData - Form data with images
 * @returns {Promise} - Upload result with image URLs
 */
const uploadProductImages = async (formData) => {
  try {
    console.log('Uploading product images');
    const response = await api.post('/upload/product-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Failed to upload images');
    }
    
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in uploadProductImages:', error);
    
    // Add detailed error information
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
    }
    
    throw error;
  }
};

/**
 * Update product status (approve/reject)
 * @param {string} productId - Product ID
 * @param {string} status - New status (pending, approved, rejected)
 * @param {string} reason - Reason for status change (required for rejection)
 * @returns {Promise} - Updated product
 */
const updateProductStatus = async (productId, status, reason = '') => {
  try {
    console.log(`Updating product ${productId} status to ${status}`);
    console.log(`API endpoint: /products/${productId}/status`);
    
    // Payload for status update
    const payload = { status, reason };
    console.log('Status update payload:', payload);
    
    const response = await api.put(`/products/${productId}/status`, payload);
    console.log('Status update response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error updating product status:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

const productService = {
  getProducts,
  getProductById,
  getProductsByFarmer,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  updateProductStatus
};

export default productService; 