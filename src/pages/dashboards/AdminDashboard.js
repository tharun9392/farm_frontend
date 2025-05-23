import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../layouts/DashboardLayout';
import MetricsCard from '../../components/admin/MetricsCard';
import inventoryService from '../../services/inventoryService';
import messageService from '../../services/messageService';
import { toast } from 'react-toastify';

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
          // Use default values (already set in state)
        }
        
        // Fetch unread messages
        try {
          const messagesResponse = await messageService.getUnreadCount();
          setUnreadMessages(messagesResponse.unreadCount || 0);
        } catch (err) {
          console.error('Error fetching unread messages:', err);
          // Use default value
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
  
  // Mock data for demonstration - in a real app, these would come from API calls
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="mt-4 text-lg font-medium text-gray-900">Failed to load dashboard data</h2>
                <p className="mt-2 text-sm text-gray-500">There was an error loading the dashboard. Please try refreshing the page.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 btn btn-primary"
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
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          
          {/* Welcome message */}
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    Welcome, {user?.name || 'Admin'}!
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage the Farmer Rice platform from your centralized admin dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main metrics */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Platform Overview</h2>
            
            {loading ? (
              <div className="mt-4 flex justify-center">
                <div className="spinner"></div>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Inventory value */}
                <MetricsCard
                  title="Inventory Value"
                  value={`₹${Math.round(inventoryMetrics.inventoryValue.totalValue).toLocaleString()}`}
                  icon={{
                    bgColor: 'bg-green-100',
                    color: 'text-green-600',
                    svg: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  }}
                  subtext={`Total stock: ${Math.round(inventoryMetrics.inventoryValue.totalStock).toLocaleString()} kg`}
                  onClick={() => window.location.href = '/admin/inventory'}
                />
                
                {/* Low stock items */}
                <MetricsCard
                  title="Low Stock Items"
                  value={inventoryMetrics.lowStockItems}
                  icon={{
                    bgColor: 'bg-yellow-100',
                    color: 'text-yellow-600',
                    svg: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )
                  }}
                  subtext={`${inventoryMetrics.outOfStockItems} items out of stock`}
                  onClick={() => window.location.href = '/admin/inventory?lowStock=true'}
                />
                
                {/* Farmers */}
                <MetricsCard
                  title="Registered Farmers"
                  value={farmerStats.totalFarmers}
                  icon={{
                    bgColor: 'bg-blue-100',
                    color: 'text-blue-600',
                    svg: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )
                  }}
                  subtext={`${farmerStats.pendingApproval} pending approval`}
                  onClick={() => window.location.href = '/admin/farmers'}
                />
                
                {/* Messages */}
                <MetricsCard
                  title="Unread Messages"
                  value={unreadMessages}
                  icon={{
                    bgColor: 'bg-indigo-100',
                    color: 'text-indigo-600',
                    svg: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    )
                  }}
                  onClick={() => window.location.href = '/admin/messages'}
                />
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            
            <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Approve Farmers</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Review and approve farmer registration requests.
                  </p>
                  <div className="mt-4">
                    <Link to="/admin/farmers/pending" className="btn btn-primary w-full justify-center">
                      Review Requests ({farmerStats.pendingApproval})
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Manage Inventory</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View and update rice inventory levels.
                  </p>
                  <div className="mt-4">
                    <Link to="/admin/inventory" className="btn btn-primary w-full justify-center">
                      View Inventory
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Purchase from Farmers</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add rice products from farmers to inventory.
                  </p>
                  <div className="mt-4">
                    <Link to="/admin/inventory/purchase" className="btn btn-primary w-full justify-center">
                      Purchase Rice
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Process Paddy to Rice</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Convert approved paddy to processed rice for customers.
                  </p>
                  <div className="mt-4">
                    <Link to="/admin/process-paddy" className="btn btn-primary w-full justify-center">
                      Process Paddy
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Manage Staff</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage staff accounts and permissions.
                  </p>
                  <div className="mt-4">
                    <Link to="/admin/staff" className="btn btn-primary w-full justify-center">
                      View Staff
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Assign Tasks</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create and assign tasks to staff members.
                  </p>
                  <div className="mt-4">
                    <Link to="/admin/tasks" className="btn btn-primary w-full justify-center">
                      Manage Tasks
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">View Reports</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Access analytics and reports for the platform.
                  </p>
                  <div className="mt-4">
                    <Link to="/admin/reports" className="btn btn-primary w-full justify-center">
                      View Reports
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Manage Products</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Review and approve products from farmers.
                  </p>
                  <div className="mt-4">
                    <Link to="/admin/products" className="btn btn-primary w-full justify-center">
                      Manage Products
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
              <Link to="/admin/transactions" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
            
            <div className="mt-3 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farmer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                          <Link to={`/admin/transactions/${transaction.id}`}>
                            {transaction.id}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.farmer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.product}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.quantity} kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            transaction.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard; 