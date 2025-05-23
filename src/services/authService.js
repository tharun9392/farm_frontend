import api from './api';

// Store user data in localStorage
const storeUserData = (data) => {
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    // Set default authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  }
};

// Clear user data from localStorage
const clearUserData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

// Register user
const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      storeUserData(response.data);
    }
    return response.data;
  } catch (error) {
    throw handleError(error, 'Registration failed');
  }
};

// Login user
const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      storeUserData(response.data);
    }
    return response.data;
  } catch (error) {
    throw handleError(error, 'Login failed');
  }
};

// Logout user
const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearUserData();
  }
};

// Forgot password
const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// Reset password
const resetPassword = async (token, password) => {
  const response = await api.put('/auth/reset-password', { token, password });
  return response.data;
};

// Get current user
const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw handleError(error, 'Failed to fetch user data');
  }
};

// Get user from localStorage
const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = getStoredUser();
  return !!(token && user);
};

// Request password reset OTP
const requestPasswordResetOTP = async (email) => {
  try {
    console.log('Requesting password reset OTP for:', email);
    const response = await api.post('/auth/request-otp', { email });
    console.log('Request OTP response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Request OTP error:', error);
    
    // Detailed error logging
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      
      const errorData = error.response.data;
      let errorMessage;
      
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else {
        errorMessage = 'Failed to send OTP. Please try again.';
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Error request:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Error message:', error.message);
      throw new Error('An error occurred. Please try again.');
    }
  }
};

// Verify password reset OTP
const verifyPasswordResetOTP = async (email, otp) => {
  try {
    console.log('Verifying OTP for:', email, 'OTP:', otp);
    const response = await api.post('/auth/verify-otp', { email, otp });
    console.log('Verify OTP response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    
    // Detailed error logging
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      
      const errorData = error.response.data;
      let errorMessage;
      
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else {
        errorMessage = 'OTP verification failed. Please try again.';
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Error request:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Error message:', error.message);
      throw new Error('An error occurred. Please try again.');
    }
  }
};

// Reset password with OTP
const resetPasswordWithOTP = async (email, otp, password, confirmPassword) => {
  try {
    const response = await api.post('/auth/reset-password-with-otp', { 
      email, 
      otp, 
      password,
      confirmPassword 
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      let errorMessage;
      
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else {
        errorMessage = 'Password reset failed. Please try again.';
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error('An error occurred. Please try again.');
    }
  }
};

// Error handler helper
const handleError = (error, defaultMessage) => {
  if (error.response?.data) {
    const errorData = error.response.data;
    const message = 
      errorData.error?.message || 
      errorData.message || 
      (typeof errorData === 'string' ? errorData : defaultMessage);
    return new Error(message);
  }
  return new Error(error.message || defaultMessage);
};

const authService = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  getStoredUser,
  isAuthenticated,
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPasswordWithOTP,
  storeUserData,
  clearUserData
};

export default authService; 