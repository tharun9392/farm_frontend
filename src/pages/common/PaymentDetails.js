import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPaymentById } from '../../features/payments/paymentSlice';
import { formatDate, formatCurrency } from '../../utils/formatters';
import CustomerLayout from '../../layouts/CustomerLayout';
import AdminLayout from '../../layouts/AdminLayout';

const PaymentDetails = () => {
  const { paymentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPayment, loading, error } = useSelector((state) => state.payments);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (paymentId) {
      dispatch(getPaymentById(paymentId));
    }
  }, [dispatch, paymentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold text-red-600">Error loading payment details</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!currentPayment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold text-gray-800">Payment not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Determine which layout to use based on user role
  const Layout = user?.role === 'admin' || user?.role === 'staff' ? AdminLayout : CustomerLayout;

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-green-600 hover:text-green-800"
          >
            <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Payment Details</h1>
          <p className="text-gray-600">Transaction #{currentPayment.transactionId || currentPayment._id.substring(0, 8)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Payment Status Banner */}
          <div className={`px-6 py-4 border-b ${getStatusClass(currentPayment.status)}`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Payment Status: {currentPayment.status.charAt(0).toUpperCase() + currentPayment.status.slice(1)}</h2>
                {currentPayment.paymentDate && (
                  <p className="text-sm">
                    {currentPayment.status === 'completed' ? 'Paid on: ' : 'Last updated: '}
                    {formatDate(currentPayment.paymentDate)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCurrency(currentPayment.amount)}</p>
                <p className="text-sm">{currentPayment.currency}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Payment ID</p>
                <p className="font-medium">{currentPayment._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Type</p>
                <p className="font-medium">{currentPayment.paymentType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Gateway</p>
                <p className="font-medium">{currentPayment.paymentGateway || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium">{currentPayment.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created Date</p>
                <p className="font-medium">{formatDate(currentPayment.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium">{currentPayment.description || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          {currentPayment.order && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Order Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium">
                    <Link to={`/orders/${currentPayment.order._id}`} className="text-green-600 hover:text-green-800">
                      {currentPayment.order.orderNumber}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Total</p>
                  <p className="font-medium">{formatCurrency(currentPayment.order.totalPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Items</p>
                  <p className="font-medium">{currentPayment.order.items?.length || 0} items</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Status</p>
                  <p className="font-medium">{currentPayment.order.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Details */}
          {currentPayment.invoice && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Invoice Information</h3>
                {currentPayment.invoice.pdfUrl && (
                  <a
                    href={currentPayment.invoice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Download Invoice
                  </a>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="font-medium">{currentPayment.invoice.invoiceNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Invoice Date</p>
                  <p className="font-medium">{formatDate(currentPayment.invoice.invoiceDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">{formatDate(currentPayment.invoice.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Invoice Status</p>
                  <p className="font-medium">{currentPayment.invoice.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="font-medium">{formatCurrency(currentPayment.invoice.subtotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tax</p>
                  <p className="font-medium">{formatCurrency(currentPayment.invoice.taxTotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-medium">{formatCurrency(currentPayment.invoice.total)}</p>
                </div>
              </div>

              {/* Invoice Items */}
              {currentPayment.invoice.items && currentPayment.invoice.items.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-3">Invoice Items</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentPayment.invoice.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <p className="font-medium">{item.name}</p>
                              {item.description && (
                                <p className="text-xs text-gray-500">{item.description}</p>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">{item.quantity}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Refund Details */}
          {currentPayment.status === 'refunded' && currentPayment.refundDetails && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Refund Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Refund Date</p>
                  <p className="font-medium">{formatDate(currentPayment.refundDetails.refundDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Refund Amount</p>
                  <p className="font-medium">{formatCurrency(currentPayment.refundDetails.refundAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Refund Reason</p>
                  <p className="font-medium">{currentPayment.refundDetails.refundReason || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Refund Transaction ID</p>
                  <p className="font-medium">{currentPayment.refundDetails.refundTransactionId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Refund Status</p>
                  <p className="font-medium">{currentPayment.refundDetails.refundStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Refund Method</p>
                  <p className="font-medium">{currentPayment.refundDetails.refundMethod || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentDetails; 