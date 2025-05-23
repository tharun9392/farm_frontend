import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';
import { FaSearch, FaEye, FaEdit, FaLongArrowAltDown, FaLongArrowAltUp } from 'react-icons/fa';
import Loader from '../common/Loader';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Sorting and filtering
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    search: ''
  });
  
  // For bulk actions
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  // Modal state for status updates
  const [statusUpdateModal, setStatusUpdateModal] = useState({
    isOpen: false,
    orderId: null,
    currentStatus: '',
    newStatus: '',
    note: ''
  });
  
  // Format currency to INR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };
  
  // Fetch orders with useCallback
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      const filterParams = {
        page: currentPage,
        limit,
        sort: sortField,
        order: sortDirection,
        ...filters
      };
      
      const response = await orderService.getAllOrders(filterParams);
      
      setOrders(response.orders || []);
      setTotalPages(response.totalPages || 1);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch orders');
      setLoading(false);
      console.error('Error fetching orders:', error);
    }
  }, [currentPage, limit, sortField, sortDirection, filters]);
  
  // Use the fetchOrders in useEffect
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  // Handle sort
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled in the useEffect dependency array
  };
  
  // Toggle order selection
  const toggleOrderSelection = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };
  
  // Select all orders
  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order._id));
    }
  };
  
  // Open status update modal
  const openStatusModal = (order) => {
    setStatusUpdateModal({
      isOpen: true,
      orderId: order._id,
      currentStatus: order.status,
      newStatus: order.status,
      note: ''
    });
  };
  
  // Close status update modal
  const closeStatusModal = () => {
    setStatusUpdateModal({
      isOpen: false,
      orderId: null,
      currentStatus: '',
      newStatus: '',
      note: ''
    });
  };
  
  // Handle status update
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const { orderId, newStatus, note } = statusUpdateModal;
      
      await orderService.updateOrderStatus(orderId, newStatus, note);
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus } 
          : order
      ));
      
      closeStatusModal();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };
  
  // Handle bulk status update
  const handleBulkStatusUpdate = async (status) => {
    if (selectedOrders.length === 0) {
      toast.warning('No orders selected');
      return;
    }
    
    const confirmBulk = window.confirm(`Are you sure you want to update ${selectedOrders.length} orders to ${status}?`);
    
    if (confirmBulk) {
      try {
        const updatePromises = selectedOrders.map(orderId => 
          orderService.updateOrderStatus(orderId, status, 'Bulk update')
        );
        
        await Promise.all(updatePromises);
        
        // Update local state
        setOrders(orders.map(order => 
          selectedOrders.includes(order._id) 
            ? { ...order, status } 
            : order
        ));
        
        setSelectedOrders([]);
        toast.success(`${selectedOrders.length} orders updated to ${status}`);
      } catch (error) {
        console.error('Error in bulk update:', error);
        toast.error('Failed to update some orders');
      }
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Packed':
        return 'bg-indigo-100 text-indigo-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Out for Delivery':
        return 'bg-cyan-100 text-cyan-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Returned':
        return 'bg-orange-100 text-orange-800';
      case 'Refunded':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return <div className="flex justify-center py-8"><Loader /></div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
        {error}
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Filters and Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* Search */}
          <div className="w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search orders..."
                className="border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
              >
                <FaSearch className="h-5 w-5" />
              </button>
            </form>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 md:gap-4">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
              <option value="Refunded">Refunded</option>
            </select>
            
            <select
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Not Paid</option>
            </select>
          </div>
          
          {/* Bulk Actions (visible only when items are selected) */}
          {selectedOrders.length > 0 && (
            <div className="bg-gray-100 p-2 rounded-md flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">
                {selectedOrders.length} selected
              </span>
              <div className="border-l border-gray-300 pl-2 flex gap-2">
                <button
                  onClick={() => handleBulkStatusUpdate('Processing')}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Mark Processing
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('Packed')}
                  className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                >
                  Mark Packed
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('Shipped')}
                  className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                >
                  Mark Shipped
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="pl-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('_id')}
              >
                <div className="flex items-center space-x-1">
                  <span>Order ID</span>
                  {sortField === '_id' && (
                    <span>
                      {sortDirection === 'asc' ? (
                        <FaLongArrowAltUp className="h-4 w-4" />
                      ) : (
                        <FaLongArrowAltDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('user.name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Customer</span>
                  {sortField === 'user.name' && (
                    <span>
                      {sortDirection === 'asc' ? (
                        <FaLongArrowAltUp className="h-4 w-4" />
                      ) : (
                        <FaLongArrowAltDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {sortField === 'createdAt' && (
                    <span>
                      {sortDirection === 'asc' ? (
                        <FaLongArrowAltUp className="h-4 w-4" />
                      ) : (
                        <FaLongArrowAltDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('totalPrice')}
              >
                <div className="flex items-center space-x-1">
                  <span>Total</span>
                  {sortField === 'totalPrice' && (
                    <span>
                      {sortDirection === 'asc' ? (
                        <FaLongArrowAltUp className="h-4 w-4" />
                      ) : (
                        <FaLongArrowAltDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="pl-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => toggleOrderSelection(order._id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order._id}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.user.name}</div>
                    <div className="text-xs text-gray-500">{order.user.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.totalPrice)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Details"
                      >
                        <FaEye className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => openStatusModal(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Update Status"
                      >
                        <FaEdit className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{Math.min((currentPage - 1) * limit + 1, orders.length)}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * limit, orders.length)}</span> of{' '}
              <span className="font-medium">{orders.length}</span> results
            </p>
          </div>
          <div>
            <nav className="flex justify-center sm:justify-end">
              <ul className="flex space-x-2">
                <li>
                  <button
                    onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } px-3 py-1 border border-gray-300 rounded-md text-sm font-medium`}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages).keys()].map(page => (
                  <li key={page + 1}>
                    <button
                      onClick={() => setCurrentPage(page + 1)}
                      className={`${
                        currentPage === page + 1
                          ? 'bg-blue-50 text-blue-600 border-blue-500'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } px-3 py-1 border border-gray-300 rounded-md text-sm font-medium`}
                    >
                      {page + 1}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className={`${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } px-3 py-1 border border-gray-300 rounded-md text-sm font-medium`}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Status Update Modal */}
      {statusUpdateModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Update Order Status</h3>
              <button
                onClick={closeStatusModal}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleStatusUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Current Status
                </label>
                <input
                  type="text"
                  value={statusUpdateModal.currentStatus}
                  readOnly
                  className="mt-1 bg-gray-100 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  New Status
                </label>
                <select
                  value={statusUpdateModal.newStatus}
                  onChange={(e) => setStatusUpdateModal({
                    ...statusUpdateModal,
                    newStatus: e.target.value
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Status Update Note (optional)
                </label>
                <textarea
                  value={statusUpdateModal.note}
                  onChange={(e) => setStatusUpdateModal({
                    ...statusUpdateModal,
                    note: e.target.value
                  })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Add a note about this status change"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeStatusModal}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement; 