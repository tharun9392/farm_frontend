import axios from 'axios';

// Determine the correct API URL based on environment or config
const API_BASE_URL = 'https://farmerice-m6on.onrender.com/api';

// Create base axios instance for API requests
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Track failed requests for retry
let failedRequestQueue = [];
let isRefreshingToken = false;

// Add a request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('API Request Debug:', {
      url: config.url,
      method: config.method.toUpperCase(),
      hasToken: !!token,
      tokenPrefix: token ? `${token.substring(0, 10)}...` : 'None'
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response Debug:', {
      url: response.config.url,
      method: response.config.method.toUpperCase(),
      status: response.status,
      success: true
    });
    return response;
  },
  async (error) => {
    console.error('API Response Error Debug:', {
      url: error.config?.url || 'unknown',
      method: error.config?.method?.toUpperCase() || 'unknown',
      status: error.response?.status || 'no response',
      message: error.response?.data?.message || error.message || 'Unknown error'
    });
    
    // Check if error is due to network problems (no server connection)
    if (!error.response && error.message === 'Network Error') {
      console.error('Network connection issue. Server may be down.');
      
      // Attempt to check health endpoint
      try {
        await checkServerHealth();
        // If this succeeds, the server is up but the API endpoint may be wrong
        console.log('Server is up, but the API endpoint may be incorrect');
      } catch (healthCheckError) {
        console.error('Server health check failed. Server is likely down.');
      }
      
      return Promise.reject({
        ...error,
        formattedMessage: 'Cannot connect to server. Please check your connection and try again.'
      });
    }
    
    // Handle 404 errors more descriptively
    if (error.response?.status === 404) {
      console.error(`Route not found: ${error.config?.url}`, error.response?.data);
      error.formattedMessage = `API endpoint not found: ${error.config?.url}. This might be a server-side configuration issue.`;
    }
    
    const originalRequest = error.config;

    // Handle token expiration and refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token if it's invalid
      if (error.response?.data?.message?.includes('invalid token')) {
        console.log('Invalid token detected, clearing credentials');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Add to failed request queue for retry after token refresh
      const retryRequest = new Promise((resolve, reject) => {
        failedRequestQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject: (err) => {
            reject(err);
          }
        });
      });

      // Only attempt token refresh if not already in progress
      if (!isRefreshingToken) {
        isRefreshingToken = true;
        
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          console.log('Attempting token refresh...');
            
          // Request new tokens using refresh token
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`, 
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          if (!response.data.token) {
            throw new Error('No token received from refresh');
          }

          const { token, refreshToken: newRefreshToken } = response.data;
          
          console.log('Token refresh successful - updating stored tokens');
          
          // Update tokens in localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Update Authorization header
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          
          // Process all queued requests with new token
          failedRequestQueue.forEach(request => {
            request.resolve(token);
          });
          
          // Clear the queue
          failedRequestQueue = [];
          isRefreshingToken = false;
          
          return retryRequest;
        } catch (err) {
          // Handle refresh token failure - clear tokens and redirect to login
          console.error('Token refresh failed:', err.message);
          
          // Process all queued requests with rejection
          failedRequestQueue.forEach(request => {
            request.reject(err);
          });
          
          // Clear the queue
          failedRequestQueue = [];
          isRefreshingToken = false;
          
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Use window.location for redirecting
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } else {
        // Token refresh already in progress, return the retry promise
        return retryRequest;
      }
    }

    // Handle forbidden errors (403)
    if (error.response?.status === 403) {
      console.error('Forbidden access:', error.response?.data?.message);
      // We don't redirect here as the component will handle this
    }

    // Extract and format error messages
    const errorMessage = error.response?.data?.error?.message || 
                         error.response?.data?.message || 
                         error.message || 
                         'An unknown error occurred';
    
    // Enhance error object with formatted message and response
    error.formattedMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

// Update health check URL
async function checkServerHealth() {
  try {
    await axios.get('https://farmerice-m6on.onrender.com/health', { timeout: 3000 });
    return true;
  } catch (error) {
    return false;
  }
}

export default api; 