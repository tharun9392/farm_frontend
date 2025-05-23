import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import productService from '../../services/productService';
import inventoryService from '../../services/inventoryService';
import ProductImage from '../../components/common/ProductImage';

const PendingProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [creatingTest, setCreatingTest] = useState(false);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  useEffect(() => {
    if (location.state?.refreshPendingProducts) {
      console.log('Refreshing pending products after returning from purchase page');
      fetchPendingProducts();
    }
  }, [location]);

  // Check for recently approved products
  useEffect(() => {
    const approvedProductId = sessionStorage.getItem('approvedProductId');
    if (approvedProductId) {
      console.log('Found recently approved product in PendingProductsPage:', approvedProductId);
      // Clear it to prevent duplicate processing
      sessionStorage.removeItem('approvedProductId');
      
      // Remove the approved product from the pending list
      setPendingProducts(prevProducts => 
        prevProducts.filter(p => p._id !== approvedProductId)
      );
    }
  }, [location]); // Re-run this when location changes (like after returning from approve page)

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      console.log('Fetching pending paddy products...');
      
      // First try with specific isProcessedRice=false filter
      const response = await api.get('/products', { 
        params: { 
          status: 'pending', 
          showAll: true,
          isProcessedRice: false, // Only fetch raw paddy products, not processed rice
          _t: timestamp
        } 
      });
      
      console.log('Pending products API response:', response.data);
      
      if (response.data.products && response.data.products.length > 0) {
        console.log('Found pending paddy products:', response.data.products.length);
        console.log('First product details:', {
          id: response.data.products[0]._id,
          name: response.data.products[0].name,
          isProcessedRice: response.data.products[0].isProcessedRice,
          status: response.data.products[0].status,
          farmer: response.data.products[0].farmer,
          images: response.data.products[0].images
        });
        setPendingProducts(response.data.products);
      } else {
        console.log('No pending paddy products found with isProcessedRice=false, trying broader query...');
        
        // Try again with just pending status without isProcessedRice filter
        const retryResponse = await api.get('/products', {
          params: {
            status: 'pending',
            showAll: true,
            _t: timestamp + 1
          }
        });
        
        console.log('Retry response with broader criteria:', retryResponse.data);
        
        if (retryResponse.data.products && retryResponse.data.products.length > 0) {
          console.log('Found products with broader criteria, filtering manually...');
          
          // Filter paddy products manually in case the server filter isn't working correctly
          const paddyProducts = retryResponse.data.products.filter(product => 
            product.isProcessedRice === false || product.status === 'pending'
          );
          
          console.log('Filtered paddy products:', paddyProducts.length);
          paddyProducts.forEach((p, i) => {
            console.log(`Paddy product ${i+1}:`, {
              id: p._id, 
              name: p.name,
              isProcessedRice: p.isProcessedRice,
              status: p.status,
              farmer: p.farmer?._id || p.farmer
            });
          });
          
          setPendingProducts(paddyProducts);
        } else {
          console.log('No pending products found with any criteria.');
          setPendingProducts([]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending products:', error);
      toast.error('Failed to load pending products');
      setLoading(false);
    }
  };

  const handleCreateTestProduct = async () => {
    try {
      setCreatingTest(true);
      await inventoryService.createTestPaddyProduct();
      toast.success('Test paddy product created successfully!');
      fetchPendingProducts();
    } catch (error) {
      console.error('Error creating test product:', error);
      toast.error('Failed to create test product');
    } finally {
      setCreatingTest(false);
    }
  };

  const handleApprove = (product) => {
    // Store the product ID in sessionStorage for post-approval handling
    sessionStorage.setItem('approvedProductId', product._id);
    
    navigate(`/admin/inventory/purchase?productId=${product._id}&farmerId=${product.farmer._id}`, {
      state: { from: 'pending-products' }
    });
  };

  const handleReject = async (productId) => {
    if (window.confirm('Are you sure you want to reject this product?')) {
      try {
        await productService.updateProductStatus(
          productId, 
          'rejected', 
          'Product rejected by admin'
        );
        
        toast.success('Product rejected successfully');
        fetchPendingProducts();
      } catch (error) {
        console.error('Error rejecting product:', error);
        toast.error('Failed to reject product');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Pending Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            Review and approve new products added by farmers.
          </p>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : pendingProducts.length === 0 ? (
            <div className="mt-10 text-center">
              <p className="text-lg text-gray-500 mb-4">No pending products to review.</p>
              
              <div className="inline-block p-4 bg-yellow-50 border border-yellow-200 rounded-md text-left">
                <p className="text-sm text-yellow-700 mb-3">
                  There are no paddy products pending approval. Farmers need to submit paddy first, or you can create a test product.
                </p>
                <button
                  onClick={handleCreateTestProduct}
                  disabled={creatingTest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creatingTest ? 'Creating...' : 'Create Test Paddy Product'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {pendingProducts.map((product) => (
                  <li key={product._id}>
                    <div className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <ProductImage 
                                src={product.images?.[0]} 
                                alt={product.name} 
                                className="h-full w-full object-cover object-center" 
                              />
                            </div>
                            <div>
                              <p className="text-lg font-medium text-primary-600 truncate">{product.name}</p>
                              <p className="mt-1 text-sm text-gray-500">
                                {product.description.length > 120 
                                  ? product.description.substring(0, 120) + '...' 
                                  : product.description}
                              </p>
                              <div className="mt-2 flex space-x-4">
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">Type:</span> {product.riceType}
                                </p>
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">Quantity:</span> {product.stockQuantity || product.availableQuantity} {product.unit}
                                </p>
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">Farmer Price:</span> ₹{product.farmerPrice}/{product.unit}
                                </p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                <span className="font-medium">Farmer:</span> {product.farmer?.name || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
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
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PendingProductsPage; 