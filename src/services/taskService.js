import api from './api';

/**
 * Get all tasks with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise} List of tasks
 */
const getAllTasks = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await api.get(`/tasks?${queryParams}`);
  return response.data;
};

/**
 * Get task by ID
 * @param {string} id - Task ID
 * @returns {Promise} Task details
 */
const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @returns {Promise} Created task
 */
const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

/**
 * Update a task
 * @param {string} id - Task ID
 * @param {Object} taskData - Task data to update
 * @returns {Promise} Updated task
 */
const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

/**
 * Delete a task
 * @param {string} id - Task ID
 * @returns {Promise} Response status
 */
const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

/**
 * Add a note to a task
 * @param {string} taskId - Task ID
 * @param {string} note - Note content
 * @returns {Promise} Updated task
 */
const addTaskNote = async (taskId, note) => {
  const response = await api.post(`/tasks/${taskId}/notes`, { note });
  return response.data;
};

/**
 * Get task metrics
 * @returns {Promise} Task metrics
 */
const getTaskMetrics = async () => {
  const response = await api.get('/tasks/metrics');
  return response.data;
};

const taskService = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addTaskNote,
  getTaskMetrics
};

export default taskService; 