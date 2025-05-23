import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const ReviewsPage = () => {
  return (
    <DashboardLayout>
      <div className="py-10 min-h-screen bg-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">Your Reviews</h1>
        <p className="text-gray-600 text-lg">You have not written any reviews yet.</p>
      </div>
    </DashboardLayout>
  );
};

export default ReviewsPage; 