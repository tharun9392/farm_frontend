import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    riceType: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt:desc'
  });
  
  const { addToCart } = useCart();
  
  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = {
          page: currentPage,
          limit: 8,
          ...filters
        };
        
        // Remove empty filters
        Object.keys(params).forEach(key => {
          if (params[key] === '') {
            delete params[key];
          }
        });
        
        const response = await productService.getProducts(params);
        setProducts(response.products);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        setLoading(false);
        toast.error('Failed to load products');
      }
    };
    
    fetchProducts();
  }, [currentPage, filters]);
  
  // Handle search input change
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
  
  // Handle add to cart
  const handleAddToCart = (product) => {
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.farmerPrice,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      quantity: 1,
      stockQuantity: product.stockQuantity
    };
    
    addToCart(cartItem);
  };
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Shop</h1>
          
          {/* Filters */}
          <div className="mt-4 bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              
              {/* Rice Type Filter */}
              <div>
                <label htmlFor="riceType" className="block text-sm font-medium text-gray-700">
                  Rice Type
                </label>
                <select
                  id="riceType"
                  name="riceType"
                  value={filters.riceType}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="Basmati">Basmati</option>
                  <option value="Jasmine">Jasmine</option>
                  <option value="Sona Masoori">Sona Masoori</option>
                  <option value="Brown Rice">Brown Rice</option>
                  <option value="White Rice">White Rice</option>
                  <option value="Black Rice">Black Rice</option>
                  <option value="Wild Rice">Wild Rice</option>
                  <option value="Red Rice">Red Rice</option>
                  <option value="Sticky Rice">Sticky Rice</option>
                  <option value="Arborio">Arborio</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Sort By */}
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="createdAt:desc">Newest</option>
                  <option value="farmerPrice:asc">Price: Low to High</option>
                  <option value="farmerPrice:desc">Price: High to Low</option>
                  <option value="name:asc">Name: A-Z</option>
                  <option value="name:desc">Name: Z-A</option>
                </select>
              </div>
            </div>
            
            {/* Price Range */}
            <div className="mt-4 grid grid-cols-2 gap-4">
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
                  placeholder="Min Price"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                  placeholder="Max Price"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
          
          {/* Products */}
          <div className="mt-6">
            {loading ? (
              <div className="flex justify-center">
                <div className="spinner"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>No products found matching your criteria.</p>
                <p className="mt-2">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <div key={product._id} className="bg-white overflow-hidden shadow rounded-lg">
                    {/* Product Image */}
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-4">
                      <Link to={`/customer/shop/product/${product._id}`}>
                        <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.riceType}
                      </p>
                      <div className="mt-2 flex items-center">
                        <div className="text-base font-medium text-gray-900">
                          ₹{product.farmerPrice}
                        </div>
                        <div className="ml-2 text-sm text-gray-500">
                          / kg
                        </div>
                      </div>
                      
                      {/* Quality Badges */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {product.quality?.isOrganic && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Organic
                          </span>
                        )}
                        {product.quality?.isPesticideFree && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Pesticide Free
                          </span>
                        )}
                      </div>
                      
                      {/* Add to Cart Button */}
                      <div className="mt-3">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stockQuantity <= 0}
                          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                            ${product.stockQuantity > 0 
                              ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500' 
                              : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                          {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage <= 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium 
                      ${currentPage <= 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    &laquo; Previous
                  </button>
                  
                  {[...Array(totalPages).keys()].map(page => (
                    <button
                      key={page + 1}
                      onClick={() => setCurrentPage(page + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium 
                        ${currentPage === page + 1
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                    >
                      {page + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium 
                      ${currentPage >= totalPages 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    Next &raquo;
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShopPage; 