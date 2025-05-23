import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaShoppingBag, FaShoppingCart, FaHeart, FaUser } from 'react-icons/fa';

// Import components
import Layout from '../../layouts/Layout';
import CustomerDashboardComponent from '../../components/customer/CustomerDashboard';
import Loader from '../../components/common/Loader';

const CustomerDashboard = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = 'Customer Dashboard | Farmer Rice';
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <Loader />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col justify-center items-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="mb-6">
              <FaUser className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
            <p className="mb-6 text-gray-600">You need to be logged in to view your dashboard.</p>
            <Link 
              to="/login" 
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Customer Dashboard | Farmer Rice</title>
        <meta name="description" content="View your orders, reviews, and account information" />
      </Helmet>
      
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg mb-8 overflow-hidden">
              <div className="px-6 py-8 sm:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="text-white mb-4 sm:mb-0">
                    <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
                    <p className="mt-2 text-primary-100">Manage your orders and explore our premium rice products.</p>
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      to="/shop"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                    >
                      <FaShoppingBag className="mr-2" />
                      Shop Now
                    </Link>
                    <Link
                      to="/cart"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                    >
                      <FaShoppingCart className="mr-2" />
                      View Cart
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link 
                to="/customer/orders" 
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3 group-hover:bg-primary-200 transition-colors duration-200">
                    <FaShoppingBag className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">My Orders</h3>
                    <p className="text-sm text-gray-500">Track and manage your orders</p>
                  </div>
                </div>
              </Link>

              <Link 
                to="/customer/wishlist" 
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3 group-hover:bg-red-200 transition-colors duration-200">
                    <FaHeart className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Wishlist</h3>
                    <p className="text-sm text-gray-500">Save items for later</p>
                  </div>
                </div>
              </Link>

              <Link 
                to="/customer/profile" 
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3 group-hover:bg-blue-200 transition-colors duration-200">
                    <FaUser className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                    <p className="text-sm text-gray-500">Update your information</p>
                  </div>
                </div>
              </Link>

              <Link 
                to="/customer/reviews" 
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3 group-hover:bg-yellow-200 transition-colors duration-200">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Reviews</h3>
                    <p className="text-sm text-gray-500">Your product reviews</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Main Dashboard Content */}
            <div className="bg-white rounded-lg shadow-sm">
              <CustomerDashboardComponent user={user} />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CustomerDashboard; 