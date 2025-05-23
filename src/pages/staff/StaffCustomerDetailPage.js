import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import userService from '../../services/userService';
import Loader from '../../components/common/Loader';

const StaffCustomerDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
    fetchUserOrders();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserById(userId);
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details. Please try again.');
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await api.get(`/orders/user/${userId}`);
      setOrders(response.data.orders || []);
      setOrdersLoading(false);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      toast.error('Failed to load user orders.');
      setOrders([]);
      setOrdersLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await userService.updateUserStatus(userId, newStatus);
      toast.success(`User status updated to ${newStatus}`);
      fetchUserDetails(); // Refresh the data
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Breadcrumb */}
          <div className="mb-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div>
                    <Link to="/staff/dashboard" className="text-gray-400 hover:text-gray-500">
                      Dashboard
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                    <Link to="/staff/customers" className="ml-4 text-gray-400 hover:text-gray-500">
                      Customers
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                    <span className="ml-4 text-gray-500">
                      Customer Details
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : !user ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h2 className="text-xl font-medium text-red-600">User not found</h2>
              <p className="mt-1 text-gray-500">
                The requested user could not be found or you don't have permission to view it.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
                <div className="border-b border-gray-200 bg-white px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-24 w-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="h-24 w-24 rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.classList.add('avatar-fallback');
                          }}
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-6">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {user.name || 'Unnamed User'}
                      </h1>
                      <p className="text-sm text-gray-500">
                        {user.email || 'No email provided'}
                      </p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(user.status)}`}>
                          {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Phone
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.phone || 'Not provided'}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Registered On
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDate(user.createdAt)}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Account Status
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Is Active
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.isActive ? 'Yes' : 'No'}
                        </dd>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-medium text-gray-900">Address Information</h2>
                    {user.address ? (
                      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Street
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {user.address.street || 'Not provided'}
                          </dd>
                        </div>
                        
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            City
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {user.address.city || 'Not provided'}
                          </dd>
                        </div>
                        
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            State
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {user.address.state || 'Not provided'}
                          </dd>
                        </div>
                        
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Zip Code
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {user.address.zipCode || 'Not provided'}
                          </dd>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">No address information provided.</p>
                    )}
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-medium text-gray-900">Actions</h2>
                    <div className="mt-4 flex flex-wrap gap-4">
                      {user.status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange('active')}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Activate Account
                        </button>
                      )}
                      
                      {user.status !== 'blocked' && (
                        <button
                          onClick={() => handleStatusChange('blocked')}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Block Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Orders Section */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Order History
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Recent orders placed by this customer
                  </p>
                </div>
                
                {ordersLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This customer hasn't placed any orders yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">View</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.orderNumber || order._id.substring(0, 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusBadgeClass(order.status)}`}>
                                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{order.totalAmount?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link to={`/staff/orders/${order._id}`} className="text-primary-600 hover:text-primary-900">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffCustomerDetailPage; 