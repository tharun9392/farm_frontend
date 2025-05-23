import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { FaCheckCircle, FaRegCircle, FaClock, FaTimesCircle, FaBox, FaShippingFast, FaTruck, FaHome, FaRegCalendarCheck } from 'react-icons/fa';

const OrderTracking = ({ order }) => {
  if (!order) return null;

  // Handle different field names (status vs orderStatus)
  const orderStatus = order.status || order.orderStatus;
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy, h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  // Define all possible order statuses in sequence
  const orderStatuses = [
    { key: 'Pending', label: 'Order Placed', icon: FaClock, description: 'Your order has been received and is awaiting confirmation.' },
    { key: 'Processing', label: 'Processing', icon: FaBox, description: 'Your order has been confirmed and is being processed.' },
    { key: 'Packed', label: 'Packed', icon: FaBox, description: 'Your order has been packed and is ready for shipping.' },
    { key: 'Shipped', label: 'Shipped', icon: FaShippingFast, description: 'Your order has been shipped and is on its way.' },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: FaTruck, description: 'Your order is out for delivery and will arrive soon.' },
    { key: 'Delivered', label: 'Delivered', icon: FaHome, description: 'Your order has been delivered.' },
  ];

  // If the order is cancelled, we need special handling
  const isCancelled = orderStatus === 'Cancelled';
  const isReturned = orderStatus === 'Returned';
  const isRefunded = orderStatus === 'Refunded';

  // Get the current status of the order
  const currentStatusIndex = orderStatuses.findIndex(status => status.key === orderStatus);
  
  // If the order is cancelled or returned, we'll show a different view
  if (isCancelled || isReturned || isRefunded) {
    return (
      <div className="rounded-lg bg-white shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Order Status</h3>
        
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <FaTimesCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="ml-4">
            <p className="text-base font-medium text-gray-900">{orderStatus}</p>
            <p className="text-sm text-gray-500">
              {isCancelled && 'Your order has been cancelled.'}
              {isReturned && 'Your order has been returned.'}
              {isRefunded && 'A refund has been processed for your order.'}
            </p>
            {order.cancellationReason && (
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium">Reason:</span> {order.cancellationReason}
              </p>
            )}
          </div>
        </div>
        
        {/* Show status history */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="mt-6">
            <h4 className="text-base font-medium text-gray-900 mb-3">Status History</h4>
            <div className="border-t border-gray-200">
              {order.statusHistory.map((status, idx) => (
                <div key={idx} className="flex py-3 border-b border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{status.status}</p>
                    {status.note && <p className="text-xs text-gray-500">{status.note}</p>}
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(status.date)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Order Status</h3>
      
      {/* Current Status Summary */}
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0">
          {currentStatusIndex >= 0 && orderStatuses[currentStatusIndex].icon && 
            React.createElement(orderStatuses[currentStatusIndex].icon, { className: "h-8 w-8 text-green-500" })}
        </div>
        <div className="ml-4">
          <p className="text-base font-medium text-gray-900">
            {currentStatusIndex >= 0 ? orderStatuses[currentStatusIndex].label : 'Processing'}
          </p>
          <p className="text-sm text-gray-500">
            {currentStatusIndex >= 0 ? orderStatuses[currentStatusIndex].description : ''}
          </p>
          {order.estimatedDeliveryDate && (
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">Estimated Delivery:</span> {formatDate(order.estimatedDeliveryDate)}
            </p>
          )}
        </div>
      </div>
      
      {/* Timeline Visualization */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        
        <div className="relative flex justify-between">
          {orderStatuses.map((status, idx) => {
            // Determine the status state (completed, current, or upcoming)
            const isCompleted = idx < currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            const isUpcoming = idx > currentStatusIndex;
            
            return (
              <div key={status.key} className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full">
                  {isCompleted ? (
                    <FaCheckCircle className="w-8 h-8 text-green-500" />
                  ) : isCurrent ? (
                    <FaRegCircle className="w-8 h-8 text-blue-500" />
                  ) : (
                    <FaRegCircle className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="mt-2 text-xs font-medium text-center">
                  <span className={`
                    ${isCompleted ? 'text-green-600' : ''}
                    ${isCurrent ? 'text-blue-600' : ''}
                    ${isUpcoming ? 'text-gray-500' : ''}
                  `}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Status History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="mt-8">
          <h4 className="text-base font-medium text-gray-900 mb-3">Status History</h4>
          <div className="border-t border-gray-200">
            {order.statusHistory.map((status, idx) => (
              <div key={idx} className="flex py-3 border-b border-gray-200">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{status.status}</p>
                  {status.note && <p className="text-xs text-gray-500">{status.note}</p>}
                </div>
                <p className="text-sm text-gray-500">{formatDate(status.date)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tracking Information */}
      {order.trackingNumber && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Tracking Number</p>
              <p className="text-sm text-gray-900">{order.trackingNumber}</p>
            </div>
            {order.courierProvider && (
              <div className="mt-2 sm:mt-0">
                <p className="text-sm font-medium text-gray-700">Courier</p>
                <p className="text-sm text-gray-900">{order.courierProvider}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

OrderTracking.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    status: PropTypes.string,
    orderStatus: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    estimatedDeliveryDate: PropTypes.string,
    trackingNumber: PropTypes.string,
    courierProvider: PropTypes.string,
    statusHistory: PropTypes.arrayOf(
      PropTypes.shape({
        status: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        note: PropTypes.string,
        updatedBy: PropTypes.string
      })
    ),
    cancellationReason: PropTypes.string
  }).isRequired
};

export default OrderTracking; 