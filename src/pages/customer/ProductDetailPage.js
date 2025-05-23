import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import productService from '../../services/productService';
import reviewService from '../../services/reviewService';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Get product details
        const productResponse = await productService.getProductById(productId);
        setProduct(productResponse.product);
        
        // Get product reviews
        const reviewsResponse = await reviewService.getProductReviews(productId);
        setReviews(reviewsResponse.reviews || []);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load product information. Please try again.');
        setLoading(false);
        toast.error('Error loading product details');
      }
    };
    
    fetchProductData();
  }, [productId]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stockQuantity || 1)) {
      setQuantity(value);
    }
  };
  
  const incrementQuantity = () => {
    if (quantity < (product?.stockQuantity || 1)) {
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      const cartItem = {
        _id: product._id,
        name: product.name,
        price: product.farmerPrice,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        quantity: quantity,
        stockQuantity: product.stockQuantity
      };
      
      dispatch(addToCart(cartItem));
      toast.success(`${product.name} added to cart!`);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-center">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !product) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center">
              <p className="text-red-500">{error || 'Product not found'}</p>
              <button
                onClick={() => navigate('/customer/shop')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to Shop
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Breadcrumbs */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex space-x-2">
              <li>
                <Link to="/customer/dashboard" className="text-gray-500 hover:text-gray-700">
                  Dashboard
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" clipRule="evenodd" />
                </svg>
                <Link to="/customer/shop" className="ml-2 text-gray-500 hover:text-gray-700">
                  Shop
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-gray-800 font-medium truncate">
                  {product.name}
                </span>
              </li>
            </ol>
          </nav>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Images */}
              <div className="p-4">
                <div className="h-80 bg-gray-200 rounded-lg overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image Available
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <div key={index} className="h-20 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                
                {/* Rating */}
                <div className="mt-2 flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 15.585l-6.327 3.332a1 1 0 01-1.45-1.054l1.205-7.034-5.123-4.989a1 1 0 01.555-1.705l7.073-1.027 3.162-6.403a1 1 0 011.79 0l3.162 6.403 7.073 1.027a1 1 0 01.555 1.705l-5.123 4.989 1.205 7.034a1 1 0 01-1.45 1.054L10 15.585z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="ml-2 text-sm text-gray-500">
                    {averageRating} out of 5 ({reviews.length} reviews)
                  </p>
                </div>
                
                {/* Price */}
                <div className="mt-4">
                  <p className="text-3xl font-bold text-gray-900">₹{product.farmerPrice}</p>
                  <p className="text-sm text-gray-500">per kg</p>
                </div>
                
                {/* Rice Type & Region */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rice Type</h3>
                    <p className="mt-1 text-sm text-gray-900">{product.riceType}</p>
                  </div>
                  {product.region && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Region</h3>
                      <p className="mt-1 text-sm text-gray-900">{product.region}</p>
                    </div>
                  )}
                </div>
                
                {/* Quality Parameters */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">Quality Parameters</h3>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {product.quality?.grainLength && (
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Grain Length:</span> {product.quality.grainLength}
                      </div>
                    )}
                    {product.quality?.moisturePercentage != null && (
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Moisture:</span> {product.quality.moisturePercentage}%
                      </div>
                    )}
                    {product.quality?.brokenRicePercentage != null && (
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Broken Rice:</span> {product.quality.brokenRicePercentage}%
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.quality?.isOrganic && (
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Organic
                    </span>
                  )}
                  {product.quality?.isPesticideFree && (
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Pesticide Free
                    </span>
                  )}
                  {product.certifications?.map((cert, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
                
                {/* Stock */}
                <div className="mt-4">
                  <p className={`text-sm ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stockQuantity > 0 
                      ? `In Stock (${product.stockQuantity} kg available)` 
                      : 'Out of Stock'}
                  </p>
                </div>
                
                {/* Quantity Selector */}
                {product.stockQuantity > 0 && (
                  <div className="mt-4">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                      Quantity (kg)
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <button
                        type="button"
                        onClick={decrementQuantity}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-gray-50 text-gray-500 text-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="1"
                        max={product.stockQuantity}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-24 text-center sm:text-sm border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={incrementQuantity}
                        className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-gray-50 text-gray-500 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Add to Cart Button */}
                <div className="mt-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stockQuantity <= 0}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white 
                      ${product.stockQuantity > 0 
                        ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500' 
                        : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
                
                {/* Farmer Info */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-500">Farmer</h3>
                  <div className="mt-2 flex items-center">
                    {product.farmer?.profileImage ? (
                      <img
                        src={product.farmer.profileImage}
                        alt={product.farmer.name}
                        className="h-10 w-10 rounded-full border-2 border-green-400 shadow-sm"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-400">
                        <span className="text-green-700 text-lg font-bold">{product.farmer?.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                    )}
                    <span className="ml-3 text-base font-semibold text-green-800 truncate max-w-xs" title={product.farmer?.name}>
                      Farmer: <span className="font-bold text-green-900">
                        {product.farmer?.name?.split(' ').filter(part => !['Admin', 'Staff'].includes(part)).join(' ')}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Description */}
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <div className="mt-3 text-sm text-gray-600 whitespace-pre-line">
                {product.description}
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
              
              {reviews.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">No reviews yet.</p>
              ) : (
                <div className="mt-6 space-y-6 divide-y divide-gray-200">
                  {reviews.map(review => (
                    <div key={review._id} className="pt-6 first:pt-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {review.customer?.profileImage ? (
                            <img 
                              className="h-8 w-8 rounded-full" 
                              src={review.customer.profileImage} 
                              alt={review.customer.name}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                {review.customer?.name?.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{review.customer?.name}</p>
                          <div className="flex items-center">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 15.585l-6.327 3.332a1 1 0 01-1.45-1.054l1.205-7.034-5.123-4.989a1 1 0 01.555-1.705l7.073-1.027 3.162-6.403a1 1 0 011.79 0l3.162 6.403 7.073 1.027a1 1 0 01.555 1.705l-5.123 4.989 1.205 7.034a1 1 0 01-1.45 1.054L10 15.585z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ))}
                            </div>
                            <p className="ml-2 text-xs text-gray-500">
                              {review.createdAt && format(new Date(review.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {review.title && (
                        <h4 className="mt-3 text-sm font-medium text-gray-900">{review.title}</h4>
                      )}
                      
                      <div className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                        {review.comment}
                      </div>
                      
                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="mt-4 flex space-x-2">
                          {review.images.map((image, index) => (
                            <div key={index} className="h-16 w-16 rounded-md overflow-hidden bg-gray-200">
                              <img
                                src={image}
                                alt={`Review ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Verified Purchase Badge */}
                      {review.isVerifiedPurchase && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Verified Purchase
                          </span>
                        </div>
                      )}
                      
                      {/* Helpful Button */}
                      <div className="mt-4">
                        <button 
                          onClick={() => reviewService.markReviewAsHelpful(review._id)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 mr-1 text-gray-400" 
                            fill="none"
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905A3.61 3.61 0 018.5 7.5" />
                          </svg>
                          Helpful ({review.helpfulCount || 0})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Write a Review Link */}
              <div className="mt-6">
                <Link
                  to={`/customer/reviews/write/${product._id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Write a Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductDetailPage;