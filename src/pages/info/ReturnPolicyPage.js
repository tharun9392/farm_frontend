import React from 'react';
import MainLayout from '../../layouts/MainLayout';

const ReturnPolicyPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">Return Policy</h1>
        
        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Return Window</h2>
          <p className="text-gray-600 mb-4">
            You can return products within 7 days of delivery if you are not satisfied with the quality or condition.
            Please contact our customer support team to initiate a return.
          </p>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Conditions for Returns</h2>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>The product must be unused and in its original packaging</li>
            <li>The product must not be damaged or tampered with</li>
            <li>The product must be returned with all accessories, labels, and documentation</li>
            <li>Proof of purchase (order ID or invoice) is required</li>
          </ul>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Non-Returnable Items</h2>
          <p className="text-gray-600 mb-4">
            The following items cannot be returned:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Products that have been opened or used</li>
            <li>Products with broken seals</li>
            <li>Products that are marked as non-returnable</li>
            <li>Perishable items like fresh rice products</li>
          </ul>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Refund Process</h2>
          <p className="text-gray-600 mb-4">
            Once we receive and inspect the returned item, we will process the refund within 5-7 business days. 
            The refund will be credited to the original payment method.
          </p>
          <p className="text-gray-600 mb-4">
            Shipping charges for returns due to product quality issues will be reimbursed. 
            For returns due to change of mind, shipping charges will be deducted from the refund amount.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReturnPolicyPage; 