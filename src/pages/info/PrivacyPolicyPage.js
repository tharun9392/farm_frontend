import React from 'react';
import MainLayout from '../../layouts/MainLayout';

const PrivacyPolicyPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">Privacy Policy</h1>
        
        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Information We Collect</h2>
          <p className="text-gray-600 mb-4">
            We collect personal information such as your name, email address, phone number, and shipping address when you:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Create an account on our platform</li>
            <li>Place an order for our products</li>
            <li>Sign up for newsletters or promotional communications</li>
            <li>Contact our customer support</li>
            <li>Participate in surveys or feedback forms</li>
          </ul>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">
            We use your information to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your orders and account</li>
            <li>Improve our products and services</li>
            <li>Send you marketing communications (if you've opted in)</li>
            <li>Comply with legal obligations</li>
            <li>Detect and prevent fraud</li>
          </ul>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Data Security</h2>
          <p className="text-gray-600 mb-4">
            We implement appropriate security measures to protect your personal information against unauthorized access, 
            alteration, disclosure, or destruction. Your payment information is encrypted using secure socket layer technology (SSL).
          </p>
          <p className="text-gray-600 mb-4">
            However, no method of transmission over the internet or electronic storage is 100% secure. 
            We cannot guarantee absolute security of your data.
          </p>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Cookies and Tracking</h2>
          <p className="text-gray-600 mb-4">
            We use cookies and similar tracking technologies to track activity on our website and 
            hold certain information to improve your shopping experience. You can set your browser to 
            refuse all or some browser cookies, but this may affect some functionality of our website.
          </p>
        </div>

        <div className="bg-white shadow-custom rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-primary-600 mb-4">Your Rights</h2>
          <p className="text-gray-600 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Access your personal data</li>
            <li>Request correction or deletion of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request restriction of processing your personal data</li>
            <li>Request transfer of your personal data</li>
            <li>Withdraw consent</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicyPage; 