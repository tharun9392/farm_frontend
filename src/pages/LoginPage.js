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
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                create a new account
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
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{formError}</div>
                  </div>
                )}

                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                      placeholder="Email address"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                      placeholder="Password"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-primary-600 hover:text-primary-500"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      (isSubmitting || isLoading) && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting || isLoading ? (
                      'Signing in...'
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage; 