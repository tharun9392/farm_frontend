import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createRazorpayOrder, verifyRazorpayPayment, resetPaymentState } from '../../features/payments/paymentSlice';
import { RAZORPAY_KEY_ID } from '../../config';

const PaymentButton = ({ order }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { razorpayOrder, loading, error, success } = useSelector((state) => state.payments);

  useEffect(() => {
    // Clean up the state when component unmounts
    return () => {
      dispatch(resetPaymentState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetPaymentState());
    }
  }, [error, dispatch]);

  const handlePayment = async () => {
    try {
      // Create razorpay order
      await dispatch(createRazorpayOrder(order._id)).unwrap();
    } catch (err) {
      toast.error(err?.message || 'Error initiating payment');
    }
  };

  useEffect(() => {
    if (razorpayOrder && success) {
      // Load Razorpay SDK
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Open Razorpay checkout form
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Farmer Rice',
          description: `Payment for Order #${order.orderNumber}`,
          order_id: razorpayOrder.id,
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || ''
          },
          theme: {
            color: '#4F7942' // Farm green
          },
          handler: function (response) {
            // Handle the success payment
            const paymentData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: razorpayOrder.paymentId
            };

            dispatch(verifyRazorpayPayment(paymentData))
              .unwrap()
              .then(() => {
                toast.success('Payment successful!');
                // Redirect or update UI as needed
                if (typeof window !== 'undefined') {
                  window.location.href = `/orders/${order._id}/success`;
                }
              })
              .catch((error) => {
                toast.error(error || 'Payment verification failed');
              });
          }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();

        // Clean up
        razorpayInstance.on('payment.failed', function (response) {
          toast.error('Payment failed. Please try again.');
        });

        return () => {
          razorpayInstance.close();
        };
      };

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [razorpayOrder, success, order, user, dispatch]);

  return (
    <button
      onClick={handlePayment}
      disabled={loading || order.isPaid}
      className={`w-full px-6 py-3 mt-4 font-medium rounded-md ${
        loading || order.isPaid
          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
          : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : order.isPaid ? (
        'Already Paid'
      ) : (
        'Pay Now'
      )}
    </button>
  );
};

export default PaymentButton; 