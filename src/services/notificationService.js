import api from './api';

/**
 * Get all notifications for the current user
 * @returns {Promise} - List of notifications
 */
const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

/**
 * Mark a notification as read
 * @param {string} notificationId - ID of the notification
 * @returns {Promise} - Updated notification
 */
const markAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 * @returns {Promise} - Result of the operation
 */
const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

/**
 * Delete a notification
 * @param {string} notificationId - ID of the notification
 * @returns {Promise} - Result of the operation
 */
const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

export default notificationService; 