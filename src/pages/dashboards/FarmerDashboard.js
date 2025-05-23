import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../layouts/DashboardLayout';
import messageService from '../../services/messageService';
import { FaBox, FaChartLine, FaShoppingCart, FaWarehouse, FaEnvelope, FaPlus } from 'react-icons/fa';

const FarmerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        setLoading(true);
        const response = await messageService.getUnreadCount();
        setUnreadMessages(response.unreadCount || 0);
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUnreadCount();
  }, []);
  
  // Mock data - would come from API in a real implementation
  const stats = {
    totalProducts: 8,
    activeSales: 6,
    totalSales: 25,
    totalRevenue: 98500,
  };
  
  const recentSales = [
    {
      id: 'TRX987654',
      date: '2023-06-20',
      product: 'Basmati Rice Premium',
      quantity: 500,
      amount: 35000,
      status: 'Completed',
    },
    {
      id: 'TRX987655',
      date: '2023-06-25',
      product: 'Brown Rice Organic',
      quantity: 300,
      amount: 24000,
      status: 'Processing',
    },
    {
      id: 'TRX987656',
      date: '2023-06-28',
      product: 'Sona Masoori',
      quantity: 450,
      amount: 29500,
      status: 'Completed',
    },
  ];
  
  const inventory = [
    {
      id: 'PRD001',
      name: 'Basmati Rice Premium',
      stock: 800,
      price: 70,
      unit: 'kg',
      status: 'In Stock',
    },
    {
      id: 'PRD002',
      name: 'Brown Rice Organic',
      stock: 500,
      price: 80,
      unit: 'kg',
      status: 'In Stock',
    },
    {
      id: 'PRD003',
      name: 'Sona Masoori',
      stock: 350,
      price: 65,
      unit: 'kg',
      status: 'Low Stock',
    },
    {
      id: 'PRD004',
      name: 'Jasmine Rice',
      stock: 0,
      price: 90,
      unit: 'kg',
      status: 'Out of Stock',
    },
  ];

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg mb-6 overflow-hidden">
            <div className="px-6 py-8 sm:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="text-white mb-4 sm:mb-0">
                  <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
                  <p className="mt-2 text-primary-100">Manage your rice products and track your sales performance.</p>
                </div>
                <div className="flex space-x-3">
                  <Link
                    to="/farmer/messages"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                  >
                    <FaEnvelope className="mr-2" />
                    Messages
                    {unreadMessages > 0 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {unreadMessages}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/farmer/products/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                  >
                    <FaPlus className="mr-2" />
                    Add Product
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-3 mt-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <FaBox className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <Link to="/farmer/products" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    View all products →
                  </Link>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <FaChartLine className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Sales</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stats.activeSales}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <Link to="/farmer/sales?status=active" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    View active sales →
                  </Link>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <FaShoppingCart className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stats.totalSales}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <Link to="/farmer/sales" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    View all sales →
                  </Link>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <FaWarehouse className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <Link to="/farmer/analytics" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    View analytics →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity and Inventory */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Sales */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
                <div className="mt-4 flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">ID</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Product</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {recentSales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-gray-50">
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">{sale.id}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{sale.product}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">₹{sale.amount.toLocaleString()}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  sale.status === 'Completed' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {sale.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to="/farmer/sales"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    View all sales →
                  </Link>
                </div>
              </div>
            </div>

            {/* Inventory Status */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Inventory Status</h3>
                <div className="mt-4 flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Product</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {inventory.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">{item.name}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.stock} {item.unit}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">₹{item.price}/{item.unit}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  item.status === 'In Stock' 
                                    ? 'bg-green-100 text-green-800'
                                    : item.status === 'Low Stock'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to="/farmer/inventory"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    View full inventory →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard; 