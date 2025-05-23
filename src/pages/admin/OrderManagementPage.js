import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import OrderManagement from '../../components/admin/OrderManagement';
import { Helmet } from 'react-helmet';

const OrderManagementPage = () => {
  return (
    <>
      <Helmet>
        <title>Order Management | Farmer Rice Admin</title>
        <meta name="description" content="Manage and process customer orders" />
      </Helmet>
      
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order Management</h1>
          </div>
          
          <OrderManagement />
        </div>
      </DashboardLayout>
    </>
  );
};

export default OrderManagementPage; 