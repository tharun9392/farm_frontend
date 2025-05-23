import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import productService from '../../services/productService';
import ProductImage from '../common/ProductImage';

const FarmerPendingProducts = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [error, setError] = useState(null);

  // Expose refresh method to parent components
  useImperativeHandle(ref, () => ({
    refresh: () => {
      console.log('Manually refreshing pending products...');
      setRefreshCounter(prev => prev + 1);
    }
  }));

  useEffect(() => {
    fetchPendingProducts();
    fetchApprovalHistory();
  }, [navigate, refreshCounter]);

  // Filter out any duplicates between the two arrays by product ID
  const filterDuplicateProducts = (pendingList, historyList) => {
    // Create a Set of product IDs from the history list
    const historyIds = new Set(historyList.map(p => p._id));
    
    // Filter the pending list to exclude any products also in the history list
    return pendingList.filter(product => !historyIds.has(product._id));
  };

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      console.log('Fetching pending paddy products (isProcessedRice=false, status=pending)...');
      
      // First try with specific filtered query for paddy products
      const response = await api.get('/products', { 
        params: { 
          status: 'pending', 
          isProcessedRice: false,  // Only fetch raw paddy, not processed rice
          showAll: true,
          _t: timestamp // Cache busting parameter
        } 
      });
      
      console.log('API response for pending paddy products:', response.data);
      
      // Get raw pending products
      let rawPendingProducts = response.data.products || [];
      
      // Log product details for debugging
      if (rawPendingProducts.length > 0) {
        console.log('Found pending paddy products:', rawPendingProducts.length);
        rawPendingProducts.forEach((p, i) => {
          console.log(`Pending product ${i+1}:`, {
            id: p._id,
            name: p.name,
            isProcessedRice: p.isProcessedRice,
            status: p.status,
            farmerID: p.farmer?._id || p.farmer,
            farmerName: p.farmer?.name || 'Unknown',
            imageCount: p.images?.length || 0,
            images: p.images
          });
        });
      } else {
        console.log('No pending paddy products found, trying second approach without isProcessedRice filter...');
        
        // If no products found, try again with just status filter
        const fallbackResponse = await api.get('/products', { 
          params: { 
            status: 'pending', 
            showAll: true,
            _t: timestamp + 1 // Different timestamp to avoid caching
          } 
        });
        
        console.log('Fallback API response for all pending products:', fallbackResponse.data);
        
        // Filter manually in case server-side filter isn't working
        rawPendingProducts = (fallbackResponse.data.products || []).filter(p => 
          p.isProcessedRice === false && p.status === 'pending'
        );
        
        console.log('Manually filtered paddy products:', rawPendingProducts.length);
      }
      
      // We'll filter these against the approval history in the useEffect below
      setPendingProducts(rawPendingProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending products:', error);
      setError('Failed to load pending products: ' + (error.response?.data?.message || error.message));
      toast.error('Failed to load pending products');
      setLoading(false);
    }
  };

  const fetchApprovalHistory = async () => {
    try {
      setHistoryLoading(true);
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      // Fetch products that were recently approved or rejected
      const response = await api.get('/products', { 
        params: { 
          status: ['approved', 'rejected'].join(','),
          showAll: true,
          limit: 10,
          sortBy: 'updatedAt:desc',
          _t: timestamp // Cache busting parameter
        } 
      });
      setApprovalHistory(response.data.products || []);
      setHistoryLoading(false);
    } catch (error) {
      console.error('Error fetching approval history:', error);
      setHistoryLoading(false);
    }
  };

  // Apply deduplication after both datasets are loaded
  useEffect(() => {
    // If both datasets are loaded, filter out any duplicates
    if (!loading && !historyLoading) {
      // Ensure no product appears in both lists
      setPendingProducts(prev => filterDuplicateProducts(prev, approvalHistory));
    }
  }, [loading, historyLoading, approvalHistory]);

  const handleApprove = (product) => {
    // Store the product ID in sessionStorage so we can check it on return
    sessionStorage.setItem('approvedProductId', product._id);
    
    // Redirect to inventory purchase page with pre-filled form data
    navigate(`/admin/inventory/purchase?productId=${product._id}&farmerId=${product.farmer._id}`, {
      state: { from: 'farmers' }
    });
  };

  // Check for recently approved products when component mounts or is refreshed
  useEffect(() => {
    const approvedProductId = sessionStorage.getItem('approvedProductId');
    if (approvedProductId) {
      console.log('Found recently approved product:', approvedProductId);
      // Clear from session storage
      sessionStorage.removeItem('approvedProductId');
      
      // Update local state if we find this product in our pending list
      const approvedProduct = pendingProducts.find(p => p._id === approvedProductId);
      if (approvedProduct) {
        console.log('Updating local state for approved product');
        // Remove from pending list immediately (will also be filtered by deduplication)
        setPendingProducts(prevProducts => 
          prevProducts.filter(p => p._id !== approvedProductId)
        );
        
        // Add to approval history with updated status
        const updatedProduct = {
          ...approvedProduct,
          status: 'approved',
          updatedAt: new Date().toISOString()
        };
        
        // Update approval history
        setApprovalHistory(prevHistory => {
          // Check if product already exists in history
          const exists = prevHistory.some(p => p._id === approvedProductId);
          if (exists) {
            return prevHistory; // Don't add duplicate
          }
          return [updatedProduct, ...prevHistory.slice(0, 9)]; // Keep history to 10 items
        });
      }
    }
  }, [pendingProducts, refreshCounter]);

  const handleReject = async (productId) => {
    if (window.confirm('Are you sure you want to reject this product?')) {
      try {
        // Find the product before removing it
        const rejectedProduct = pendingProducts.find(p => p._id === productId);
        
        if (!rejectedProduct) {
          toast.error('Product not found');
          return;
        }
        
        // Use the productService for proper status updates
        await productService.updateProductStatus(
          productId, 
          'rejected', 
          'Product rejected by admin'
        );
        
        // Update local state immediately
        // Remove from pending list
        setPendingProducts(prevProducts => 
          prevProducts.filter(p => p._id !== productId)
        );
        
        // Add to approval history with updated status
        const updatedProduct = {
          ...rejectedProduct,
          status: 'rejected',
          updatedAt: new Date().toISOString()
        };
        
        // Update approval history, avoiding duplicates
        setApprovalHistory(prevHistory => {
          // Check if product already exists in history
          const exists = prevHistory.some(p => p._id === productId);
          if (exists) {
            return prevHistory; // Don't add duplicate
          }
          return [updatedProduct, ...prevHistory.slice(0, 9)]; // Keep history to 10 items
        });
        
        toast.success('Product rejected successfully');
      } catch (error) {
        console.error('Error rejecting product:', error);
        toast.error('Failed to reject product');
      }
    }
  };

  return (
    <div>
      {/* Pending Products Section */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Pending Products</h3>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve new products added by farmers
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : pendingProducts.length === 0 ? (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending products</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no pending products for approval
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {pendingProducts.map((product) => (
              <li key={product._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <ProductImage 
                        src={product.images?.[0]} 
                        alt={product.name} 
                        className="h-full w-full object-cover object-center" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-lg font-medium text-primary-600 truncate">{product.name}</p>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.description.length > 100 
                          ? product.description.substring(0, 100) + '...' 
                          : product.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Type:</span> {product.riceType || product.category}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Quantity:</span> {product.stockQuantity || product.availableQuantity} {product.unit}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Price:</span> ₹{product.price}/{product.unit}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Farmer:</span> {product.farmer?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 space-x-2 mt-4 sm:mt-0 sm:ml-4">
                    <button
                      onClick={() => handleApprove(product)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Approve & Purchase
                    </button>
                    <button
                      onClick={() => handleReject(product._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Approval History Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Product Approvals</h3>
          <p className="mt-1 text-sm text-gray-500">
            History of recently approved or rejected products
          </p>
        </div>
        
        {historyLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : approvalHistory.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-sm font-medium text-gray-900">No recent approval history</h3>
            <p className="mt-1 text-sm text-gray-500">
              There is no product approval history yet
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {approvalHistory.map((product) => (
              <li key={product._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <ProductImage 
                        src={product.images?.[0]} 
                        alt={product.name} 
                        className="h-full w-full object-cover object-center" 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        Farmer: {product.farmer?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

export default FarmerPendingProducts; 