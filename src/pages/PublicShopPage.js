import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFilter, FaSearch, FaShoppingCart } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';
import productService from '../services/productService';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import { DEFAULT_RICE_PRODUCT_IMAGE } from '../utils/imageUtils';
import ProductImage from '../components/common/ProductImage';

const PublicShopPage = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt:desc',
    status: 'approved' // Only show approved products
  });
  const [showFilters, setShowFilters] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = {
          page: currentPage,
          limit: 12,
          ...filters
        };
        
        // Remove empty filters
        Object.keys(params).forEach(key => {
          if (params[key] === '') {
            delete params[key];
          }
        });
        
        console.log('Fetching products with params:', params);
        const response = await productService.getProducts(params);
        console.log('Products response:', response);
        
        if (response && Array.isArray(response.products)) {
          setProducts(response.products);
          setCurrentPage(response.currentPage || 1);
          setTotalPages(response.totalPages || 1);
        } else {
          console.warn('Unexpected response format:', response);
          setProducts([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        // If server hasn't started yet or network error, retry
        if (retryCount < 3 && (!err.response || err.message === 'Network Error')) {
          console.log(`Retrying products fetch (attempt ${retryCount + 1})...`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchProducts(), 2000); // Retry after 2 seconds
        } else {
          // Show appropriate error message based on error type
          const errorMessage = err.response?.status === 404
            ? 'Products not found. The service might be temporarily unavailable.'
            : 'Failed to load products. Please try again later.';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentPage, filters, retryCount]);
  
  // Handle search input change
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Reset to first page when searching
    setCurrentPage(1);
  };
  
  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    // Reset to first page when filters change
    setCurrentPage(1);
  };
  
  // Handle adding product to cart
  const handleAddToCart = (product) => {
    if (product.availableQuantity <= 0) {
      toast.error('Sorry, this product is out of stock');
      return;
    }
    
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : DEFAULT_RICE_PRODUCT_IMAGE,
      quantity: 1,
      stockQuantity: product.availableQuantity
    };
    
    dispatch(addToCart(cartItem));
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  return (
    <MainLayout>
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-center text-gray-900">Shop Quality Rice Products</h1>
            <p className="mt-4 text-center text-xl text-gray-600 max-w-3xl mx-auto">
              Premium rice varieties, sourced directly from farmers across India
            </p>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="w-full md:w-1/3 flex">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleSearchChange}
                    placeholder="Search rice products..."
                    className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center px-3 bg-green-600 rounded-r-md text-white"
                  >
                    <FaSearch />
                  </button>
                </div>
              </form>
              
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <FaFilter className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {/* Sort Dropdown */}
              <div className="w-full md:w-auto">
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                >
                  <option value="createdAt:desc">Newest First</option>
                  <option value="price:asc">Price: Low to High</option>
                  <option value="price:desc">Price: High to Low</option>
                  <option value="name:asc">Name: A to Z</option>
                  <option value="name:desc">Name: Z to A</option>
                </select>
              </div>
            </div>
            
            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Rice Type
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="basmati">Basmati Rice</option>
                    <option value="brown">Brown Rice</option>
                    <option value="jasmine">Jasmine Rice</option>
                    <option value="sona_masoori">Sona Masoori</option>
                    <option value="ponni">Ponni Rice</option>
                    <option value="other">Other Variety</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    min="0"
                    placeholder="Min Price"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    min="0"
                    placeholder="Max Price"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Products Grid */}
          <div className="mb-10">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                  {products.map((product) => (
                    <div key={product._id} className="group relative bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 group-hover:opacity-75">
                        <ProductImage
                          src={product.images && product.images.length > 0 ? product.images[0] : null}
                          alt={product.name}
                          className="w-full h-60 object-center object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {product.category} • {product.organicCertified ? 'Organic' : 'Non-Organic'}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(product.price)}/{product.unit || 'kg'}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.availableQuantity > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.availableQuantity > 0 
                              ? `${product.availableQuantity} ${product.unit || 'kg'} available` 
                              : 'Out of stock'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="mt-4 flex justify-between space-x-2">
                          <Link
                            to={`/shop/product/${product._id}`}
                            className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.availableQuantity <= 0}
                            className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                              product.availableQuantity > 0 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <FaShoppingCart className="mr-2" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                          currentPage === 1 
                            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        {/* Chevron left icon */}
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {[...Array(totalPages).keys()].map((page) => (
                        <button
                          key={page + 1}
                          onClick={() => handlePageChange(page + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === page + 1
                              ? 'z-10 bg-green-50 border-green-500 text-green-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                          currentPage === totalPages 
                            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        {/* Chevron right icon */}
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PublicShopPage; 