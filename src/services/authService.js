import api from './api';

// Register user
const register = async (userData) => {
  try {
    console.log('Sending registration data to server:', userData);
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx range
      console.error('Registration API error:', error.response.data);
      console.error('Status code:', error.response.status);
      console.error('Headers:', error.response.headers);
      
      // Extract the error message from the response and throw it
      const errorData = error.response.data;
      let errorMessage;
      
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else {
        errorMessage = 'Registration failed. Please try again.';
      }
      
      console.error('Extracted error message:', errorMessage);
      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Server may be down or network issue:', error.request);
      throw new Error('No response from server. Please check your connection and try again.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
      throw new Error('An error occurred during registration. Please try again.');
    }
  }
};

// Login user
const login = async (credentials) => {
  try {
    console.log('Attempting login with:', credentials.email);
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Login API error:', error.response.data);
      console.error('Status code:', error.response.status);
      
      // Extract the error message from the response
      const errorData = error.response.data;
      let errorMessage;
      
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else {
        errorMessage = 'Login failed. Please check your credentials.';
      }
      
      console.error('Login error message:', errorMessage);
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('No response received from server:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Error setting up login request:', error.message);
      throw new Error('An error occurred during login. Please try again.');
    }
  }
};

// Logout user
const logout = () => {
  // Call the backend to invalidate token
  api.post('/auth/logout')
    .catch(error => {
      console.error('Logout error:', error);
    })
    .finally(() => {
      // Clear local storage regardless of API success
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    });
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

// Get current user profile
const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Get user from localStorage
const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
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
  resetPasswordWithOTP
};

export default authService; 