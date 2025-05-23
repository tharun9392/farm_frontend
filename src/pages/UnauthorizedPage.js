import React from 'react';

const UnauthorizedPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 className="text-5xl font-bold text-red-600 mb-4">401</h1>
    <h2 className="text-2xl font-semibold mb-2">Unauthorized</h2>
    <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
    <a href="/" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Go back home</a>
  </div>
);

export default UnauthorizedPage; 