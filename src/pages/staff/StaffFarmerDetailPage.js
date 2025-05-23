import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import userService from '../../services/userService';
import productService from '../../services/productService';
import Loader from '../../components/common/Loader';
import ProductImage from '../../components/common/ProductImage';

const StaffFarmerDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(true);

  useEffect(() => {
    fetchFarmerDetails();
    fetchFarmerProducts();
    fetchFarmerSales();
  }, [userId]);

  const fetchFarmerDetails = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserById(userId);
      setFarmer(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching farmer details:', error);
      toast.error('Failed to load farmer details. Please try again.');
      setLoading(false);
    }
  };

  const fetchFarmerProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await api.get(`/products/farmer/${userId}`);
      setProducts(response.data.products || []);
      setProductsLoading(false);
    } catch (error) {
      console.error('Error fetching farmer products:', error);
      toast.error('Failed to load farmer products.');
      setProducts([]);
      setProductsLoading(false);
    }
  };

  const fetchFarmerSales = async () => {
    try {
      setSalesLoading(true);
      const response = await api.get(`/sales/farmer/${userId}`);
      setSales(response.data.sales || []);
      setSalesLoading(false);
    } catch (error) {
      console.error('Error fetching farmer sales:', error);
      toast.error('Failed to load farmer sales.');
      setSales([]);
      setSalesLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await userService.updateUserStatus(userId, newStatus);
      toast.success(`Farmer status updated to ${newStatus}`);
      fetchFarmerDetails(); // Refresh the data
    } catch (error) {
      console.error('Error updating farmer status:', error);
      toast.error('Failed to update farmer status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Breadcrumb */}
          <div className="mb-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div>
                    <Link to="/staff/dashboard" className="text-gray-400 hover:text-gray-500">
                      Dashboard
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                    <Link to="/staff/customers" className="ml-4 text-gray-400 hover:text-gray-500">
                      Customers & Farmers
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                    <span className="ml-4 text-gray-500">
                      Farmer Details
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : !farmer ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h2 className="text-xl font-medium text-red-600">Farmer not found</h2>
              <p className="mt-1 text-gray-500">
                The requested farmer could not be found or you don't have permission to view it.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
                <div className="border-b border-gray-200 bg-white px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-24 w-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                      {farmer.profileImage ? (
                        <img
                          src={farmer.profileImage}
                          alt={farmer.name}
                          className="h-24 w-24 rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.classList.add('avatar-fallback');
                          }}
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-6">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {farmer.name || 'Unnamed Farmer'}
                      </h1>
                      <p className="text-sm text-gray-500">
                        {farmer.email || 'No email provided'}
                      </p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(farmer.status)}`}>
                          {farmer.status ? farmer.status.charAt(0).toUpperCase() + farmer.status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Phone
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {farmer.phone || 'Not provided'}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Registered On
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDate(farmer.createdAt)}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Account Status
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {farmer.status ? farmer.status.charAt(0).toUpperCase() + farmer.status.slice(1) : 'Unknown'}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Is Approved
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {farmer.isApproved ? 'Yes' : 'No'}
                        </dd>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-medium text-gray-900">Farm Details</h2>
                    {farmer.farmDetails ? (
                      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Farm Name
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {farmer.farmDetails.name || 'Not provided'}
                          </dd>
                        </div>
                        
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Location
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {farmer.farmDetails.location || 'Not provided'}
                          </dd>
                        </div>
                        
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Size
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {farmer.farmDetails.size ? `${farmer.farmDetails.size} acres` : 'Not provided'}
                          </dd>
                        </div>
                        
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Experience
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {farmer.farmDetails.experience ? `${farmer.farmDetails.experience} years` : 'Not provided'}
                          </dd>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">No farm details provided.</p>
                    )}
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-medium text-gray-900">Actions</h2>
                    <div className="mt-4 flex flex-wrap gap-4">
                      {farmer.status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange('active')}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Activate Account
                        </button>
                      )}
                      
                      {farmer.status !== 'blocked' && (
                        <button
                          onClick={() => handleStatusChange('blocked')}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Block Account
                        </button>
                      )}
                      
                      <Link
                        to={`/staff/farmers/${userId}/products`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        View All Products
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Products Section */}
              <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Recent Products
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Products added by this farmer
                  </p>
                </div>
                
                {productsLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This farmer hasn't added any products yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">View</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.slice(0, 5).map((product) => (
                          <tr key={product._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-md border border-gray-200 overflow-hidden">
                                  <ProductImage 
                                    src={product.images?.[0]} 
                                    alt={product.name} 
                                    className="h-10 w-10 object-cover object-center" 
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.name || 'Unnamed Product'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.riceType || product.category || 'Not specified'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{product.price || '0'}/{product.unit || 'kg'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.stockQuantity || product.availableQuantity || '0'} {product.unit || 'kg'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getProductStatusBadgeClass(product.status)}`}>
                                {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {product.status === 'pending' ? (
                                <Link to={`/admin/inventory/purchase?productId=${product._id}&farmerId=${farmer._id}`} className="text-primary-600 hover:text-primary-900">
                                  Review
                                </Link>
                              ) : (
                                <Link to={`/staff/products/${product._id}`} className="text-primary-600 hover:text-primary-900">
                                  View
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {products.length > 5 && (
                      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                        <Link to={`/staff/farmers/${userId}/products`} className="text-sm font-medium text-primary-600 hover:text-primary-900">
                          View all {products.length} products →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Sales History Section */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Sales History
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Recent sales made to this farmer
                  </p>
                </div>
                
                {salesLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader />
                  </div>
                ) : sales.length === 0 ? (
                  <div className="text-center py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No sales found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No sales have been made to this farmer yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Purchase Price
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">View</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sales.map((sale) => (
                          <tr key={sale._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {sale.transactionId || sale._id.substring(0, 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(sale.date || sale.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sale.product?.name || 'Unknown Product'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {sale.quantity || '0'} {sale.unit || 'kg'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{sale.purchasePrice?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link to={`/staff/sales/${sale._id}`} className="text-primary-600 hover:text-primary-900">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffFarmerDetailPage; 