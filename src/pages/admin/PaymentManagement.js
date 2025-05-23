import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { getMyPayments } from '../../features/payments/paymentSlice';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { FaSearch, FaFilter, FaFileInvoice, FaUndo } from 'react-icons/fa';
import paymentService from '../../services/paymentService';
import { toast } from 'react-toastify';

const PaymentManagement = () => {
  const dispatch = useDispatch();
  const { paymentHistory, loading } = useSelector((state) => state.payments);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    paymentType: 'all',
    dateRange: 'all'
  });
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState({
    paymentId: '',
    reason: '',
    amount: ''
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // For admin, we'd ideally call getAllPayments, but for simplicity using getMyPayments
    dispatch(getMyPayments());
  }, [dispatch]);

  useEffect(() => {
    if (paymentHistory) {
      applyFilters();
    }
  }, [paymentHistory, searchTerm, filters]);

  const applyFilters = () => {
    let result = [...paymentHistory];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        payment =>
          (payment._id && payment._id.toLowerCase().includes(term)) ||
          (payment.transactionId && payment.transactionId.toLowerCase().includes(term)) ||
          (payment.order && payment.order.orderNumber && payment.order.orderNumber.toLowerCase().includes(term)) ||
          (payment.user && payment.user.name && payment.user.name.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(payment => payment.status === filters.status);
    }

    // Apply payment type filter
    if (filters.paymentType !== 'all') {
      result = result.filter(payment => payment.paymentType === filters.paymentType);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        result = result.filter(payment => new Date(payment.createdAt) >= startDate);
      }
    }

    setFilteredPayments(result);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleRefund = (payment) => {
    setRefundData({
      paymentId: payment._id,
      reason: '',
      amount: payment.amount
    });
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    
    if (!refundData.reason) {
      toast.error('Please provide a reason for the refund');
      return;
    }
    
    try {
      setProcessing(true);
      const response = await paymentService.processRefund(refundData.paymentId, {
        reason: refundData.reason,
        amount: refundData.amount || undefined
      });
      
      toast.success('Refund processed successfully');
      setShowRefundModal(false);
      
      // Refresh payment data
      dispatch(getMyPayments());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing refund');
    } finally {
      setProcessing(false);
    }
  };

  const generateInvoice = async (paymentId) => {
    try {
      const response = await paymentService.generateInvoice(paymentId);
      toast.success('Invoice generated successfully');
      
      // Refresh payment data
      dispatch(getMyPayments());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error generating invoice');
    }
  };

  const renderPaymentRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
            Loading payments...
          </td>
        </tr>
      );
    }

    if (filteredPayments.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
            No payment records found
          </td>
        </tr>
      );
    }

    return filteredPayments.map((payment) => (
      <tr key={payment._id} className="border-b hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <Link to={`/admin/payments/${payment._id}`} className="text-green-600 hover:text-green-800">
            {payment._id.substring(0, 8)}...
          </Link>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {payment.user && (
            <Link to={`/admin/users/${payment.user._id}`} className="text-blue-600 hover:text-blue-800">
              {payment.user.name || payment.user._id.substring(0, 8)}
            </Link>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {payment.order && (
            <Link to={`/admin/orders/${payment.order._id}`} className="text-blue-600 hover:text-blue-800">
              {payment.order.orderNumber || payment.order._id.substring(0, 8)}
            </Link>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{formatDate(payment.createdAt)}</td>
        <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(payment.amount)}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full 
            ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
            ${payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${payment.status === 'refunded' ? 'bg-blue-100 text-blue-800' : ''}
            ${payment.status === 'failed' ? 'bg-red-100 text-red-800' : ''}
            ${payment.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
          `}>
            {payment.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full 
            ${payment.paymentType === 'customer-payment' ? 'bg-purple-100 text-purple-800' : ''}
            ${payment.paymentType === 'farmer-payment' ? 'bg-indigo-100 text-indigo-800' : ''}
            ${payment.paymentType === 'refund' ? 'bg-blue-100 text-blue-800' : ''}
          `}>
            {payment.paymentType}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="flex justify-end space-x-2">
            <Link 
              to={`/admin/payments/${payment._id}`}
              className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
            >
              View
            </Link>
            
            {payment.status === 'completed' && !payment.invoice?.pdfUrl && (
              <button
                onClick={() => generateInvoice(payment._id)}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center"
              >
                <FaFileInvoice className="mr-1" />
                Invoice
              </button>
            )}
            
            {payment.status === 'completed' && payment.paymentType === 'customer-payment' && (
              <button
                onClick={() => handleRefund(payment)}
                className="px-3 py-1 text-xs font-medium text-white bg-orange-600 rounded hover:bg-orange-700 flex items-center"
              >
                <FaUndo className="mr-1" />
                Refund
              </button>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Payment Management</h1>
          <Link
            to="/admin/payments/analytics"
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
          >
            View Analytics
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center relative">
              <span className="absolute left-3 text-gray-400">
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 w-full md:w-80"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400" />
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 px-3 py-2"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  name="paymentType"
                  value={filters.paymentType}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 px-3 py-2"
                >
                  <option value="all">All Types</option>
                  <option value="customer-payment">Customer Payment</option>
                  <option value="farmer-payment">Farmer Payment</option>
                  <option value="refund">Refund</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 px-3 py-2"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderPaymentRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Process Refund</h2>
            <form onSubmit={handleRefundSubmit}>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={refundData.amount}
                  onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Reason *
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={refundData.reason}
                  onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={processing}
                >
                  {processing ? (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Process Refund'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PaymentManagement; 