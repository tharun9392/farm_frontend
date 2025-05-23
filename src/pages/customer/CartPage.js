import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../features/cart/cartSlice';
import { handleProductImageError, DEFAULT_RICE_PRODUCT_IMAGE } from '../../utils/imageUtils';

const CartPage = () => {
  const { items: cartItems, itemCount, subtotal, shipping, tax, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  
  // Update quantity function
  const updateItemQuantity = (itemId, newQuantity) => {
    dispatch(updateQuantity({ _id: itemId, quantity: newQuantity }));
  };
  
  // Remove from cart function
  const handleRemoveFromCart = (itemId) => {
    dispatch(removeFromCart(itemId));
  };
  
  // Navigate to checkout
  const handleCheckout = () => {
    navigate('/customer/checkout');
  };
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Shopping Cart</h1>
          
          {cartItems.length === 0 ? (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add some delicious rice products to your cart to continue shopping.
              </p>
              <div className="mt-6">
                <Link
                  to="/customer/shop"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Cart Items */}
              <div className="lg:col-span-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item._id} className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row">
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-full sm:w-24 h-24 bg-gray-200 rounded-md overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-center object-cover"
                                onError={handleProductImageError}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                          
                          {/* Product Details */}
                          <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">
                                  <Link to={`/customer/shop/product/${item._id}`} className="hover:text-primary-600">
                                    {item.name}
                                  </Link>
                                </h4>
                                <p className="mt-1 text-sm text-gray-500">
                                  {formatCurrency(item.price)} per kg
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromCart(item._id)}
                                className="ml-4 text-sm font-medium text-red-600 hover:text-red-500"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            
                            <div className="mt-4 sm:mt-2 flex items-center justify-between">
                              {/* Quantity Controls */}
                              <div className="flex items-center border rounded-md">
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(item._id, item.quantity - 1)}
                                  className="p-2 text-gray-500 hover:text-gray-600"
                                  disabled={item.quantity <= 1}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="px-2 py-1 text-gray-700">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(item._id, item.quantity + 1)}
                                  className="p-2 text-gray-500 hover:text-gray-600"
                                  disabled={item.quantity >= item.stockQuantity}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>
                              
                              {/* Subtotal */}
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-700">
                                  Subtotal: {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-4">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                  
                  <dl className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Subtotal</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</dd>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600">GST (5%)</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(tax)}</dd>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Shipping</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                      </dd>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                      <dt className="text-base font-medium text-gray-900">Order Total</dt>
                      <dd className="text-base font-medium text-gray-900">{formatCurrency(total)}</dd>
                    </div>
                  </dl>
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <Link
                      to="/customer/shop"
                      className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CartPage; 