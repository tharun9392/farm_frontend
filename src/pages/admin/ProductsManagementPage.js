import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaEdit, FaSearch, FaPlus } from 'react-icons/fa';
import DashboardLayout from '../../layouts/DashboardLayout';
import productService from '../../services/productService';
import inventoryService from '../../services/inventoryService';
import api from '../../services/api';

const ProductsManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    farmerId: '',
    quantityPurchased: '',
    purchasePrice: '',
    sellingPrice: '',
    packaging: {
      sizes: [{ weight: 1, price: 0, available: true }],
      defaultSize: 1
    },
    warehouseLocation: 'Main Warehouse',
    lowStockThreshold: 50
  });
  const [statusData, setStatusData] = useState({
    status: '',
    statusReason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Get all products including pending ones
        const response = await api.get('/products?showAll=true');
        setProducts(response.data.products || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products. Please try again.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term, status and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.farmer.name && product.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || product.status === statusFilter;
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Format category display name
  const formatCategory = (category) => {
    const categoryMap = {
      basmati: 'Basmati Rice',
      brown: 'Brown Rice',
      jasmine: 'Jasmine Rice',
      sona_masoori: 'Sona Masoori',
      ponni: 'Ponni Rice',
      other: 'Other Variety'
    };
    return categoryMap[category] || category;
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle purchase product 
  const handlePurchaseClick = (product) => {
    setSelectedProductId(product._id);
    setFormData({
      productId: product._id,
      farmerId: product.farmer._id,
      quantityPurchased: product.availableQuantity,
      purchasePrice: product.farmerPrice,
      sellingPrice: product.price,
      packaging: {
        sizes: [{ weight: 1, price: product.price, available: true }],
        defaultSize: 1
      },
      warehouseLocation: 'Main Warehouse',
      lowStockThreshold: 50
    });
    setPurchaseModalOpen(true);
  };
  
  // Handle status update click
  const handleStatusUpdateClick = (product) => {
    setSelectedProductId(product._id);
    setStatusData({
      status: product.status,
      statusReason: product.statusReason || ''
    });
    setStatusModalOpen(true);
  };

  // Close purchase modal
  const closePurchaseModal = () => {
    setPurchaseModalOpen(false);
    setSelectedProductId(null);
    setValidationErrors({});
  };

  // Close status modal
  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setSelectedProductId(null);
    setValidationErrors({});
  };

  // Handle form input changes for purchase
  const handlePurchaseChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData({
      ...formData,
      [name]: name === 'quantityPurchased' || name === 'purchasePrice' || name === 'sellingPrice' || name === 'lowStockThreshold'
        ? parseFloat(value) || ''
        : value
    });
  };

  // Handle form input changes for status
  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setStatusData({
      ...statusData,
      [name]: value
    });
  };

  // Validate purchase form
  const validatePurchaseForm = () => {
    const errors = {};
    
    if (!formData.quantityPurchased || formData.quantityPurchased <= 0) {
      errors.quantityPurchased = 'Please enter a valid quantity';
    }
    
    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      errors.purchasePrice = 'Please enter a valid purchase price';
    }
    
    if (!formData.sellingPrice || formData.sellingPrice <= 0) {
      errors.sellingPrice = 'Please enter a valid selling price';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate status form
  const validateStatusForm = () => {
    const errors = {};
    
    if (!statusData.status) {
      errors.status = 'Please select a status';
    }
    
    if (statusData.status === 'rejected' && !statusData.statusReason) {
      errors.statusReason = 'Please provide a reason for rejection';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle purchase submit
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePurchaseForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Purchase from farmer
      await inventoryService.purchaseFromFarmer(formData);
      
      // Update product status to approved
      await productService.updateProductStatus(selectedProductId, 'approved', 'Purchased by admin for inventory');
      
      // Update local state
      setProducts(products.map(p => 
        p._id === selectedProductId 
          ? { ...p, status: 'approved' } 
          : p
      ));
      
      toast.success('Product purchased successfully and added to inventory');
      closePurchaseModal();
      
    } catch (error) {
      console.error('Error purchasing product:', error);
      toast.error(error.formattedMessage || 'Failed to purchase product');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle status update submit
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStatusForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Update product status
      await productService.updateProductStatus(
        selectedProductId, 
        statusData.status, 
        statusData.statusReason
      );
      
      // Update local state
      setProducts(products.map(p => 
        p._id === selectedProductId 
          ? { ...p, status: statusData.status, statusReason: statusData.statusReason } 
          : p
      ));
      
      toast.success(`Product status updated to ${statusData.status}`);
      closeStatusModal();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Products Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Review, approve, or purchase products from farmers
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => navigate('/admin/add-product')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search products or farmers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <select
                id="status"
                name="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            {/* Category Filter */}
            <div>
              <select
                id="category"
                name="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">All Categories</option>
                <option value="basmati">Basmati Rice</option>
                <option value="brown">Brown Rice</option>
                <option value="jasmine">Jasmine Rice</option>
                <option value="sona_masoori">Sona Masoori</option>
                <option value="ponni">Ponni Rice</option>
                <option value="other">Other Variety</option>
              </select>
            </div>
          </div>
          
          {/* Products Table */}
          <div className="mt-8 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  {loading ? (
                    <div className="py-24 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading products...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="py-24 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your filters to find what you're looking for.
                      </p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Farmer
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                          <tr key={product._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {product.images && product.images.length > 0 ? (
                                    <img 
                                      className="h-10 w-10 rounded-full object-cover" 
                                      src={product.images[0]} 
                                      alt={product.name}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/images/fallback/rice-product.svg';
                                      }}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-500">
                                      <span className="text-xs">No IMG</span>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatCategory(product.category)} • {product.organicCertified ? 'Organic' : 'Non-Organic'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {product.farmer?.name || 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(product.status)}`}>
                                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                              </span>
                              {product.statusReason && (
                                <div className="text-xs text-gray-500 mt-1">{product.statusReason}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                ₹{product.price}/{product.unit || 'kg'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Farmer price: ₹{product.farmerPrice}/{product.unit || 'kg'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {product.availableQuantity} {product.unit || 'kg'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleStatusUpdateClick(product)}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                Update Status
                              </button>
                              {product.status === 'pending' && (
                                <button
                                  onClick={() => handlePurchaseClick(product)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Purchase
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {purchaseModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FaShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Purchase Product
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      This will purchase the product from the farmer and add it to your inventory.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5">
                <form onSubmit={handlePurchaseSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="quantityPurchased" className="block text-sm font-medium text-gray-700">
                        Quantity to Purchase
                      </label>
                      <input
                        type="number"
                        id="quantityPurchased"
                        name="quantityPurchased"
                        value={formData.quantityPurchased}
                        onChange={handlePurchaseChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                          validationErrors.quantityPurchased ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.quantityPurchased && (
                        <p className="mt-2 text-sm text-red-600">{validationErrors.quantityPurchased}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
                        Purchase Price (per unit)
                      </label>
                      <input
                        type="number"
                        id="purchasePrice"
                        name="purchasePrice"
                        value={formData.purchasePrice}
                        onChange={handlePurchaseChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                          validationErrors.purchasePrice ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.purchasePrice && (
                        <p className="mt-2 text-sm text-red-600">{validationErrors.purchasePrice}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">
                        Selling Price (per unit)
                      </label>
                      <input
                        type="number"
                        id="sellingPrice"
                        name="sellingPrice"
                        value={formData.sellingPrice}
                        onChange={handlePurchaseChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                          validationErrors.sellingPrice ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.sellingPrice && (
                        <p className="mt-2 text-sm text-red-600">{validationErrors.sellingPrice}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="warehouseLocation" className="block text-sm font-medium text-gray-700">
                        Warehouse Location
                      </label>
                      <input
                        type="text"
                        id="warehouseLocation"
                        name="warehouseLocation"
                        value={formData.warehouseLocation}
                        onChange={handlePurchaseChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {submitting ? 'Processing...' : 'Purchase Product'}
                    </button>
                    <button
                      type="button"
                      onClick={closePurchaseModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FaEdit className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Update Product Status
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Change the product status to approve or reject it.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5">
                <form onSubmit={handleStatusSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={statusData.status}
                        onChange={handleStatusChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                          validationErrors.status ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      {validationErrors.status && (
                        <p className="mt-2 text-sm text-red-600">{validationErrors.status}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="statusReason" className="block text-sm font-medium text-gray-700">
                        Reason {statusData.status === 'rejected' && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        id="statusReason"
                        name="statusReason"
                        value={statusData.statusReason}
                        onChange={handleStatusChange}
                        rows={3}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                          validationErrors.statusReason ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Provide reason, especially for rejections"
                      />
                      {validationErrors.statusReason && (
                        <p className="mt-2 text-sm text-red-600">{validationErrors.statusReason}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {submitting ? 'Processing...' : 'Update Status'}
                    </button>
                    <button
                      type="button"
                      onClick={closeStatusModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProductsManagementPage; 