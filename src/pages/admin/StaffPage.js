import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StaffList from '../../components/admin/StaffList';

const StaffPage = () => {
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
          
          <p className="mt-2 text-sm text-gray-700">
            Create and manage staff accounts. Control access and permissions for your team members.
          </p>
          
          <div className="mt-6">
            <StaffList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffPage; 