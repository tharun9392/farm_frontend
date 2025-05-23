import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import MainLayout from '../layouts/MainLayout';
import productService from '../services/productService';
import { addToCart } from '../features/cart/cartSlice';
import ProductImage from '../components/common/ProductImage';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const dispatch = useDispatch();
  
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching featured products...');
        
        // Add query parameters for featured products
        const params = {
          limit: 4,
          sortBy: 'createdAt:desc',
          status: 'approved' // Only get approved products
        };
        
        const response = await productService.getProducts(params);
        console.log('Featured products response:', response);
        
        if (response && Array.isArray(response.products)) {
          setFeaturedProducts(response.products);
        } else {
          console.warn('Unexpected response format:', response);
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        // If server hasn't started yet or network error, retry
        if (retryCount < 3 && (!error.response || error.message === 'Network Error')) {
          console.log(`Retrying featured products fetch (attempt ${retryCount + 1})...`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchFeaturedProducts(), 2000); // Retry after 2 seconds
        } else {
          // Show appropriate error message based on error type
          const errorMessage = error.response?.status === 404
            ? 'Products not found. The service might be temporarily unavailable.'
            : 'Could not load featured products. Please try again later.';
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedProducts();
  }, [retryCount]);
  
  const handleAddToCart = (product) => {
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      quantity: 1,
      stockQuantity: product.availableQuantity
    };
    
    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart`);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };
  
  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Directly from farmers to your table
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Discover premium quality rice varieties sourced directly from local farmers.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/shop" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                Explore Products
              </Link>
            </div>
          </div>

          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-green-100 text-green-600 text-xl font-bold">1</div>
                <h4 className="mt-4 text-lg font-medium text-gray-900">Farmers Harvest Rice</h4>
                <p className="mt-2 text-base text-gray-500">
                  Local farmers harvest the finest rice varieties from their farms.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-green-100 text-green-600 text-xl font-bold">2</div>
                <h4 className="mt-4 text-lg font-medium text-gray-900">Quality Check & Processing</h4>
                <p className="mt-2 text-base text-gray-500">
                  We ensure only the best quality rice makes it to our inventory.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-green-100 text-green-600 text-xl font-bold">3</div>
                <h4 className="mt-4 text-lg font-medium text-gray-900">Delivery to Your Doorstep</h4>
                <p className="mt-2 text-base text-gray-500">
                  Enjoy farm-fresh rice delivered right to your home.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center mb-8">Latest Products</h3>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : featuredProducts.length === 0 ? (
              <p className="text-center text-gray-500">No products available at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <div key={product._id} className="bg-white overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                    <div className="h-52 w-full bg-gray-100 overflow-hidden">
                      <ProductImage
                        src={product.images && product.images.length > 0 ? product.images[0] : null}
                        alt={product.name}
                        className="h-full w-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <h4 className="text-lg font-medium text-gray-900 hover:text-green-700 transition-colors duration-200">{product.name}</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        {product.category && `${product.category} • `}
                        <span className={product.organicCertified ? 'text-green-600 font-medium' : 'text-gray-500'}>
                          {product.organicCertified ? 'Organic' : 'Non-Organic'}
                        </span>
                      </p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(product.price || 0)}
                        </span>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.availableQuantity}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            product.availableQuantity 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {product.availableQuantity ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 text-center">
              <Link to="/shop" className="inline-flex items-center text-green-600 font-medium hover:text-green-700">
                View All Products 
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="mt-20 bg-green-50 rounded-lg p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Are you a rice farmer?</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join our platform to sell your rice directly to consumers. Get better prices and build your brand with us.
              </p>
              <div className="mt-6">
                <Link to="/register" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                  Register as a Farmer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage; 