import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import api from '../../services/api';
import { FaBox, FaMoneyBillWave, FaExchangeAlt, FaChartLine } from 'react-icons/fa';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Loader from '../common/Loader';

const OrderAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  // Predefined colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  const STATUS_COLORS = {
    'Pending': '#FFBB28',
    'Processing': '#0088FE',
    'Packed': '#00C49F',
    'Shipped': '#8884d8',
    'Out for Delivery': '#82ca9d',
    'Delivered': '#4CAF50',
    'Cancelled': '#FF5252',
    'Returned': '#FF8042',
    'Refunded': '#9C27B0'
  };

  // Format currency to INR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/stats?range=${timeRange}`);
        setAnalyticsData(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order analytics:', err);
        
        // Show specific error messages based on the error type
        if (err.response) {
          if (err.response.status === 403) {
            setError('You do not have permission to access this data. This feature is only available to staff and admin users.');
          } else if (err.response.status === 401) {
            setError('Your session has expired. Please login again');
            // You could redirect to login page here
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
          } else {
            setError(`Failed to load analytics data: ${err.response.data?.message || 'Unknown error'}`);
          }
        } else if (err.request) {
          setError('Could not connect to the server. Please check your internet connection and try again.');
        } else {
          setError('An unexpected error occurred while loading analytics data.');
        }
        
        // Use sample data if development environment
        if (process.env.NODE_ENV === 'development') {
          console.log('Using sample data in development mode');
          setAnalyticsData(sampleData);
        }
        
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // For demo purposes, create sample data if API is not available
  const sampleData = {
    ordersByStatus: [
      { _id: 'Processing', count: 12, totalAmount: 18500 },
      { _id: 'Packed', count: 5, totalAmount: 7200 },
      { _id: 'Shipped', count: 8, totalAmount: 12400 },
      { _id: 'Delivered', count: 25, totalAmount: 35000 },
      { _id: 'Cancelled', count: 3, totalAmount: 4200 },
    ],
    ordersByDate: [
      { _id: '2023-08-01', count: 3, revenue: 4500 },
      { _id: '2023-08-02', count: 5, revenue: 7200 },
      { _id: '2023-08-03', count: 2, revenue: 3100 },
      { _id: '2023-08-04', count: 7, revenue: 10500 },
      { _id: '2023-08-05', count: 4, revenue: 6300 },
      { _id: '2023-08-06', count: 6, revenue: 9200 },
      { _id: '2023-08-07', count: 8, revenue: 12400 },
    ],
    topProducts: [
      { _id: '1', name: 'Premium Basmati Rice', totalQuantity: 45, totalRevenue: 5400 },
      { _id: '2', name: 'Organic Brown Rice', totalQuantity: 32, totalRevenue: 3040 },
      { _id: '3', name: 'Jasmine Rice', totalQuantity: 28, totalRevenue: 3920 },
      { _id: '4', name: 'Sona Masoori Rice', totalQuantity: 24, totalRevenue: 2040 },
      { _id: '5', name: 'Ponni Rice', totalQuantity: 20, totalRevenue: 1800 },
    ],
    paymentMethods: [
      { _id: 'Credit Card', count: 18, totalAmount: 27000 },
      { _id: 'Debit Card', count: 12, totalAmount: 15600 },
      { _id: 'UPI', count: 15, totalAmount: 21000 },
      { _id: 'Cash on Delivery', count: 8, totalAmount: 9800 },
    ]
  };

  // Use sample data if actual data is not available
  const data = analyticsData || sampleData;

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader /></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600">
        <p className="text-center">{error}</p>
      </div>
    );
  }

  // Calculate total values
  const totalOrders = data.ordersByStatus.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = data.ordersByStatus.reduce((sum, item) => sum + item.totalAmount, 0);
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Order Analytics</h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 365 Days</option>
          </select>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalOrders}</h3>
            </div>
            <FaBox className="text-blue-500 text-3xl" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalRevenue)}</h3>
            </div>
            <FaMoneyBillWave className="text-green-500 text-3xl" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Average Order Value</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : formatCurrency(0)}
              </h3>
            </div>
            <FaExchangeAlt className="text-purple-500 text-3xl" />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Conversion Rate</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">3.6%</h3>
            </div>
            <FaChartLine className="text-yellow-500 text-3xl" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Orders by Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Orders by Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.ordersByStatus}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Orders' : 'Amount']} />
                <Legend />
                <Bar dataKey="count" name="Orders" fill="#8884d8" />
                <Bar dataKey="totalAmount" name="Revenue (₹)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Orders by Date */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Orders & Revenue Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.ordersByDate}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => [
                  name === 'count' ? value : formatCurrency(value),
                  name === 'count' ? 'Orders' : 'Revenue'
                ]} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  name="Orders"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.topProducts.map((product, index) => (
                  <tr key={product._id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {product.totalQuantity} units
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {formatCurrency(product.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Payment Methods */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="_id"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [
                  props.payload.count,
                  props.payload._id
                ]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderAnalytics; 