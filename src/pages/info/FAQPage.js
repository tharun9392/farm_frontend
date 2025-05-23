import React from 'react';
import MainLayout from '../../layouts/MainLayout';

const FAQPage = () => {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "You can place an order by browsing our shop, adding items to your cart, and proceeding to checkout. You'll need to create an account or login before completing your purchase."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit/debit cards, online bank transfers, and cash on delivery in selected areas."
    },
    {
      question: "How long does shipping take?",
      answer: "Shipping typically takes 3-5 business days depending on your location. We provide tracking information once your order is dispatched."
    },
    {
      question: "Can I modify or cancel my order?",
      answer: "You can modify or cancel your order within 2 hours of placing it. Please contact our customer service for assistance."
    },
    {
      question: "How do I become a farmer partner?",
      answer: "To become a farmer partner, please register as a farmer on our platform. Our team will review your application and get in touch with you."
    },
    {
      question: "Do you offer discounts for bulk orders?",
      answer: "Yes, we offer discounts for bulk orders. Please contact our customer service for more information on bulk pricing."
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">Frequently Asked Questions</h1>
        
        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white shadow-custom rounded-lg p-6">
              <h3 className="text-lg font-medium text-primary-600 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default FAQPage; 