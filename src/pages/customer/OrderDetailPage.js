import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import OrderTracking from '../../components/customer/OrderTracking';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Format currency helper
  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy, h:mm a');
  };
  
  // Get tracking status color
  const getStatusColor = (status) => {
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
  
  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrderById(orderId);
        setOrder(response.order);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
        setLoading(false);
        toast.error('Error loading order details');
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  // Handle order cancellation
  const handleCancelOrder = async () => {
    try {
      await orderService.cancelOrder(orderId, 'Customer requested cancellation');
      // Fetch updated order details
      const response = await orderService.getOrderById(orderId);
      setOrder(response.order);
      toast.success('Order cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error('Failed to cancel order. Please try again.');
    }
  };
  
  // Handle back to orders
  const handleBackToOrders = () => {
    navigate('/customer/orders');
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-center">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !order) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center">
              <p className="text-red-500">{error || 'Order not found'}</p>
              <button
                onClick={handleBackToOrders}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Breadcrumbs */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex space-x-2">
              <li>
                <Link to="/customer/dashboard" className="text-gray-500 hover:text-gray-700">
                  Dashboard
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" clipRule="evenodd" />
                </svg>
                <Link to="/customer/orders" className="ml-2 text-gray-500 hover:text-gray-700">
                  Orders
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-gray-800 font-medium">
                  Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                </span>
              </li>
            </ol>
          </nav>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Order Header */}
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Order Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Order Information</h2>
                  <dl className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Order Status</dt>
                      <dd className="text-sm text-gray-900">{order.status}</dd>
                    </div>
                    
                    {order.isPaid ? (
                      <div className="grid grid-cols-2 gap-4">
                        <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                        <dd className="text-sm text-green-600">Paid on {formatDate(order.paidAt)}</dd>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                        <dd className="text-sm text-yellow-600">Pending</dd>
                      </div>
                    )}
                    
                    {order.isDelivered ? (
                      <div className="grid grid-cols-2 gap-4">
                        <dt className="text-sm font-medium text-gray-500">Delivery Status</dt>
                        <dd className="text-sm text-green-600">Delivered on {formatDate(order.deliveredAt)}</dd>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <dt className="text-sm font-medium text-gray-500">Delivery Status</dt>
                        <dd className="text-sm text-gray-600">Not Delivered</dd>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                      <dd className="text-sm text-gray-900">{order.paymentMethod}</dd>
                    </div>
                    
                    {order.tracking?.trackingNumber && (
                      <div className="grid grid-cols-2 gap-4">
                        <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
                        <dd className="text-sm text-gray-900">{order.tracking.trackingNumber}</dd>
                      </div>
                    )}
                    
                    {order.tracking?.carrier && (
                      <div className="grid grid-cols-2 gap-4">
                        <dt className="text-sm font-medium text-gray-500">Carrier</dt>
                        <dd className="text-sm text-gray-900">{order.tracking.carrier}</dd>
                      </div>
                    )}
                  </dl>
                  
                  {/* Order Actions */}
                  <div className="mt-6 flex space-x-4">
                    {!order.isDelivered && order.status !== 'Cancelled' ? (
                      <button
                        type="button"
                        onClick={handleCancelOrder}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Cancel Order
                      </button>
                    ) : null}
                    
                    {order.isDelivered && order.status !== 'Cancelled' && (
                      <Link
                        to={`/customer/reviews/write?orderId=${order._id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Write a Review
                      </Link>
                    )}
                    
                    <button
                      type="button"
                      onClick={handleBackToOrders}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Back to Orders
                    </button>
                  </div>
                </div>
                
                {/* Shipping Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
                  <dl className="mt-4 space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <address className="not-italic">
                          {order.shippingAddress.street}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                          {order.shippingAddress.country}
                        </address>
                      </dd>
                    </div>
                    
                    {/* Delivery Updates */}
                    {order.tracking?.updates && order.tracking.updates.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Delivery Updates</dt>
                        <dd className="mt-1">
                          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                            {order.tracking.updates.map((update, index) => (
                              <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                <div className="w-0 flex-1 flex items-center">
                                  <span className="ml-2 flex-1 w-0 truncate">
                                    <span className="font-medium">{update.status}</span>
                                    {update.location && (
                                      <span className="ml-2 text-gray-500">at {update.location}</span>
                                    )}
                                    <br />
                                    <span className="text-gray-500">
                                      {formatDate(update.timestamp)}
                                    </span>
                                    {update.description && (
                                      <p className="mt-1 text-gray-600">{update.description}</p>
                                    )}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Order Tracking and Delivery Date */}
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Order Tracking</h2>
              <OrderTracking status={order.status} />
              <div className="mt-4">
                <span className="text-sm text-gray-600">Estimated Delivery Date: </span>
                <span className="text-base font-semibold text-green-700">
                  {order.estimatedDeliveryDate ? formatDate(order.estimatedDeliveryDate) : '2-5 days from order date'}
                </span>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
              <div className="mt-4 border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                  {order.orderItems.map((item) => (
                    <div key={item._id} className="py-4 flex sm:items-center">
                      {/* Product Image */}
                      <div className="flex-shrink-0 h-20 w-20 bg-gray-200 rounded-md overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-center object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="ml-6 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>
                              <Link to={`/customer/shop/product/${item.inventory}`} className="hover:text-primary-600">
                                {item.name}
                              </Link>
                            </h3>
                            <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.packageSize} kg package
                          </p>
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <p className="text-gray-500">Qty {item.quantity}</p>
                          <p className="text-gray-500">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              <div className="mt-4">
                <dl className="divide-y divide-gray-200">
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm text-gray-600">Subtotal</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(order.itemsPrice)}</dd>
                  </div>
                  
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm text-gray-600">GST (5%)</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(order.taxPrice)}</dd>
                  </div>
                  
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm text-gray-600">Shipping</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {order.shippingPrice === 0 
                        ? 'Free' 
                        : formatCurrency(order.shippingPrice)}
                    </dd>
                  </div>
                  
                  <div className="py-4 flex justify-between">
                    <dt className="text-base font-medium text-gray-900">Total</dt>
                    <dd className="text-base font-medium text-gray-900">{formatCurrency(order.totalPrice)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetailPage; 