import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FaSync, FaChartLine, FaInfoCircle } from 'react-icons/fa';
import inventoryService from '../../services/inventoryService';
import Loader from '../common/Loader';

const InventoryForecasting = ({ inventoryId }) => {
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [runningForecast, setRunningForecast] = useState(false);

  useEffect(() => {
    fetchForecastData();
  }, [inventoryId]);

  const fetchForecastData = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventoryForecast(inventoryId);
      setForecastData(response.data.forecast);
      setSalesTrend(response.data.salesTrend || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      toast.error('Failed to load forecasting data');
      setLoading(false);
    }
  };

  const runForecast = async () => {
    try {
      setRunningForecast(true);
      toast.info('Running forecast calculation...');
      await inventoryService.runBulkForecasting();
      await fetchForecastData();
      toast.success('Forecast updated successfully');
      setRunningForecast(false);
    } catch (error) {
      console.error('Error running forecast:', error);
      toast.error('Failed to run forecast');
      setRunningForecast(false);
    }
  };

  const formatSalesTrendData = () => {
    // Ensure data is sorted by period
    return [...salesTrend].sort((a, b) => {
      return a.period.localeCompare(b.period);
    });
  };

  if (loading) {
    return <div className="p-4 flex justify-center"><Loader /></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Inventory Forecasting</h2>
        <button
          onClick={runForecast}
          disabled={runningForecast}
          className="bg-blue-600 text-white px-3 py-1 rounded flex items-center space-x-1 hover:bg-blue-700 disabled:opacity-50"
        >
          <FaSync className={`h-4 w-4 ${runningForecast ? 'animate-spin' : ''}`} />
          <span>Update Forecast</span>
        </button>
      </div>
      
      {forecastData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Forecast Metrics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <FaChartLine className="mr-2 text-blue-600" />
              Forecast Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Predicted Monthly Demand</p>
                <p className="text-xl font-semibold">{forecastData.predictedDemand} units</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Confidence Level</p>
                <p className="text-xl font-semibold">{forecastData.confidenceLevel}%</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Recommended Reorder Qty</p>
                <p className="text-xl font-semibold">{forecastData.recommendedReorderQuantity} units</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Reorder Point</p>
                <p className="text-xl font-semibold">{forecastData.reorderPoint} units</p>
              </div>
            </div>
            {forecastData.confidenceLevel < 50 && (
              <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex items-start">
                <FaInfoCircle className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  Low confidence forecast. Consider collecting more sales data for better predictions.
                </p>
              </div>
            )}
          </div>
          
          {/* Sales Trend Chart */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium mb-3">Sales History Trend</h3>
            {salesTrend.length >= 3 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={formatSalesTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="quantitySold" stroke="#3B82F6" name="Quantity Sold" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 bg-white rounded p-4">
                <FaInfoCircle className="text-gray-400 text-4xl mb-2" />
                <p className="text-gray-500 text-center">
                  Insufficient sales history data. At least 3 months of data is required for trend analysis.
                </p>
              </div>
            )}
          </div>
          
          {/* Revenue Chart */}
          {salesTrend.length >= 3 && (
            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
              <h3 className="text-md font-medium mb-3">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={formatSalesTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg flex flex-col items-center justify-center">
          <FaInfoCircle className="text-gray-400 text-4xl mb-3" />
          <p className="text-gray-600 text-center mb-4">
            No forecast data available for this inventory item.
          </p>
          <button
            onClick={runForecast}
            disabled={runningForecast}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Generate Forecast
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryForecasting; 