import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import productService from '../../services/productService';
import saleService from '../../services/saleService';

const ProductSellPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    quantity: '',
    unit: 'kg',
    buyerType: 'central_inventory',
    buyer: 'Rice Platform',
    paymentMethod: 'bank_transfer',
    notes: ''
  });
  
  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductById(productId);
        setProduct(response.product);
        
        // Set default unit based on product
        if (response.product?.unit) {
          setFormData(prev => ({
            ...prev,
            unit: response.product.unit
          }));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product information');
        setLoading(false);
        toast.error('Could not load product details');
      }
    };
    
    if (productId) {
      fetchProductData();
    }
  }, [productId]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? (value === '' ? '' : Number(value)) : value
    }));
  };
  
  // Calculate total amount based on quantity and price
  const calculateTotal = () => {
    if (!product || !formData.quantity) return 0;
    return product.price * formData.quantity;
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.quantity || formData.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    if (formData.quantity > product.availableQuantity) {
      toast.error(`Only ${product.availableQuantity} ${product.unit} available`);
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Create sale record
      const saleData = {
        productId: product._id,
        ...formData,
        // Don't need to send totalAmount as it will be calculated on the server
      };
      
      const response = await saleService.createSale(saleData);
      
      toast.success('Sale recorded successfully!');
      setSubmitting(false);
      
      // Redirect to sales history
      navigate('/farmer/sales');
    } catch (err) {
      console.error('Error creating sale:', err);
      toast.error(err.message || 'Failed to record sale. Please try again.');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Sell Product</h1>
            <div className="mt-6 flex justify-center">
              <div className="loader" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !product) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Sell Product</h1>
            <div className="mt-6 text-center">
              <p className="text-red-500">{error || 'Product not found'}</p>
              <button
                onClick={() => navigate('/farmer/products')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to Products
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
          <h1 className="text-2xl font-semibold text-gray-900">Sell Product</h1>
          
          <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
            {/* Product Summary */}
            <div className="bg-gray-50 px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="h-16 w-16 object-cover rounded"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
                
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900">{product.name}</h2>
                  <p className="text-sm text-gray-500">
                    Price: ₹{product.price}/{product.unit} · Available: {product.availableQuantity} {product.unit}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Sale Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity *
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      min="0.1"
                      step="0.1"
                      max={product.availableQuantity}
                      required
                      value={formData.quantity}
                      onChange={handleChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Enter quantity"
                    />
                    <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      {product.unit}
                    </span>
                  </div>
                  {formData.quantity > product.availableQuantity && (
                    <p className="mt-2 text-sm text-red-600">
                      Quantity exceeds available stock
                    </p>
                  )}
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="buyerType" className="block text-sm font-medium text-gray-700">
                    Buyer Type
                  </label>
                  <select
                    id="buyerType"
                    name="buyerType"
                    value={formData.buyerType}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="central_inventory">Central Inventory</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="direct_customer">Direct Customer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="buyer" className="block text-sm font-medium text-gray-700">
                    Buyer Name *
                  </label>
                  <input
                    type="text"
                    name="buyer"
                    id="buyer"
                    required
                    value={formData.buyer}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="credit">Credit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Additional notes or details"
                  />
                </div>
              </div>
              
              {/* Summary */}
              <div className="mt-6 bg-gray-50 px-4 py-5 rounded-md">
                <h3 className="text-lg font-medium text-gray-900">Sale Summary</h3>
                <div className="mt-2 flex justify-between">
                  <p className="text-sm text-gray-500">Unit Price:</p>
                  <p className="text-sm font-medium text-gray-900">₹{product.price}/{product.unit}</p>
                </div>
                <div className="mt-1 flex justify-between">
                  <p className="text-sm text-gray-500">Quantity:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formData.quantity || 0} {product.unit}
                  </p>
                </div>
                <div className="mt-1 pt-2 border-t border-gray-200 flex justify-between">
                  <p className="text-base font-medium text-gray-900">Total Amount:</p>
                  <p className="text-base font-bold text-gray-900">₹{calculateTotal().toFixed(2)}</p>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/farmer/products')}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || formData.quantity <= 0 || formData.quantity > product.availableQuantity}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Processing...' : 'Record Sale'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductSellPage; 