import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Import components
import Layout from '../../layouts/Layout';
import CustomerDashboardComponent from '../../components/customer/CustomerDashboard';
import Loader from '../../components/common/Loader';

const CustomerDashboard = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Any dashboard initialization code can go here
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
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="mb-6 text-gray-600">You need to be logged in to view your dashboard.</p>
          <Link 
            to="/login" 
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Login
          </Link>
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
              <p className="text-gray-600">Manage your orders, reviews, and account information</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                to="/customer/shop" 
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Shop Now
              </Link>
            </div>
          </div>
          
          <CustomerDashboardComponent user={user} />
        </div>
      </Layout>
    </>
  );
};

export default CustomerDashboard; 