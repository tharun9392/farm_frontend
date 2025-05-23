import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import OrderAnalytics from '../../components/admin/OrderAnalytics';
import { Helmet } from 'react-helmet';

const StaffOrderAnalyticsPage = () => {
  return (
    <>
      <Helmet>
        <title>Order Analytics | Staff</title>
        <meta name="description" content="Order analytics and reporting dashboard for staff" />
      </Helmet>
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order Analytics</h1>
          </div>
          <OrderAnalytics />
        </div>
      </DashboardLayout>
    </>
  );
};

export default StaffOrderAnalyticsPage; 