import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMyPayments } from '../../features/payments/paymentSlice';
import CustomerLayout from '../../layouts/CustomerLayout';
import { formatDate, formatCurrency } from '../../utils/formatters';

const PaymentHistory = () => {
  const dispatch = useDispatch();
  const { paymentHistory, loading } = useSelector((state) => state.payments);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    dispatch(getMyPayments());
  }, [dispatch]);

  // Filter payments based on active tab
  const filteredPayments = paymentHistory.filter(payment => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return payment.status === 'completed';
    if (activeTab === 'pending') return payment.status === 'pending';
    if (activeTab === 'refunded') return payment.status === 'refunded';
    return true;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPaymentRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
            Loading payments...
          </td>
        </tr>
      );
    }

    if (filteredPayments.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
            No payment records found
          </td>
        </tr>
      );
    }

    return filteredPayments.map((payment) => (
      <tr key={payment._id} className="border-b hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <Link to={`/payments/${payment._id}`} className="text-green-600 hover:text-green-800">
            {payment._id.substring(0, 8)}...
          </Link>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {payment.order && (
            <Link to={`/orders/${payment.order._id}`} className="text-blue-600 hover:text-blue-800">
              {payment.order.orderNumber}
            </Link>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{formatDate(payment.createdAt)}</td>
        <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(payment.amount)}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}>
            {payment.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="flex justify-end space-x-2">
            <Link 
              to={`/payments/${payment._id}`}
              className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
            >
              View Details
            </Link>
            {payment.invoice && payment.invoice.pdfUrl && (
              <a 
                href={payment.invoice.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Download Invoice
              </a>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <CustomerLayout>
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Payment History</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'pending'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('refunded')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'refunded'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Refunded
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
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
    </CustomerLayout>
  );
};

export default PaymentHistory; 