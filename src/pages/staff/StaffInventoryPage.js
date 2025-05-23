import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import DashboardLayout from '../../layouts/DashboardLayout';
import InventoryList from '../../components/admin/InventoryList';

const StaffInventoryPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
              <p className="mt-2 text-sm text-gray-700">
                View and manage rice inventory across all warehouses. Monitor stock levels and product status.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => navigate('/staff/add-product')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <InventoryList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffInventoryPage; 