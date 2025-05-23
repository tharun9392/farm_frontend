import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../layouts/MainLayout';

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginPage = () => {
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isLoading, isAuthenticated, error } = useSelector(
    (state) => state.auth
  );

  // Get the redirect path from location state or use default based on role
  const getRedirectPath = (userRole) => {
    const { from } = location.state || {};
    if (from && from.pathname) {
      return from.pathname;
    }

    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'farmer':
        return '/farmer/dashboard';
      case 'customer':
        return '/customer/dashboard';
      default:
        return '/';
    }
  };

  // Handle redirection when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getRedirectPath(user.role);
      console.log('Redirecting authenticated user to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }

    // Clear any previous errors
    return () => {
      dispatch(reset());
    };
  }, [isAuthenticated, user, navigate, dispatch, getRedirectPath]);

  // Handle error updates
  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setFormError(null);
      const result = await dispatch(login(values)).unwrap();
      
      if (result.success && result.user) {
        const redirectPath = getRedirectPath(result.user.role);
        console.log('Login successful, redirecting to:', redirectPath);
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setFormError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If already authenticated, redirect
  if (isAuthenticated && user) {
    const redirectPath = getRedirectPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex">
        {/* Left side - Feature Highlights */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary-600">
          <div className="flex items-center h-full w-full p-12">
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-6">Welcome Back!</h1>
              <p className="text-xl mb-8">Sign in to access your account and manage your rice trading activities.</p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access real-time market prices</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Track your orders and inventory</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Connect with farmers and buyers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium transition-colors">
                  Create one now
                </Link>
              </p>
            </div>

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="mt-8 space-y-6">
                  {formError && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                      <div className="flex">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{formError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Enter your email"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <Field
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Enter your password"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <div className="text-sm">
                      <Link
                        to="/forgot-password"
                        className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${
                      (isSubmitting || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting || isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage; 