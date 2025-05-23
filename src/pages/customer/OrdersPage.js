import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Get status background color
  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Packed':
      case 'Shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Returned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Check authentication status
  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      toast.error('Please log in to view your orders');
      navigate('/login', { state: { from: '/customer/orders' } });
      return false;
    }
    
    if (user.role !== 'customer') {
      toast.error('Access restricted to customers only');
      navigate('/');
      return false;
    }
    
    return true;
  };
  
  // Fetch customer orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!checkAuthentication()) return;
      
      try {
        setLoading(true);
        
        // Build query parameters
        const params = {};
        if (statusFilter) {
          params.status = statusFilter;
        }
        
        const response = await orderService.getUserOrders(params);
        setOrders(response.orders || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        
        // Handle 403 Forbidden specifically
        if (err.response && err.response.status === 403) {
          toast.error('You do not have permission to view these orders. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          navigate('/login', { state: { from: '/customer/orders' } });
        } else {
          setError('Failed to load your orders. Please try again.');
          toast.error('Error loading orders: ' + (err.formattedMessage || err.message || 'Unknown error'));
        }
        
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [statusFilter, navigate]);
  
  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
          
          {/* Filter Controls */}
          <div className="mt-4 bg-white shadow rounded-lg p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="w-full md:w-1/3">
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
                  Filter by Status
                </label>
                <select
                  id="statusFilter"
                  name="statusFilter"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">All Orders</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
              
              <div className="w-full md:w-1/3 flex items-end">
                <Link
                  to="/customer/shop"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
          
          {/* Orders List */}
          <div className="mt-6">
            {loading ? (
              <div className="flex justify-center">
                <div className="spinner"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : orders.length === 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {statusFilter ? `No ${statusFilter} orders found` : 'No orders yet'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start shopping to place your first order.
                </p>
                <div className="mt-6">
                  <Link
                    to="/customer/shop"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {orders.map(order => (
                    <li key={order._id} className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          {/* Order ID and Date */}
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                            </h3>
                            <p className="mt-1 sm:mt-0 sm:ml-4 text-sm text-gray-500">
                              Placed on {order.createdAt && formatDate(order.createdAt)}
                            </p>
                          </div>
                          
                          {/* Order Status */}
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBgColor(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus}
                            </span>
                            {order.isDelivered && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Delivered on {formatDate(order.deliveredAt)}
                              </span>
                            )}
                            {order.isPaid && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Paid on {formatDate(order.paidAt)}
                              </span>
                            )}
                          </div>
                          
                          {/* Order Items Summary */}
                          <div className="mt-3 text-sm text-gray-600">
                            <span className="font-medium">
                              {order.orderItems.reduce((acc, item) => acc + item.quantity, 0)} items
                            </span>
                            <span className="mx-1">•</span>
                            <span>{formatCurrency(order.totalPrice)}</span>
                          </div>
                          
                          {/* Order Items Preview */}
                          <div className="mt-3 grid grid-cols-6 gap-2">
                            {order.orderItems.slice(0, 4).map((item, index) => (
                              <div key={item._id || index} className="col-span-1 h-12 w-12 bg-gray-200 rounded-md overflow-hidden">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                    No Image
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.orderItems.length > 4 && (
                              <div className="col-span-1 h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-600 text-xs font-medium">
                                +{order.orderItems.length - 4} more
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="mt-4 lg:mt-0 space-y-3 lg:space-y-0 lg:flex lg:flex-col lg:space-y-3">
                          <Link
                            to={`/customer/orders/${order._id}`}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            View Order
                          </Link>
                          
                          {!order.isDelivered && order.orderStatus !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={() => orderService.cancelOrder(order._id, 'Customer requested cancellation')}
                              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Cancel Order
                            </button>
                          )}
                          
                          {order.isDelivered && !order.isReviewed && (
                            <Link
                              to={`/customer/reviews/write?orderId=${order._id}`}
                              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Write a Review
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage; 