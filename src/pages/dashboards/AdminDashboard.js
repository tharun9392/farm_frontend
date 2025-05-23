import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../layouts/DashboardLayout';
import MetricsCard from '../../components/admin/MetricsCard';
import inventoryService from '../../services/inventoryService';
import messageService from '../../services/messageService';
import { toast } from 'react-toastify';
import { FaUsers, FaWarehouse, FaShoppingCart, FaEnvelope, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [inventoryMetrics, setInventoryMetrics] = useState({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    inventoryValue: {
      totalValue: 0,
      totalStock: 0,
      averagePrice: 0
    },
    topProducts: []
  });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [error, setError] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Fetch inventory metrics
        try {
          const inventoryResponse = await inventoryService.getInventoryMetrics();
          setInventoryMetrics(inventoryResponse.data);
        } catch (err) {
          console.error('Error fetching inventory metrics:', err);
        }
        
        // Fetch unread messages
        try {
          const messagesResponse = await messageService.getUnreadCount();
          setUnreadMessages(messagesResponse.unreadCount || 0);
        } catch (err) {
          console.error('Error fetching unread messages:', err);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(true);
        setLoading(false);
        toast.error('Failed to load dashboard data. Please try again.');
      }
    };
    
    fetchData();
  }, []);
  
  // Mock data for demonstration
  const farmerStats = {
    totalFarmers: 32,
    pendingApproval: 5,
    activeFarmers: 27,
    newFarmersThisMonth: 8
  };
  
  const recentTransactions = [
    {
      id: 'TRX123456',
      date: '2023-06-28',
      farmer: 'Raj Kumar',
      product: 'Basmati Premium',
      quantity: 500,
      amount: 35000,
      status: 'Completed'
    },
    {
      id: 'TRX123457',
      date: '2023-06-27',
      farmer: 'Amit Singh',
      product: 'Brown Rice Organic',
      quantity: 300,
      amount: 24000,
      status: 'Processing'
    },
    {
      id: 'TRX123458',
      date: '2023-06-26',
      farmer: 'Priya Patel',
      product: 'Jasmine Rice',
      quantity: 450,
      amount: 31500,
      status: 'Completed'
    },
  ];
  
  // Early return for error case
  if (error) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <FaExclamationTriangle className="h-16 w-16 text-red-500 mx-auto" />
                <h2 className="mt-4 text-lg font-medium text-gray-900">Failed to load dashboard data</h2>
                <p className="mt-2 text-sm text-gray-500">There was an error loading the dashboard. Please try refreshing the page.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Welcome back, {user?.name} Admin!
                </h1>
                <p className="mt-1 text-primary-100">
                  Here's what's happening with your platform today.
                </p>
              </div>
              <div>
                <Link
                  to="/admin/reports"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  View Reports
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
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
              <MetricsCard
                title="Total Farmers"
                value={farmerStats.totalFarmers}
                trend="+12% from last month"
                icon={<FaUsers className="h-6 w-6" />}
                bgColor="bg-blue-500"
                onClick={() => window.location.href = '/admin/farmers'}
              />
              <MetricsCard
                title="Inventory Value"
                value={`₹${Math.round(inventoryMetrics.inventoryValue.totalValue).toLocaleString()}`}
                trend={`${inventoryMetrics.inventoryValue.totalStock.toLocaleString()} kg in stock`}
                icon={<FaWarehouse className="h-6 w-6" />}
                bgColor="bg-green-500"
                onClick={() => window.location.href = '/admin/inventory'}
              />
              <MetricsCard
                title="Low Stock Items"
                value={inventoryMetrics.lowStockItems}
                trend={`${inventoryMetrics.outOfStockItems} out of stock`}
                icon={<FaExclamationTriangle className="h-6 w-6" />}
                bgColor="bg-yellow-500"
                onClick={() => window.location.href = '/admin/inventory?filter=low-stock'}
              />
              <MetricsCard
                title="Recent Orders"
                value={recentTransactions.length}
                trend="Last 24 hours"
                icon={<FaShoppingCart className="h-6 w-6" />}
                bgColor="bg-purple-500"
                onClick={() => window.location.href = '/admin/orders'}
              />
            </div>
          )}

          {/* Recent Activity and Insights */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Transactions */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                <div className="mt-4 flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">ID</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Farmer</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {recentTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">{transaction.id}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.farmer}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">₹{transaction.amount.toLocaleString()}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  transaction.status === 'Completed' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {transaction.status}
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
                    to="/admin/transactions"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    View all transactions →
                  </Link>
                </div>
              </div>
            </div>

            {/* Farmer Activity */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Farmer Activity</h3>
                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Farmers</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{farmerStats.activeFarmers}</dd>
                    <dd className="mt-2 text-sm text-green-600">+{farmerStats.newFarmersThisMonth} this month</dd>
                  </div>
                  <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{farmerStats.pendingApproval}</dd>
                    <dd className="mt-2">
                      <Link
                        to="/admin/farmers?filter=pending"
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        Review applications →
                      </Link>
                    </dd>
                  </div>
                </dl>
                <div className="mt-6">
                  <Link
                    to="/admin/farmers"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    View all farmers →
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

export default AdminDashboard; 