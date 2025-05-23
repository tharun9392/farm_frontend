import React from 'react';
import MainLayout from '../../layouts/MainLayout';

const TermsOfServicePage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">Terms of Service</h1>
        
        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Acceptance of Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing and using FarmeRice services, you agree to be bound by these Terms of Service, 
            all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">User Accounts</h2>
          <p className="text-gray-600 mb-4">
            When you create an account with us, you must provide accurate, complete, and current information at all times. 
            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </p>
          <p className="text-gray-600 mb-4">
            You are responsible for safeguarding the password for your account and for any activities or actions under your account. 
            You must immediately notify FarmeRice of any unauthorized use of your account or any other breach of security.
          </p>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Products and Services</h2>
          <p className="text-gray-600 mb-4">
            We try to describe our products as accurately as possible. However, we do not warrant that product descriptions or 
            other content of this site is accurate, complete, reliable, current, or error-free.
          </p>
          <p className="text-gray-600 mb-4">
            We reserve the right to refuse any order you place with us, and to limit or cancel quantities purchased per person, 
            per household, or per order. These restrictions may include orders placed by the same customer account, or orders 
            that use the same billing or shipping address.
          </p>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">User Conduct</h2>
          <p className="text-gray-600 mb-4">
            You agree not to use the service for any illegal or unauthorized purpose, nor to violate any laws in your jurisdiction.
          </p>
          <p className="text-gray-600 mb-4">
            You agree not to attempt to probe, scan, or test the vulnerability of our system or breach any security or authentication measures.
          </p>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Limitation of Liability</h2>
          <p className="text-gray-600 mb-4">
            FarmeRice shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages 
            resulting from your use of or inability to use the service.
          </p>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Changes to Terms</h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide 
            at least 30 days notice prior to any new terms taking effect.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsOfServicePage; 