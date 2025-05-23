import React from 'react';
import MainLayout from '../../layouts/MainLayout';

const ShippingPolicyPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">Shipping Policy</h1>
        
        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Delivery Areas</h2>
          <p className="text-gray-600 mb-4">
            We currently deliver to all major cities and surrounding areas in Telangana and neighboring states. 
            Please check your pincode availability during checkout to confirm if we deliver to your location.
          </p>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Shipping Timeframes</h2>
          <p className="text-gray-600 mb-4">
            For local deliveries within Hyderabad, orders are typically delivered within 24-48 hours.
            For other locations, delivery usually takes 3-5 business days.
          </p>
          <p className="text-gray-600 mb-4">
            Please note that delivery times may be affected during holidays, local events, or unforeseen circumstances.
            We will inform you of any delays in shipping your order.
          </p>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Shipping Charges</h2>
          <p className="text-gray-600 mb-4">
            Shipping charges are calculated based on your location and the weight of your order. 
            The exact shipping cost will be displayed during checkout before payment.
          </p>
          <p className="text-gray-600 mb-4">
            We offer free shipping on orders above ₹1000 to select locations.
          </p>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Tracking Your Order</h2>
          <p className="text-gray-600 mb-4">
            Once your order is dispatched, you will receive a tracking ID via email and SMS. 
            You can use this tracking ID to monitor the status of your delivery through our website or the courier partner's website.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ShippingPolicyPage; 