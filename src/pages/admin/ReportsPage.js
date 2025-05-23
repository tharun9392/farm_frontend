import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import reportService from '../../services/reportService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-toastify';

// Helper function to format currency
const formatCurrency = (value) => {
  return `₹${Number(value).toLocaleString('en-IN')}`;
};

const ReportsPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const defaultAnalyticsData = {
    dashboard: {
      totalFarmers: 0,
      totalCustomers: 0,
      totalProducts: 0,
      newUsers: 0,
      inventory: {
        totalItems: 0,
        totalStock: 0,
        lowStockItems: 0,
        totalValue: 0
      },
      sales: {
        totalSales: 0,
        totalRevenue: 0
      },
      pendingTasks: 0
    },
    sales: {
      salesByDate: [],
      salesByCategory: [],
      salesByPaymentMethod: []
    },
    inventory: {
      totalValue: 0,
      totalStock: 0,
      lowStockItems: 0,
      stockByCategory: [],
      stockAgeDistribution: []
    },
    farmers: {
      totalFarmers: 0,
      activeFarmers: 0,
      newFarmers: 0,
      topFarmersBySales: [],
      farmersByLocation: []
    }
  };
  
  const [analyticsData, setAnalyticsData] = useState(defaultAnalyticsData);
  const [period, setPeriod] = useState('month');

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard analytics
        let dashboardData = null;
        try {
          const dashboardResponse = await reportService.getDashboardAnalytics();
          dashboardData = dashboardResponse.data;
        } catch (error) {
          console.error('Error fetching dashboard analytics:', error);
          toast.error('Failed to load dashboard analytics');
          dashboardData = null;
        }
        
        // Fetch sales analytics
        let salesData = null;
        try {
          const salesResponse = await reportService.getSalesAnalytics(period);
          salesData = salesResponse.data;
        } catch (error) {
          console.error('Error fetching sales analytics:', error);
          toast.error('Failed to load sales analytics');
          salesData = null;
        }
        
        // Fetch inventory analytics
        let inventoryData = null;
        try {
          const inventoryResponse = await reportService.getInventoryAnalytics();
          inventoryData = inventoryResponse.data;
        } catch (error) {
          console.error('Error fetching inventory analytics:', error);
          toast.error('Failed to load inventory analytics');
          inventoryData = null;
        }
        
        // Fetch farmer analytics
        let farmerData = null;
        try {
          const farmerResponse = await reportService.getFarmerAnalytics();
          farmerData = farmerResponse.data;
        } catch (error) {
          console.error('Error fetching farmer analytics:', error);
          toast.error('Failed to load farmer analytics');
          farmerData = null;
        }
        
        // Create a deep merged object for safety
        setAnalyticsData({
          dashboard: dashboardData ? {
            ...defaultAnalyticsData.dashboard,
            ...dashboardData,
            inventory: {
              ...defaultAnalyticsData.dashboard.inventory,
              ...(dashboardData.inventory || {})
            },
            sales: {
              ...defaultAnalyticsData.dashboard.sales,
              ...(dashboardData.sales || {})
            }
          } : analyticsData.dashboard,
          sales: salesData ? {
            ...defaultAnalyticsData.sales,
            ...salesData,
            salesByDate: salesData.salesByDate || [],
            salesByCategory: salesData.salesByCategory || [],
            salesByPaymentMethod: salesData.salesByPaymentMethod || []
          } : analyticsData.sales,
          inventory: inventoryData ? {
            ...defaultAnalyticsData.inventory,
            ...inventoryData,
            stockByCategory: inventoryData.stockByCategory || [],
            stockAgeDistribution: inventoryData.stockAgeDistribution || []
          } : analyticsData.inventory,
          farmers: farmerData ? {
            ...defaultAnalyticsData.farmers,
            ...farmerData,
            topFarmersBySales: farmerData.topFarmersBySales || [],
            farmersByLocation: farmerData.farmersByLocation || []
          } : analyticsData.farmers
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Handle period change for sales analytics
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Custom Tab implementation
  const tabItems = ['Dashboard', 'Sales', 'Inventory', 'Farmers'];

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics & Reports</h1>
          
          {loading ? (
            <div className="mt-6 flex justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="mt-6">
              {/* Custom Tab List */}
              <div className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                {tabItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTab(index)}
                    className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
                      ${selectedTab === index 
                        ? 'bg-white shadow' 
                        : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'}`
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
              
              {/* Tab Panels */}
              <div className="mt-6">
                {/* Dashboard Analytics */}
                {selectedTab === 0 && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* User Metrics */}
                    <div className="bg-white shadow rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900">User Metrics</h3>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">Farmers</p>
                          <p className="text-xl font-semibold">{analyticsData.dashboard.totalFarmers}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          <p className="text-sm text-green-800">Customers</p>
                          <p className="text-xl font-semibold">{analyticsData.dashboard.totalCustomers}</p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <p className="text-sm text-indigo-800">Products</p>
                          <p className="text-xl font-semibold">{analyticsData.dashboard.totalProducts}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <p className="text-sm text-purple-800">New Users</p>
                          <p className="text-xl font-semibold">{analyticsData.dashboard.newUsers}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Inventory Summary */}
                    <div className="bg-white shadow rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900">Inventory Summary</h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">Total Items</p>
                          <p className="text-lg font-medium">{analyticsData.dashboard.inventory.totalItems}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">Total Stock</p>
                          <p className="text-lg font-medium">{analyticsData.dashboard.inventory.totalStock} kg</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">Low Stock Items</p>
                          <p className="text-lg font-medium text-yellow-600">{analyticsData.dashboard.inventory.lowStockItems}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">Inventory Value</p>
                          <p className="text-lg font-medium text-green-600">{formatCurrency(analyticsData.dashboard.inventory.totalValue)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sales Metrics */}
                    <div className="bg-white shadow rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900">Sales Metrics (30 days)</h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">Total Sales</p>
                          <p className="text-lg font-medium">{analyticsData.dashboard.sales.totalSales}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">Total Revenue</p>
                          <p className="text-lg font-medium text-green-600">{formatCurrency(analyticsData.dashboard.sales.totalRevenue)}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">Avg. Sale Value</p>
                          <p className="text-lg font-medium">{analyticsData.dashboard.sales.totalSales ? 
                            formatCurrency(analyticsData.dashboard.sales.totalRevenue / analyticsData.dashboard.sales.totalSales) : 
                            formatCurrency(0)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Task Status */}
                    <div className="bg-white shadow rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900">Task Status</h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">Pending Tasks</p>
                          <p className="text-lg font-medium text-yellow-600">{analyticsData.dashboard.pendingTasks}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Sales Analytics */}
                {selectedTab === 1 && (
                  <div>
                    <div className="bg-white shadow rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Sales Analytics</h3>
                        <select
                          className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          value={period}
                          onChange={handlePeriodChange}
                        >
                          <option value="week">Last Week</option>
                          <option value="month">Last Month</option>
                          <option value="quarter">Last Quarter</option>
                          <option value="year">Last Year</option>
                        </select>
                      </div>
                      
                      {/* Sales Trend Chart */}
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={analyticsData.sales.salesByDate || []}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Line type="monotone" dataKey="totalAmount" name="Revenue" stroke="#8884d8" />
                            <Line type="monotone" dataKey="count" name="Sales Count" stroke="#82ca9d" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Sales by Category */}
                      <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={analyticsData.sales.salesByCategory || []}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="_id" />
                              <YAxis />
                              <Tooltip formatter={(value, name) => name === 'totalAmount' ? formatCurrency(value) : value} />
                              <Legend />
                              <Bar dataKey="totalAmount" name="Revenue" fill="#8884d8" />
                              <Bar dataKey="count" name="Sales Count" fill="#82ca9d" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      {/* Sales by Payment Method */}
                      <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Payment Method</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.sales.salesByPaymentMethod || []}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="totalAmount"
                                nameKey="_id"
                                label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                              >
                                {analyticsData.sales.salesByPaymentMethod && analyticsData.sales.salesByPaymentMethod.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Inventory Analytics */}
                {selectedTab === 2 && (
                  <div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                      <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900">Inventory Value</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(analyticsData.inventory.totalValue)}</p>
                      </div>
                      
                      <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900">Total Stock</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600">{analyticsData.inventory.totalStock} kg</p>
                      </div>
                      
                      <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900">Low Stock Items</h3>
                        <p className="mt-2 text-3xl font-bold text-yellow-600">{analyticsData.inventory.lowStockItems}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Stock by Category */}
                      <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Stock by Category</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={analyticsData.inventory.stockByCategory || []}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="category" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="quantity" name="Stock Quantity (kg)" fill="#8884d8" />
                              <Bar dataKey="value" name="Stock Value" fill="#82ca9d" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      {/* Stock Age Distribution */}
                      <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Age Distribution</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.inventory.stockAgeDistribution || []}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="quantity"
                                nameKey="ageGroup"
                                label={({ ageGroup, percent }) => `${ageGroup} (${(percent * 100).toFixed(0)}%)`}
                              >
                                {analyticsData.inventory.stockAgeDistribution && analyticsData.inventory.stockAgeDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Farmer Analytics */}
                {selectedTab === 3 && (
                  <div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                      <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900">Total Farmers</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600">{analyticsData.farmers.totalFarmers}</p>
                      </div>
                      
                      <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900">Active Farmers</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600">{analyticsData.farmers.activeFarmers}</p>
                      </div>
                      
                      <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900">New Farmers (30 days)</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600">{analyticsData.farmers.newFarmers}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Top Farmers by Sales */}
                      <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Farmers by Sales</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={analyticsData.farmers.topFarmersBySales || []}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="farmerName" width={100} />
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                              <Bar dataKey="totalSales" name="Total Sales" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      {/* Farmer Products Distribution */}
                      <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Farmers by Location</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.farmers.farmersByLocation || []}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="location"
                                label={({ location, percent }) => `${location} (${(percent * 100).toFixed(0)}%)`}
                              >
                                {analyticsData.farmers.farmersByLocation && analyticsData.farmers.farmersByLocation.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;