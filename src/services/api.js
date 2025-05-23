import axios from 'axios';
import { API_URL } from '../config';

// Create base axios instance for API requests
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
  withCredentials: true // Enable credentials for CORS
});

// Track failed requests for retry
let failedRequestQueue = [];
let isRefreshingToken = false;

// Add a request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is not 401 or it's already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Handle token refresh
    if (!isRefreshingToken) {
      isRefreshingToken = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(new Error('No refresh token available'));
      }

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { token, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;

        // Retry failed requests
        failedRequestQueue.forEach(request => request.resolve(token));
        failedRequestQueue = [];
        
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        failedRequestQueue.forEach(request => request.reject(refreshError));
        failedRequestQueue = [];
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshingToken = false;
      }
    }

    // Queue the failed request
    return new Promise((resolve, reject) => {
      failedRequestQueue.push({
        resolve: (token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        },
        reject: (err) => {
          reject(err);
        },
      });
    });
  }
);

// Health check function
export const checkServerHealth = async () => {
  try {
    const healthEndpoint = `${API_URL.replace('/api', '')}/health`;
    console.log('Checking server health at:', healthEndpoint);
    await axios.get(healthEndpoint, { timeout: 5000 });
    return true;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
};

export default api; 