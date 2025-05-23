import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import orderService from '../../services/orderService';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        console.log('Fetching order details for ID:', orderId);
        const response = await orderService.getOrderById(orderId);
        console.log('Order details response:', response);
        
        // Handle different response formats
        const orderData = response.order || response;
        
        // Make sure items are properly formatted
        if (orderData) {
          // Normalize the items array structure
          if (orderData.orderItems && !orderData.items) {
            orderData.items = orderData.orderItems;
          }
          
          // Ensure each item has required display fields
          if (orderData.items && Array.isArray(orderData.items)) {
            orderData.items = orderData.items.map(item => {
              // Handle cases where the item might be nested in a product field
              const normalizedItem = item.product ? { 
                ...item.product, 
                quantity: item.quantity 
              } : item;
              
              return normalizedItem;
            });
          }
        }
        
        setOrder(orderData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Could not load order details.');
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrder();
    } else {
      setError('Order ID is missing. Please check your URL.');
      setLoading(false);
    }
  }, [orderId]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="bg-white rounded-2xl shadow-2xl p-10 border-l-8 border-green-500 max-w-lg w-full text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="bg-green-100 text-green-700 rounded-full p-4">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7 12a5 5 0 1110 0 5 5 0 01-10 0z" /></svg>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-green-700 mb-2">Thank you for your order!</h1>
          <p className="text-lg text-gray-700 mb-6">Your order has been placed successfully.</p>
          <div className="mb-6">
            <span className="text-gray-500">Order Number:</span>
            <span className="ml-2 text-xl font-bold text-green-800">
              {order?.orderNumber || 
               (orderId && `#${orderId.slice(-6).toUpperCase()}`) || 
               'Processing'}
            </span>
          </div>
          <Link to={`/customer/orders/${orderId}`} className="inline-block px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow hover:bg-green-700 transition-all duration-200">View Order Details</Link>
        </div>
        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-200 max-w-2xl w-full">
          {loading ? (
            <div className="text-center text-green-700 font-semibold">Loading order details...</div>
          ) : error ? (
            <div className="text-center text-red-600 font-semibold">{error}</div>
          ) : order ? (
            <>
              <h2 className="text-xl font-bold text-green-700 mb-4">Order Details</h2>
              <div className="mb-4 text-left">
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Payment Method:</span> 
                  <span className="ml-2">{order.paymentMethod}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Payment Status:</span> 
                  {order.isPaid ? 
                    <span className="ml-2 text-green-600 font-bold">Paid</span> : 
                    <span className="ml-2 text-yellow-600 font-bold">
                      {order.paymentMethod === 'Cash on Delivery' ? 'Pay on Delivery' : 'Pending'}
                    </span>
                  }
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Shipping Address:</span> 
                  <span className="ml-2 text-gray-700">
                    {order.shippingAddress?.addressLine1}, 
                    {order.shippingAddress?.city}, 
                    {order.shippingAddress?.state}, 
                    {order.shippingAddress?.postalCode}, 
                    {order.shippingAddress?.country}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Items:</h3>
                <ul className="divide-y divide-green-100">
                  {(order.items || order.orderItems || []).map((item, index) => {
                    const itemName = item.name || item.product?.name || `Product ${index + 1}`;
                    const itemPrice = item.price || 0;
                    const itemQuantity = item.quantity || 1;
                    const itemImage = item.image || item.product?.image;
                    
                    return (
                      <li key={item._id || index} className="py-2 flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden mr-3">
                          {itemImage ? (
                            <img src={itemImage} alt={itemName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">No Image</div>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{itemName}</div>
                          <div className="text-xs text-gray-600">Qty: {itemQuantity} &times; ₹{itemPrice}</div>
                        </div>
                        <div className="font-bold text-green-700 ml-2">₹{itemPrice * itemQuantity}</div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex flex-col gap-2 text-right border-t pt-4">
                <div><span className="text-gray-700">Subtotal:</span> <span className="font-bold">₹{order.itemsPrice}</span></div>
                <div><span className="text-gray-700">GST (5%):</span> <span className="font-bold">₹{order.taxPrice}</span></div>
                <div><span className="text-gray-700">Shipping:</span> <span className="font-bold">{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span></div>
                <div className="text-lg font-extrabold text-green-800 mt-2">Order Total: ₹{order.totalPrice}</div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderConfirmationPage; 