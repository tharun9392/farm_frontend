import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const WishlistPage = () => {
  return (
    <DashboardLayout>
      <div className="py-10 min-h-screen bg-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Your Wishlist</h1>
        <p className="text-gray-600 text-lg">You have no items in your wishlist yet.</p>
      </div>
    </DashboardLayout>
  );
};

export default WishlistPage; 