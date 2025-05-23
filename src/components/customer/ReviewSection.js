import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar, FaUser, FaThumbsUp, FaFlag } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReviewSection = ({ productId, reviews = [], averageRating = 0, totalReviews = 0, onReviewAdded }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    title: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Check if user has already reviewed this product
  const hasReviewed = reviews.some(review => review.user?._id === user?._id);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }
    
    if (newReview.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Make API call to submit review
      const response = await axios.post('/api/reviews', {
        product: productId,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment
      });
      
      toast.success('Review submitted successfully!');
      setNewReview({ rating: 0, comment: '', title: '' });
      
      // Call the callback function to update parent component
      if (onReviewAdded) {
        onReviewAdded(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
      console.error('Review submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  // Render stars for rating display
  const renderRatingStars = (rating, size = 'text-xl') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className={`text-yellow-400 ${size}`} />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className={`text-yellow-400 ${size}`} />);
      } else {
        stars.push(<FaRegStar key={i} className={`text-yellow-400 ${size}`} />);
      }
    }
    
    return stars;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate rating distribution
  const ratingDistribution = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
  
  reviews.forEach(review => {
    const rating = Math.floor(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[5 - rating]++;
    }
  });

  const getDistributionPercentage = (count) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  // For development/preview, use sample data if no reviews
  const sampleReviews = [
    {
      _id: '1',
      rating: 5,
      title: 'Excellent quality rice',
      comment: 'The rice grains are long and aromatic. Cook perfectly and taste delicious. Will buy again!',
      createdAt: '2023-08-15T10:30:00Z',
      user: { _id: 'user1', name: 'Rajesh Kumar' },
      helpfulCount: 12
    },
    {
      _id: '2',
      rating: 4,
      title: 'Good product but delivery was delayed',
      comment: 'Rice quality is good but the delivery took longer than expected. Otherwise satisfied with the purchase.',
      createdAt: '2023-08-10T14:20:00Z',
      user: { _id: 'user2', name: 'Priya Singh' },
      helpfulCount: 5
    },
    {
      _id: '3',
      rating: 3,
      title: 'Average quality',
      comment: 'The rice is okay but not as good as I expected for the price. Packaging was good though.',
      createdAt: '2023-08-05T09:15:00Z',
      user: { _id: 'user3', name: 'Amit Patel' },
      helpfulCount: 2
    }
  ];

  // Use sample data if no real reviews available
  const displayReviews = reviews.length > 0 ? reviews : sampleReviews;
  const displayAverageRating = reviews.length > 0 ? averageRating : 4.0;
  const displayTotalReviews = reviews.length > 0 ? totalReviews : sampleReviews.length;

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
      
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {/* Rating Overview */}
        <div className="md:col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0">
          <div className="text-5xl font-bold text-gray-800 mb-2">{displayAverageRating.toFixed(1)}</div>
          <div className="flex mb-2">
            {renderRatingStars(displayAverageRating, 'text-2xl')}
          </div>
          <p className="text-gray-600">{displayTotalReviews} reviews</p>
        </div>
        
        {/* Rating Distribution */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star, index) => (
              <div key={star} className="flex items-center">
                <div className="w-12 text-sm text-gray-700 font-medium flex items-center">
                  {star} <FaStar className="ml-1 text-yellow-400" />
                </div>
                <div className="flex-grow mx-3">
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full" 
                      style={{ width: `${getDistributionPercentage(ratingDistribution[5 - star])}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-10 text-sm text-gray-600 text-right">
                  {ratingDistribution[5 - star]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Write Review Section */}
      {!hasReviewed ? (
        <div className="border-t border-b border-gray-200 py-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Write a Review</h3>
          
          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Your Rating</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="text-2xl focus:outline-none"
                    >
                      {star <= (hoveredRating || newReview.rating) ? (
                        <FaStar className="text-yellow-400" />
                      ) : (
                        <FaRegStar className="text-yellow-400" />
                      )}
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">
                    {newReview.rating > 0 ? `${newReview.rating} out of 5` : 'Click to rate'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newReview.title}
                  onChange={handleInputChange}
                  placeholder="Summarize your experience"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="comment" className="block text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  value={newReview.comment}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Share your experience with this product"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-3">You need to be logged in to write a review</p>
              <Link to="/login" className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Sign in to Write a Review
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="border-t border-b border-gray-200 py-6 mb-8 bg-green-50 px-4 rounded-lg">
          <p className="text-green-800">You have already reviewed this product. Thank you for your feedback!</p>
        </div>
      )}
      
      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Reviews</h3>
        
        {displayReviews.length > 0 ? (
          <div className="space-y-6">
            {displayReviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center">
                      {renderRatingStars(review.rating)}
                      <span className="ml-2 text-gray-700 font-medium">
                        {review.title || 'Product Review'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {review.user?.name || 'Customer'} - {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">{review.helpfulCount || 0} found helpful</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{review.comment}</p>
                
                <div className="flex items-center space-x-4">
                  <button className="text-sm text-gray-600 flex items-center hover:text-green-600">
                    <FaThumbsUp className="mr-1" /> Helpful
                  </button>
                  <button className="text-sm text-gray-600 flex items-center hover:text-red-600">
                    <FaFlag className="mr-1" /> Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-2">No reviews yet</p>
            <p className="text-sm text-gray-500">Be the first to review this product</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection; 