import api from './api';

/**
 * Get reviews for a product
 * @param {string} productId - Product ID
 * @param {Object} params - Query parameters for sorting and pagination
 * @returns {Promise} - List of reviews
 */
const getProductReviews = async (productId, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await api.get(`/reviews/product/${productId}?${queryParams}`);
  return response.data;
};

/**
 * Create a new review
 * @param {Object} reviewData - Review data
 * @returns {Promise} - Created review
 */
const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

/**
 * Update a review
 * @param {string} reviewId - Review ID
 * @param {Object} reviewData - Updated review data
 * @returns {Promise} - Updated review
 */
const updateReview = async (reviewId, reviewData) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 * @returns {Promise} - Deletion response
 */
const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

/**
 * Mark a review as helpful
 * @param {string} reviewId - Review ID
 * @returns {Promise} - Updated helpfulness count
 */
const markReviewAsHelpful = async (reviewId) => {
  const response = await api.put(`/reviews/${reviewId}/helpful`);
  return response.data;
};

/**
 * Get user's reviews
 * @returns {Promise} - List of reviews by the user
 */
const getUserReviews = async () => {
  const response = await api.get('/reviews/user');
  return response.data;
};

const reviewService = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewAsHelpful,
  getUserReviews,
};

export default reviewService; 