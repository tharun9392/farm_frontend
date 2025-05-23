import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import inventoryService from '../../services/inventoryService';
import productService from '../../services/productService';

const InventoryPurchasePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [sourcePage, setSourcePage] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    farmerId: '',
    quantityPurchased: '',
    purchasePrice: '',
    sellingPrice: '',
    packaging: {
      sizes: [{ weight: 1, price: 0, available: true }],
      defaultSize: 1
    },
    warehouseLocation: 'Main Warehouse',
    lowStockThreshold: 50
  });

  // Get query parameters and source page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('productId');
    const farmerId = params.get('farmerId');
    
    // Store the source page if available in state
    if (location.state?.from) {
      setSourcePage(location.state.from);
    }
    
    if (productId) {
      setFormData(prev => ({ ...prev, productId }));
      // Fetch product details to pre-fill more data
      if (productId) {
        fetchProductDetails(productId);
      }
    }
    
    if (farmerId) {
      setFormData(prev => ({ ...prev, farmerId }));
    }
  }, [location.search, location.state]);

  // Fetch product details to pre-fill form
  const fetchProductDetails = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      const product = response.data.product;
      
      if (product) {
        setFormData(prev => ({
          ...prev,
          quantityPurchased: product.stockQuantity || product.availableQuantity || '',
          purchasePrice: product.farmerPrice || product.price || '',
          sellingPrice: Math.ceil((product.farmerPrice || product.price) * 1.2) || '' // 20% markup
        }));
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  // Fetch products and farmers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        
        // Fetch products with pending status (ready for admin purchase approval)
        const productsResponse = await api.get('/products', { 
          params: { 
            status: 'pending', 
            showAll: true, 
            isProcessedRice: false, // Only fetch raw paddy products, not processed rice
            _t: timestamp 
          } 
        });
        // More detailed logging to debug the issue
        console.log('Products API response:', productsResponse.data);
        console.log('Products array length:', productsResponse.data.products?.length || 0);
        console.log('First few products:', productsResponse.data.products?.slice(0, 2));
        
        setProducts(productsResponse.data.products || []);
        
        // Fetch farmers
        const farmersResponse = await api.get('/users', { 
          params: { _t: timestamp } 
        });
        console.log('Users API response:', farmersResponse.data);
        // Filter only farmers from the response
        const farmersList = farmersResponse.data.data?.filter(user => user.role === 'farmer') || [];
        setFarmers(farmersList);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData({
      ...formData,
      [name]: name === 'quantityPurchased' || name === 'purchasePrice' || name === 'sellingPrice' || name === 'lowStockThreshold'
        ? parseFloat(value) || ''
        : value
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.productId) {
      errors.productId = 'Please select a product';
    }
    
    if (!formData.farmerId) {
      errors.farmerId = 'Please select a farmer';
    }
    
    if (!formData.quantityPurchased || formData.quantityPurchased <= 0) {
      errors.quantityPurchased = 'Please enter a valid quantity';
    }
    
    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      errors.purchasePrice = 'Please enter a valid purchase price';
    }
    
    if (!formData.sellingPrice || formData.sellingPrice <= 0) {
      errors.sellingPrice = 'Please enter a valid selling price';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // If the product came from pending approval (productId in URL), get its details
      const params = new URLSearchParams(location.search);
      const productId = params.get('productId');
      let productName = '';
      
      if (productId) {
        try {
          const productResponse = await api.get(`/products/${productId}`);
          productName = productResponse.data.product?.name || 'Product';
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      }
      
      // If the product came from pending approval, update its status
      if (productId) {
        try {
          // Run both operations concurrently for better performance
          const [purchaseResult, statusResult] = await Promise.all([
            // Purchase operation
            inventoryService.purchaseFromFarmer(formData),
            
            // Status update operation
            productService.updateProductStatus(
              productId, 
              'approved', 
              'Product approved and purchased for inventory'
            )
          ]);
          
          console.log('Purchase completed:', purchaseResult);
          console.log('Status update completed:', statusResult);
          
          toast.success(`${productName} approved and added to inventory successfully!`);
          
          // Note: We're no longer using callbacks for state updates
          // The sessionStorage approach handles this instead
        } catch (error) {
          throw error; // Re-throw to be caught by the outer try-catch
        }
      } else {
        // Just do the purchase without status update
        await inventoryService.purchaseFromFarmer(formData);
        toast.success('Inventory purchase recorded successfully!');
      }
      
      // Navigate back based on source page
      if (sourcePage === 'pending-products') {
        navigate('/admin/pending-products', { 
          state: { refreshPendingProducts: true } 
        });
      } else {
        // Default navigation to farmers page
        navigate('/admin/farmers', { 
          state: { refreshPendingProducts: true } 
        });
      }
    } catch (error) {
      console.error('Error submitting purchase:', error);
      toast.error(error.formattedMessage || 'Failed to record purchase');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total amount when purchase price or quantity changes
  const totalAmount = (formData.purchasePrice && formData.quantityPurchased) 
    ? formData.purchasePrice * formData.quantityPurchased 
    : 0;

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Purchase from Farmers</h1>
          <p className="mt-2 text-sm text-gray-700">
            Record new rice purchases from farmers to add to inventory.
          </p>
          
          <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  {/* Product Selection */}
                  <div>
                    <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
                      Select Product
                    </label>
                    <select
                      id="productId"
                      name="productId"
                      required
                      value={formData.productId}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        validationErrors.productId 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                      }`}
                    >
                      <option value="">-- Select a product --</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} - {product.category} {product.organicCertified ? '(Organic)' : ''} 
                          {product.status === 'pending' ? ' (Pending Approval)' : ''}
                        </option>
                      ))}
                    </select>
                    {validationErrors.productId && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.productId}</p>
                    )}

                    {/* Show message and button to create a test product if none exist */}
                    {products.length === 0 && (
                      <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-700 mb-2">
                          No paddy products found. Farmers need to submit paddy for approval first.
                        </p>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await inventoryService.createTestPaddyProduct();
                              toast.success('Test paddy product created successfully!');
                              // Refresh the products list
                              const timestamp = new Date().getTime();
                              const response = await api.get('/products', { 
                                params: { 
                                  status: 'pending', 
                                  showAll: true, 
                                  isProcessedRice: false,
                                  _t: timestamp 
                                } 
                              });
                              setProducts(response.data.products || []);
                            } catch (error) {
                              toast.error('Failed to create test product');
                            }
                          }}
                          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Create Test Paddy Product
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Farmer Selection */}
                  <div>
                    <label htmlFor="farmerId" className="block text-sm font-medium text-gray-700">
                      Select Farmer
                    </label>
                    <select
                      id="farmerId"
                      name="farmerId"
                      required
                      value={formData.farmerId}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        validationErrors.farmerId 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                      }`}
                    >
                      <option value="">-- Select a farmer --</option>
                      {farmers.map(farmer => (
                        <option key={farmer._id} value={farmer._id}>
                          {farmer.name} ({farmer.email || 'No email'})
                        </option>
                      ))}
                    </select>
                    {validationErrors.farmerId && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.farmerId}</p>
                    )}
                  </div>
                  
                  {/* Quantity */}
                  <div>
                    <label htmlFor="quantityPurchased" className="block text-sm font-medium text-gray-700">
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      name="quantityPurchased"
                      id="quantityPurchased"
                      required
                      min="1"
                      step="0.1"
                      value={formData.quantityPurchased}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        validationErrors.quantityPurchased 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                      }`}
                    />
                    {validationErrors.quantityPurchased && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.quantityPurchased}</p>
                    )}
                  </div>
                  
                  {/* Purchase Price */}
                  <div>
                    <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
                      Purchase Price (₹/kg)
                    </label>
                    <input
                      type="number"
                      name="purchasePrice"
                      id="purchasePrice"
                      required
                      min="1"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        validationErrors.purchasePrice 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                      }`}
                    />
                    {validationErrors.purchasePrice && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.purchasePrice}</p>
                    )}
                  </div>
                  
                  {/* Selling Price */}
                  <div>
                    <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">
                      Selling Price (₹/kg)
                    </label>
                    <input
                      type="number"
                      name="sellingPrice"
                      id="sellingPrice"
                      required
                      min="1"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        validationErrors.sellingPrice 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                      }`}
                    />
                    {validationErrors.sellingPrice && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.sellingPrice}</p>
                    )}
                  </div>
                  
                  {/* Warehouse Location */}
                  <div>
                    <label htmlFor="warehouseLocation" className="block text-sm font-medium text-gray-700">
                      Warehouse Location
                    </label>
                    <input
                      type="text"
                      name="warehouseLocation"
                      id="warehouseLocation"
                      value={formData.warehouseLocation}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* Low Stock Threshold */}
                  <div>
                    <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
                      Low Stock Threshold (kg)
                    </label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      id="lowStockThreshold"
                      min="1"
                      value={formData.lowStockThreshold}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                {/* Total Amount Display */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Purchase Amount:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/inventory')}
                    className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || loading}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : 'Record Purchase'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InventoryPurchasePage; 