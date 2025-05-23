import api from './api';

/**
 * Get current user profile
 * @returns {Promise} - User profile data
 */
const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

/**
 * Update user profile information
 * @param {Object} userData - User profile data to update
 * @returns {Promise} - Updated user data
 */
const updateProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

/**
 * Upload user profile image
 * @param {FormData} formData - Form data containing the image file
 * @returns {Promise} - Image upload result
 */
const uploadProfileImage = async (formData) => {
  const response = await api.post('/users/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Change user password
 * @param {Object} passwordData - Object containing current and new password
 * @returns {Promise} - Password change result
 */
const changePassword = async (passwordData) => {
  const response = await api.put('/users/change-password', passwordData);
  return response.data;
};

/**
 * Get all users with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise} List of users
 */
const getAllUsers = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await api.get(`/users?${queryParams}`);
  return response.data;
};

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise} User details
 */
const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

/**
 * Get all farmers with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise} List of farmers
 */
const getAllFarmers = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await api.get(`/users/farmers?${queryParams}`);
  return response.data;
};

/**
 * Get all staff with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise} List of staff
 */
const getAllStaff = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await api.get(`/users/staff?${queryParams}`);
  return response.data;
};

/**
 * Update user status (approve/block)
 * @param {string} id - User ID
 * @param {string} status - New status
 * @returns {Promise} Updated user
 */
const updateUserStatus = async (id, status) => {
  const response = await api.put(`/users/${id}/status`, { status });
  return response.data;
};

/**
 * Create a new staff account
 * @param {Object} userData - Staff user data
 * @returns {Promise} Created user
 */
const createStaffAccount = async (userData) => {
  const response = await api.post('/users/staff', userData);
  return response.data;
};

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise} Updated user
 */
const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {Promise} Response status
 */
const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

/**
 * Get user metrics
 * @returns {Promise} User metrics
 */
const getUserMetrics = async () => {
  const response = await api.get('/users/metrics');
  return response.data;
};

const userService = {
  getUserProfile,
  updateProfile,
  uploadProfileImage,
  changePassword,
  getAllUsers,
  getUserById,
  getAllFarmers,
  getAllStaff,
  updateUserStatus,
  createStaffAccount,
  updateUser,
  deleteUser,
  getUserMetrics
};

export default userService; 