import api from './api';

/**
 * Get all conversations for the current user
 * @returns {Promise} Conversations list
 */
const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

/**
 * Get conversation with a specific user
 * @param {string} userId - User ID to get conversation with
 * @param {Object} params - Query parameters
 * @returns {Promise} Messages in the conversation
 */
const getConversation = async (userId, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await api.get(`/messages/conversation/${userId}?${queryParams}`);
  return response.data;
};

/**
 * Send a new message
 * @param {Object} messageData - Message data
 * @returns {Promise} Sent message
 */
const sendMessage = async (messageData) => {
  const response = await api.post('/messages', messageData);
  return response.data;
};

/**
 * Mark a message as read
 * @param {string} messageId - Message ID
 * @returns {Promise} Updated message
 */
const markAsRead = async (messageId) => {
  const response = await api.put(`/messages/${messageId}/read`);
  return response.data;
};

/**
 * Get count of unread messages
 * @returns {Promise} Unread count
 */
const getUnreadCount = async () => {
  const response = await api.get('/messages/unread/count');
  return response.data;
};

const messageService = {
  getConversations,
  getConversation,
  sendMessage,
  markAsRead,
  getUnreadCount
};

export default messageService; 