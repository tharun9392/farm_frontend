import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import productService from '../../services/productService';
import ProductImage from '../../components/common/ProductImage';
import { FaSpinner } from 'react-icons/fa';

const ProcessPaddyPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [approvedPaddy, setApprovedPaddy] = useState([]);
  const [selectedPaddy, setSelectedPaddy] = useState(null);
  const [processingPaddy, setProcessingPaddy] = useState(false);
  
  // Form data for rice conversion
  const [conversionForm, setConversionForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    availableQuantity: '',
    stockQuantity: '',
    conversionRate: 0.7, // Default: 0.7kg of rice from 1kg of paddy
    images: []
  });

  useEffect(() => {
    fetchApprovedPaddy();
  }, []);

  // Update form when paddy is selected
  useEffect(() => {
    if (selectedPaddy) {
      // Pre-fill form with paddy data
      setConversionForm({
        name: `${selectedPaddy.name.replace('Paddy', '').trim()} Rice`,
        description: `Processed rice from premium quality ${selectedPaddy.name}. ${selectedPaddy.description}`,
        category: selectedPaddy.category,
        riceType: selectedPaddy.riceType,
        price: Math.round(selectedPaddy.farmerPrice * 1.5), // 50% markup on farmer price
        availableQuantity: Math.round(selectedPaddy.availableQuantity * 0.7), // Default conversion rate
        stockQuantity: Math.round(selectedPaddy.stockQuantity * 0.7), 
        conversionRate: 0.7,
        paddySource: selectedPaddy._id,
        images: selectedPaddy.images || []
      });
    }
  }, [selectedPaddy]);

  const fetchApprovedPaddy = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const response = await api.get('/products', { 
        params: { 
          status: 'approved', 
          showAll: true,
          isProcessedRice: false, // Only fetch raw paddy products, not processed rice
          _t: timestamp
        } 
      });
      console.log('Fetched approved paddy products:', response.data.products);
      setApprovedPaddy(response.data.products || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching approved paddy products:', error);
      toast.error('Failed to load approved paddy products');
      setLoading(false);
    }
  };

  const handlePaddySelect = (paddy) => {
    setSelectedPaddy(paddy);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle special case for conversion rate
    if (name === 'conversionRate' && selectedPaddy) {
      const rate = parseFloat(value);
      if (!isNaN(rate)) {
        // Update available quantity based on conversion rate
        const availableQty = Math.round(selectedPaddy.availableQuantity * rate);
        setConversionForm(prev => ({
          ...prev,
          conversionRate: rate,
          availableQuantity: availableQty,
          stockQuantity: availableQty
        }));
        return;
      }
    }
    
    setConversionForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleProcessPaddy = async (e) => {
    e.preventDefault();
    
    if (!selectedPaddy) {
      toast.error('Please select a paddy to process');
      return;
    }
    
    try {
      setProcessingPaddy(true);
      
      // Validation
      if (!conversionForm.name.trim()) {
        throw new Error('Product name is required');
      }
      
      if (!conversionForm.description || conversionForm.description.length < 10) {
        throw new Error('Description must be at least 10 characters');
      }
      
      if (!conversionForm.price || conversionForm.price <= 0) {
        throw new Error('Price must be greater than zero');
      }
      
      if (!conversionForm.availableQuantity || conversionForm.availableQuantity <= 0) {
        throw new Error('Available quantity must be greater than zero');
      }
      
      // Create the processed rice product
      const riceProduct = {
        name: conversionForm.name,
        description: conversionForm.description,
        category: conversionForm.category,
        riceType: conversionForm.riceType,
        price: conversionForm.price,
        availableQuantity: conversionForm.availableQuantity,
        stockQuantity: conversionForm.stockQuantity,
        images: conversionForm.images,
        paddySource: selectedPaddy._id,
        paddyToRiceConversion: {
          rate: conversionForm.conversionRate,
          processingCost: Math.round((conversionForm.price - selectedPaddy.farmerPrice) * 0.3) // 30% of markup as processing cost
        },
        farmer: selectedPaddy.farmer?._id || selectedPaddy.farmer,
        organicCertified: selectedPaddy.organicCertified,
        harvestedDate: selectedPaddy.harvestedDate
      };
      
      console.log('Creating processed rice product:', riceProduct);
      
      // Send to server
      const response = await productService.createProduct(riceProduct);
      
      // Show success message
      toast.success('Paddy successfully processed into rice!');
      
      // Reset form and selection
      setSelectedPaddy(null);
      setConversionForm({
        name: '',
        description: '',
        category: '',
        price: '',
        availableQuantity: '',
        stockQuantity: '',
        conversionRate: 0.7,
        images: []
      });
      
      // Refresh paddy list
      fetchApprovedPaddy();
      
      // Optional: Navigate to the products page
      navigate('/admin/products');
    } catch (error) {
      console.error('Error processing paddy:', error);
      toast.error(error.message || 'Failed to process paddy into rice');
    } finally {
      setProcessingPaddy(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Process Paddy to Rice</h1>
          <p className="mt-2 text-sm text-gray-700">
            Convert approved paddy from farmers into processed rice products for customers.
          </p>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Paddy Selection Panel */}
              <div className="col-span-1 bg-white shadow rounded-lg p-4 overflow-auto max-h-[calc(100vh-200px)]">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Available Paddy</h2>
                
                {approvedPaddy.length === 0 ? (
                  <div className="text-center p-4 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-700">
                      No approved paddy available for processing. Approve farmer submissions first.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {approvedPaddy.map((paddy) => (
                      <li 
                        key={paddy._id} 
                        className={`py-3 px-2 cursor-pointer hover:bg-gray-50 rounded-md transition ${
                          selectedPaddy?._id === paddy._id ? 'bg-primary-50 border border-primary-200' : ''
                        }`}
                        onClick={() => handlePaddySelect(paddy)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <ProductImage 
                              src={paddy.images?.[0]} 
                              alt={paddy.name} 
                              className="h-full w-full object-cover object-center" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{paddy.name}</p>
                            <p className="text-xs text-gray-500">
                              Qty: {paddy.availableQuantity} {paddy.unit} | ₹{paddy.farmerPrice}/{paddy.unit}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              Farmer: {paddy.farmer?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {/* Processing Form */}
              <div className="col-span-2 bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedPaddy ? `Process: ${selectedPaddy.name}` : 'Select Paddy to Process'}
                </h2>
                
                {!selectedPaddy ? (
                  <div className="text-center p-8 bg-gray-50 rounded-md">
                    <p className="text-gray-500">
                      Please select a paddy from the left panel to start processing.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleProcessPaddy} className="space-y-4">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                      <div className="sm:col-span-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Product Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={conversionForm.name}
                            onChange={handleInputChange}
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label htmlFor="conversionRate" className="block text-sm font-medium text-gray-700">
                          Conversion Rate
                        </label>
                        <div className="mt-1">
                          <select
                            id="conversionRate"
                            name="conversionRate"
                            value={conversionForm.conversionRate}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          >
                            <option value="0.5">50% (0.5kg rice per 1kg paddy)</option>
                            <option value="0.6">60% (0.6kg rice per 1kg paddy)</option>
                            <option value="0.7">70% (0.7kg rice per 1kg paddy)</option>
                            <option value="0.8">80% (0.8kg rice per 1kg paddy)</option>
                            <option value="0.9">90% (0.9kg rice per 1kg paddy)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Selling Price (₹/{selectedPaddy.unit})
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="price"
                            id="price"
                            min="1"
                            step="0.01"
                            value={conversionForm.price}
                            onChange={handleInputChange}
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="availableQuantity" className="block text-sm font-medium text-gray-700">
                          Processed Quantity ({selectedPaddy.unit})
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="availableQuantity"
                            id="availableQuantity"
                            min="1"
                            step="0.1"
                            value={conversionForm.availableQuantity}
                            onChange={handleInputChange}
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Based on {selectedPaddy.availableQuantity} {selectedPaddy.unit} of paddy at {conversionForm.conversionRate * 100}% conversion rate
                          </p>
                        </div>
                      </div>
                      
                      <div className="sm:col-span-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={conversionForm.description}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            required
                            minLength={10}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-5 border-t border-gray-200">
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setSelectedPaddy(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={processingPaddy}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          {processingPaddy ? (
                            <>
                              <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                              Processing...
                            </>
                          ) : 'Process Paddy to Rice'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProcessPaddyPage; 