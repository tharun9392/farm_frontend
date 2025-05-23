import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import MainLayout from '../layouts/MainLayout';
import { updateQuantity, removeFromCart, clearCart } from '../features/cart/cartSlice';

const PublicCartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems, itemCount, subtotal, shipping, tax, total } = useSelector((state) => state.cart);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  
  // Cart totals with coupon discount applied
  const cartTotals = {
    subtotal,
    shipping,
    tax,
    total: couponApplied ? total - (subtotal * 0.1) : total,
    itemCount
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };
  
  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    dispatch(updateQuantity({ _id: itemId, quantity: newQuantity }));
  };
  
  // Handle remove item
  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
    toast.success('Item removed from cart');
  };
  
  // Handle apply coupon
  const handleApplyCoupon = () => {
    if (!couponCode) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    if (couponCode.toUpperCase() === 'RICE10') {
      setCouponApplied(true);
      toast.success('Coupon applied successfully!');
    } else {
      toast.error('Invalid coupon code');
    }
  };
  
  // Handle proceed to checkout
  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/customer/checkout');
    } else {
      navigate('/login', { state: { from: '/customer/checkout', message: 'Please login to complete your purchase' } });
    }
  };
  
  return (
    <MainLayout>
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <button 
              onClick={() => navigate('/shop')}
              className="mt-2 flex items-center text-green-600 hover:text-green-800"
            >
              <FaArrowLeft className="mr-2" />
              Continue Shopping
            </button>
          </div>
          
          {cartItems.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm text-center">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <FaShoppingCart size={96} />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-2 text-sm text-gray-500">
                Looks like you haven't added any products to your cart yet.
              </p>
              <div className="mt-6">
                <Link 
                  to="/shop" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
              <div className="lg:col-span-8">
                <div className="bg-white shadow-sm rounded-lg mb-8">
                  {/* Table Header */}
                  <div className="hidden lg:flex border-b border-gray-200 py-3 px-6">
                    <div className="flex-1 lg:w-3/5">Product</div>
                    <div className="lg:w-1/5 text-center">Price (kg)</div>
                    <div className="lg:w-1/5 text-center">Quantity (kg)</div>
                    <div className="lg:w-1/5 text-center">Total</div>
                  </div>
                  
                  {/* Cart Items */}
                  {cartItems.map((item) => (
                    <div 
                      key={item._id} 
                      className="py-6 px-4 sm:px-6 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Product Info */}
                        <div className="flex flex-1 lg:w-3/5">
                          <div className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded-md overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-center object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/fallback/rice-product.svg';
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full bg-gray-200 text-gray-500">
                                No Image
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-4 flex-1 flex flex-col">
                            <div>
                              <div className="flex justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {item.name}
                                </h3>
                                <button 
                                  onClick={() => handleRemoveItem(item._id)}
                                  className="text-red-600 hover:text-red-800 lg:hidden"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                            <div className="flex-1 flex items-end">
                              <p className="lg:hidden mt-1 text-sm text-gray-500">
                                Price: {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price (Desktop) */}
                        <div className="hidden lg:block lg:w-1/5 text-center text-gray-900">
                          {formatCurrency(item.price)}
                        </div>
                        
                        {/* Quantity */}
                        <div className="mt-4 lg:mt-0 lg:w-1/5">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleQuantityChange(item._id, Math.max(1, item.quantity - 1))}
                              className="p-1 border border-gray-300 rounded-l-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                            >
                              <FaMinus size={12} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.availableQuantity || 99}
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                              className="p-0 w-10 border-t border-b border-gray-300 text-center text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-300 sm:text-sm"
                            />
                            <button
                              onClick={() => handleQuantityChange(item._id, Math.min(item.availableQuantity || 99, item.quantity + 1))}
                              className="p-1 border border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                          {item.availableQuantity && item.quantity > item.availableQuantity && (
                            <p className="mt-1 text-xs text-red-600 text-center">
                              Only {item.availableQuantity} in stock
                            </p>
                          )}
                        </div>
                        
                        {/* Total */}
                        <div className="mt-4 lg:mt-0 lg:w-1/5 flex justify-between items-center">
                          <span className="lg:hidden text-gray-500">Total:</span>
                          <span className="text-right lg:text-center font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          <button 
                            onClick={() => handleRemoveItem(item._id)}
                            className="hidden lg:block text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Cart Actions */}
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between">
                      <button
                        onClick={() => dispatch(clearCart())}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Clear cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-4">
                <div className="bg-white shadow-sm rounded-lg">
                  <div className="px-4 py-6 sm:px-6">
                    <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                    
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Shipping</p>
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(shipping)}</p>
                      </div>
                      
                      {couponApplied && (
                        <div className="flex items-center justify-between text-green-600">
                          <p className="text-sm">Discount (10%)</p>
                          <p className="text-sm font-medium">-{formatCurrency(subtotal * 0.1)}</p>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                        <p className="text-base font-medium text-gray-900">Order Total</p>
                        <p className="text-base font-medium text-gray-900">
                          {formatCurrency(
                            subtotal + shipping - (couponApplied ? subtotal * 0.1 : 0)
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {/* Coupon Code */}
                    <div className="mt-6">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Coupon code"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          disabled={couponApplied}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponApplied}
                          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            couponApplied
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          Apply
                        </button>
                      </div>
                      {couponApplied && (
                        <p className="mt-2 text-sm text-green-600">
                          Coupon RICE10 applied successfully!
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Try coupon code "RICE10" for 10% off your order!
                      </p>
                    </div>
                    
                    {/* Checkout Button */}
                    <div className="mt-6">
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-green-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PublicCartPage; 