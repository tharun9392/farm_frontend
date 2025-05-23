import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useSelector, useDispatch } from 'react-redux';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify';
import { clearCart } from '../../features/cart/cartSlice';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { items: cartItems, subtotal, tax, shipping, total } = useSelector((state) => state.cart);
  
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    },
    paymentMethod: 'Credit Card',
    saveAddress: true
  });
  
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email address is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.street.trim()) errors.street = 'Street address is required';
    if (!formData.address.city.trim()) errors.city = 'City is required';
    if (!formData.address.state.trim()) errors.state = 'State/Province is required';
    if (!formData.address.postalCode.trim()) errors.postalCode = 'ZIP/Postal code is required';
    if (!formData.address.country.trim()) errors.country = 'Country is required';
    return errors;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach(msg => toast.error(msg));
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create order from cart items
      const orderData = {
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        shippingAddress: {
          fullName: formData.firstName + ' ' + formData.lastName,
          addressLine1: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          postalCode: formData.address.postalCode,
          country: formData.address.country,
          phoneNumber: formData.phone
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total
      };
      
      // Debug: log the orderData being sent
      console.log('Order data being sent:', orderData);
      
      // Create order
      try {
        const response = await orderService.createOrder(orderData);
        console.log('Order creation response:', response);
        
        // Success path - handle based on payment method
        if (formData.paymentMethod === 'Cash on Delivery') {
          // For COD, simply redirect to confirmation page
          toast.success('Order placed successfully with Cash on Delivery!');
          dispatch(clearCart());
          navigate(`/customer/order-confirmation/${response._id || response.order?._id}`);
        } else {
          // For other payment methods, we would handle payment processing here
          // For now, just simulate a successful payment
          toast.success('Order placed successfully!');
          dispatch(clearCart());
          navigate(`/customer/order-confirmation/${response._id || response.order?._id}`);
          
          // In a real implementation, we would:
          // 1. Initialize payment gateway (Razorpay, Stripe, etc.)
          // 2. Redirect to payment page or open payment modal
          // 3. Process payment and handle success/failure
        }
      } catch (orderError) {
        console.error('Order creation error:', orderError);
        
        if (orderError.response?.data?.message) {
          toast.error(`Order creation failed: ${orderError.response.data.message}`);
        } else {
          toast.error('Failed to create order. Please try again.');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      if (error.response) {
        console.error('Backend error response:', error.response.data);
        // Print the message property if it exists
        if (error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
          console.error('Backend error message:', error.response.data.message);
        } else {
          toast.error('Failed to place order. Please try again.');
          console.error('Backend error (no message property):', error.response.data);
        }
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Return to cart
  const handleBackToCart = () => {
    navigate('/customer/cart');
  };
  
  // Safe-guard: If cartItems is not an array, show an error message
  if (!Array.isArray(cartItems)) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Cart Error</h2>
            <p className="text-gray-700">There was a problem loading your cart. Please refresh the page or try again later.</p>
            <button onClick={() => navigate('/customer/cart')} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Go to Cart</button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="py-10 min-h-screen bg-white" style={{background: 'linear-gradient(120deg, #f0fdf4 0%, #ffffff 100%)'}}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 px-4 sm:px-6 md:px-8">
          {/* Left: Customer, Shipping, Payment */}
          <form className="lg:col-span-2 space-y-10" onSubmit={handleSubmit}>
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-green-400">
              <div className="flex items-center mb-4">
                <span className="bg-green-100 text-green-700 rounded-full p-2 mr-3">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.21 0 4.304.534 6.121 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </span>
                <h2 className="text-2xl font-extrabold text-green-700">Customer Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-green-800">First name</label>
                  <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} required className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm bg-green-50 ${formErrors.firstName ? 'border-red-500' : ''}`} />
                  {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-green-800">Last name</label>
                  <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} required className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm bg-green-50 ${formErrors.lastName ? 'border-red-500' : ''}`} />
                  {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-green-800">Email address</label>
                  <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm bg-green-50 ${formErrors.email ? 'border-red-500' : ''}`} />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-green-800">Phone number</label>
                  <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm bg-green-50 ${formErrors.phone ? 'border-red-500' : ''}`} />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>
              </div>
            </div>
            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-blue-400">
              <div className="flex items-center mb-4">
                <span className="bg-blue-100 text-blue-700 rounded-full p-2 mr-3">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4-9 4-9-4zm0 0v6a9 9 0 009 9 9 9 0 009-9V7" /></svg>
                </span>
                <h2 className="text-2xl font-extrabold text-blue-700">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="address.street" className="block text-sm font-semibold text-blue-800">Street address</label>
                  <input type="text" name="address.street" id="address.street" value={formData.address.street} onChange={handleChange} required className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50 ${formErrors.street ? 'border-red-500' : ''}`} />
                  {formErrors.street && <p className="text-red-500 text-xs mt-1">{formErrors.street}</p>}
                </div>
                <div>
                  <label htmlFor="address.city" className="block text-sm font-semibold text-blue-800">City</label>
                  <input type="text" name="address.city" id="address.city" value={formData.address.city} onChange={handleChange} required className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50 ${formErrors.city ? 'border-red-500' : ''}`} />
                  {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                </div>
                <div>
                  <label htmlFor="address.state" className="block text-sm font-semibold text-blue-800">State / Province</label>
                  <input type="text" name="address.state" id="address.state" value={formData.address.state} onChange={handleChange} required className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50 ${formErrors.state ? 'border-red-500' : ''}`} />
                  {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                </div>
                <div>
                  <label htmlFor="address.postalCode" className="block text-sm font-semibold text-blue-800">ZIP / Postal code</label>
                  <input type="text" name="address.postalCode" id="address.postalCode" value={formData.address.postalCode} onChange={handleChange} required className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50 ${formErrors.postalCode ? 'border-red-500' : ''}`} />
                  {formErrors.postalCode && <p className="text-red-500 text-xs mt-1">{formErrors.postalCode}</p>}
                </div>
                <div>
                  <label htmlFor="address.country" className="block text-sm font-semibold text-blue-800">Country</label>
                  <select name="address.country" id="address.country" value={formData.address.country} onChange={handleChange} className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-blue-50 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.country ? 'border-red-500' : ''}`}>
                    <option value="India">India</option>
                  </select>
                  {formErrors.country && <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>}
                </div>
                <div className="flex items-center mt-4 md:mt-0">
                  <input id="saveAddress" name="saveAddress" type="checkbox" checked={formData.saveAddress} onChange={handleChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <label htmlFor="saveAddress" className="ml-2 text-sm text-blue-700">Save this address for future orders</label>
                </div>
              </div>
            </div>
            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-purple-400">
              <div className="flex items-center mb-4">
                <span className="bg-purple-100 text-purple-700 rounded-full p-2 mr-3">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2z" /></svg>
                </span>
                <h2 className="text-2xl font-extrabold text-purple-700">Payment Method</h2>
              </div>
              <div className="space-y-4 mt-4">
                <div className="flex items-center">
                  <input id="creditCard" name="paymentMethod" type="radio" value="Credit Card" checked={formData.paymentMethod === 'Credit Card'} onChange={handleChange} className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300" />
                  <label htmlFor="creditCard" className="ml-3 block text-sm font-semibold text-purple-800">Credit Card</label>
                </div>
                <div className="flex items-center">
                  <input id="debitCard" name="paymentMethod" type="radio" value="Debit Card" checked={formData.paymentMethod === 'Debit Card'} onChange={handleChange} className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300" />
                  <label htmlFor="debitCard" className="ml-3 block text-sm font-semibold text-purple-800">Debit Card</label>
                </div>
                <div className="flex items-center">
                  <input id="upi" name="paymentMethod" type="radio" value="UPI" checked={formData.paymentMethod === 'UPI'} onChange={handleChange} className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300" />
                  <label htmlFor="upi" className="ml-3 block text-sm font-semibold text-purple-800">UPI</label>
                </div>
                <div className="flex items-center">
                  <input id="cod" name="paymentMethod" type="radio" value="Cash on Delivery" checked={formData.paymentMethod === 'Cash on Delivery'} onChange={handleChange} className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300" />
                  <label htmlFor="cod" className="ml-3 block text-sm font-semibold text-purple-800">Cash on Delivery</label>
                </div>
              </div>
            </div>
            {/* Place Order Button */}
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className={`inline-flex items-center px-8 py-3 border border-transparent text-lg font-bold rounded-xl shadow-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-all duration-200 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}> 
                {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </form>
          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 rounded-2xl shadow-2xl p-8 border-2 border-green-400">
              <h2 className="text-2xl font-extrabold text-green-800 mb-4 border-b-2 border-green-200 pb-2 flex items-center">
                <span className="bg-green-200 text-green-700 rounded-full p-2 mr-2">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h1l2 7h13l2-7H6" /></svg>
                </span>
                Order Summary
              </h2>
              <div className="mt-4 flow-root">
                <ul className="-my-4 divide-y divide-green-200">
                  {cartItems.map(item => (
                    <li key={item._id} className="py-4 flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-white border border-green-200 rounded-lg overflow-hidden shadow-sm">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-center object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-base font-semibold text-green-900">{item.name}</h3>
                        <p className="text-xs text-green-700">{item.quantity} kg</p>
                        <p className="text-xs text-green-700">{formatCurrency(item.price)} each</p>
                      </div>
                      <div className="ml-4 text-right font-bold text-green-800">{formatCurrency(item.price * item.quantity)}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <dl className="mt-6 space-y-4 border-t border-green-200 pt-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-green-700">Subtotal</dt>
                  <dd className="text-sm font-bold text-green-900">{formatCurrency(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-green-700">GST (5%)</dt>
                  <dd className="text-sm font-bold text-green-900">{formatCurrency(tax)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-green-700">Shipping</dt>
                  <dd className="text-sm font-bold text-green-900">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</dd>
                </div>
                <div className="border-t border-green-200 pt-4 flex items-center justify-between">
                  <dt className="text-lg font-extrabold text-green-900">Order Total</dt>
                  <dd className="text-lg font-extrabold text-green-900">{formatCurrency(total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CheckoutPage; 