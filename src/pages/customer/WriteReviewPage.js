import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import reviewService from '../../services/reviewService';
import { toast } from 'react-toastify';

const WriteReviewPage = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: []
  });
  
  // Fetch product and order data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If we have a product ID from URL params
        if (productId) {
          const productResponse = await productService.getProductById(productId);
          setProduct(productResponse.product);
        } 
        // If we have an order ID from search params
        else if (orderId) {
          const orderResponse = await orderService.getOrderById(orderId);
          setOrder(orderResponse.order);
          
          // Get the first product from the order for review
          if (orderResponse.order?.orderItems?.length > 0) {
            const firstItem = orderResponse.order.orderItems[0];
            const productResponse = await productService.getProductById(firstItem.inventory);
            setProduct(productResponse.product);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load information. Please try again.');
        setLoading(false);
        toast.error('Error loading product information');
      }
    };
    
    fetchData();
  }, [productId, orderId]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle rating change
  const handleRatingChange = (newRating) => {
    setReviewData(prev => ({
      ...prev,
      rating: newRating
    }));
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // For this example, we're not actually uploading images
    // In a real implementation, you would upload to a server or cloud storage
    // and get back URLs to store in the review
    
    // Simulate URL generation for demo purposes
    const newImages = files.map(file => URL.createObjectURL(file));
    
    setReviewData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };
  
  // Remove an uploaded image
  const handleRemoveImage = (index) => {
    setReviewData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Submit the review
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!product) {
      toast.error('No product selected for review');
      return;
    }
    
    if (!reviewData.comment.trim()) {
      toast.error('Please provide a review comment');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const reviewToSubmit = {
        product: product._id,
        rating: reviewData.rating,
        title: reviewData.title.trim(),
        comment: reviewData.comment.trim(),
        images: reviewData.images,
        order: orderId || undefined
      };
      
      await reviewService.createReview(reviewToSubmit);
      
      toast.success('Review submitted successfully!');
      
      // Navigate back to product page or order page
      if (productId) {
        navigate(`/customer/shop/product/${productId}`);
      } else if (orderId) {
        navigate(`/customer/orders/${orderId}`);
      } else {
        navigate('/customer/orders');
      }
      
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const goBack = () => {
    if (productId) {
      navigate(`/customer/shop/product/${productId}`);
    } else if (orderId) {
      navigate(`/customer/orders/${orderId}`);
    } else {
      navigate('/customer/orders');
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
  
  if (error || (!product && !order)) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center">
              <p className="text-red-500">{error || 'Product or order not found'}</p>
              <button
                onClick={goBack}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
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
                {orderId ? (
                  <Link to={`/customer/orders/${orderId}`} className="ml-2 text-gray-500 hover:text-gray-700">
                    Order Details
                  </Link>
                ) : (
                  <Link to="/customer/shop" className="ml-2 text-gray-500 hover:text-gray-700">
                    Shop
                  </Link>
                )}
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-gray-800 font-medium">
                  Write a Review
                </span>
              </li>
            </ol>
          </nav>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-900">Write a Review</h1>
              {product && (
                <p className="mt-1 text-sm text-gray-600">
                  for {product.name}
                </p>
              )}
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              {/* Product Information */}
              {product && (
                <div className="mb-6 flex items-center">
                  <div className="flex-shrink-0 h-20 w-20 bg-gray-200 rounded-md overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-center object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">{product.name}</h2>
                    <p className="text-sm text-gray-500">{product.riceType}</p>
                  </div>
                </div>
              )}
              
              {/* Review Form */}
              <form onSubmit={handleSubmit}>
                {/* Rating Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`h-8 w-8 ${
                            star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
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
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {reviewData.rating} out of 5 stars
                    </span>
                  </div>
                </div>
                
                {/* Review Title */}
                <div className="mb-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Review Title (Optional)
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={reviewData.title}
                    onChange={handleChange}
                    placeholder="Summarize your experience"
                    maxLength={100}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Review Comment */}
                <div className="mb-6">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                    Review Comment
                  </label>
                  <textarea
                    name="comment"
                    id="comment"
                    rows={4}
                    value={reviewData.comment}
                    onChange={handleChange}
                    required
                    placeholder="Share your experience with this product"
                    maxLength={500}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {reviewData.comment.length}/500 characters
                  </p>
                </div>
                
                {/* Image Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Add Photos (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="images"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Upload images</span>
                          <input
                            id="images"
                            name="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Display Uploaded Images */}
                {reviewData.images.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Uploaded Images
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {reviewData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <div className="h-24 bg-gray-200 rounded-md overflow-hidden">
                            <img
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      submitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                    }`}
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WriteReviewPage; 