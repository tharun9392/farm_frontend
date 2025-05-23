import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import userService from '../../services/userService';

// CSS for fallback avatars
const styles = {
  fallbackAvatar: `
    .avatar-fallback:after {
      content: "";
      display: block;
      width: 100%;
      height: 100%;
      background-color: #e5e7eb;
      border-radius: 9999px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /%3E%3C/svg%3E");
      background-position: center;
      background-repeat: no-repeat;
      background-size: 60%;
    }
  `
};

const StaffCustomersPage = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: '',
    status: ''
  });
  const [customerPage, setCustomerPage] = useState(1);
  const [farmerPage, setFarmerPage] = useState(1);
  const [customerTotalPages, setCustomerTotalPages] = useState(1);
  const [farmerTotalPages, setFarmerTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomers();
    } else {
      fetchFarmers();
    }
  }, [activeTab, customerPage, farmerPage, filter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = { 
        page: customerPage, 
        limit: 10,
        ...filter 
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => 
        params[key] === '' && delete params[key]
      );
      
      console.log('Fetching customers with params:', params);
      const response = await api.get('/users/customers', { params });
      
      console.log('Customer response:', response.data);
      
      if (response.data && response.data.success) {
        setCustomers(response.data.data || []);
        setCustomerTotalPages(response.data.pages || 1);
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Failed to load customers. Invalid response format.');
        setCustomers([]);
        setCustomerTotalPages(1);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers. Please try again.');
      setCustomers([]);
      setCustomerTotalPages(1);
      setLoading(false);
    }
  };

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const params = { 
        page: farmerPage, 
        limit: 10,
        ...filter 
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => 
        params[key] === '' && delete params[key]
      );
      
      const response = await userService.getAllFarmers(params);
      setFarmers(response.data || []);
      setFarmerTotalPages(response.pages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      toast.error('Failed to load farmers. Please try again.');
      setFarmers([]);
      setFarmerTotalPages(1);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page on filter change
    if (activeTab === 'customers') {
      setCustomerPage(1);
    } else {
      setFarmerPage(1);
    }
  };

  const handleCustomerPageChange = (newPage) => {
    if (newPage > 0 && newPage <= customerTotalPages) {
      setCustomerPage(newPage);
    }
  };

  const handleFarmerPageChange = (newPage) => {
    if (newPage > 0 && newPage <= farmerTotalPages) {
      setFarmerPage(newPage);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Add style tag for fallback avatars */}
          <style dangerouslySetInnerHTML={{ __html: styles.fallbackAvatar }} />
          
          <h1 className="text-2xl font-semibold text-gray-900">Customers & Farmers</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage customers and farmers on the platform
          </p>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mt-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('customers')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'customers'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => setActiveTab('farmers')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'farmers'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Farmers
              </button>
            </nav>
          </div>
          
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {activeTab === 'customers' ? 'All Customers' : 'All Farmers'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'customers' 
                  ? 'View customer information and purchase history'
                  : 'View farmer information and product offerings'
                }
              </p>
            </div>
            
            {/* Filters */}
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={filter.status}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    value={filter.search}
                    onChange={handleFilterChange}
                    placeholder="Search by name or email"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  />
                </div>
              </div>
            </div>
            
            {/* User List */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : activeTab === 'customers' ? (
                // Customers Table
                customers.length === 0 ? (
                  <div className="text-center py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registered
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                {customer.profileImage ? (
                                  <img 
                                    src={customer.profileImage} 
                                    alt={customer.name} 
                                    className="h-10 w-10 rounded-full"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                      e.target.parentNode.classList.add('avatar-fallback');
                                    }}
                                  />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.name || 'Unnamed Customer'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {customer.email || 'No email provided'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.phone || 'No phone'}</div>
                            {customer.address && (
                              <div className="text-sm text-gray-500">
                                {customer.address.city || ''}, {customer.address.state || ''}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(customer.status)}`}>
                              {customer.status ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(customer.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/staff/customers/${customer._id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                // Farmers Table
                farmers.length === 0 ? (
                  <div className="text-center py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No farmers found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Farmer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registered
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {farmers.map((farmer) => (
                        <tr key={farmer._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                {farmer.profileImage ? (
                                  <img 
                                    src={farmer.profileImage} 
                                    alt={farmer.name} 
                                    className="h-10 w-10 rounded-full"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                      e.target.parentNode.classList.add('avatar-fallback');
                                    }}
                                  />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {farmer.name || 'Unnamed Farmer'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {farmer.email || 'No email provided'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{farmer.phone || 'No phone'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(farmer.status)}`}>
                              {farmer.status ? farmer.status.charAt(0).toUpperCase() + farmer.status.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {farmer.farmDetails?.location || 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(farmer.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/staff/farmers/${farmer._id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                              View
                            </Link>
                            <Link to={`/staff/farmers/${farmer._id}/products`} className="text-primary-600 hover:text-primary-900">
                              Products
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
            
            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {activeTab === 'customers' 
                        ? (customers.length === 0 ? 0 : (customerPage - 1) * 10 + 1)
                        : (farmers.length === 0 ? 0 : (farmerPage - 1) * 10 + 1)
                      }
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {activeTab === 'customers'
                        ? (customerPage - 1) * 10 + customers.length
                        : (farmerPage - 1) * 10 + farmers.length
                      }
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">
                      {activeTab === 'customers' ? customerTotalPages * 10 : farmerTotalPages * 10}
                    </span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => activeTab === 'customers' 
                        ? handleCustomerPageChange(customerPage - 1) 
                        : handleFarmerPageChange(farmerPage - 1)
                      }
                      disabled={activeTab === 'customers' ? customerPage === 1 : farmerPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        (activeTab === 'customers' ? customerPage === 1 : farmerPage === 1)
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {/* Current Page Number */}
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      {activeTab === 'customers' ? customerPage : farmerPage}
                    </span>
                    <button
                      onClick={() => activeTab === 'customers' 
                        ? handleCustomerPageChange(customerPage + 1) 
                        : handleFarmerPageChange(farmerPage + 1)
                      }
                      disabled={activeTab === 'customers' 
                        ? customerPage === customerTotalPages 
                        : farmerPage === farmerTotalPages
                      }
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        (activeTab === 'customers' 
                          ? customerPage === customerTotalPages 
                          : farmerPage === farmerTotalPages)
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffCustomersPage; 