import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaHistory, FaShoppingBag, FaStar, FaUser, FaHeart, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Move sample data outside the component to prevent recreation on each render
const sampleData = {
  orderCount: 8,
  pendingOrders: 2,
  deliveredOrders: 6,
  wishlistCount: 4,
  reviewCount: 5,
  recentOrders: [
    { _id: '1', orderNumber: 'ORD12345', totalAmount: 2500, status: 'Processing', createdAt: '2023-08-15T10:30:00Z' },
    { _id: '2', orderNumber: 'ORD12346', totalAmount: 1800, status: 'Delivered', createdAt: '2023-08-10T14:20:00Z' },
    { _id: '3', orderNumber: 'ORD12347', totalAmount: 3200, status: 'Shipped', createdAt: '2023-08-05T09:15:00Z' },
  ],
  recentlyViewedProducts: [
    { 
      _id: '1', 
      name: 'Basmati Rice', 
      price: 120, 
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dy%3D%22.3em%22%20fill%3D%22%23AAAAAA%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EBasmati%20Rice%3C%2Ftext%3E%3C%2Fsvg%3E'
    },
    { 
      _id: '2', 
      name: 'Brown Rice', 
      price: 95, 
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dy%3D%22.3em%22%20fill%3D%22%23AAAAAA%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EBrown%20Rice%3C%2Ftext%3E%3C%2Fsvg%3E'
    },
    { 
      _id: '3', 
      name: 'Jasmine Rice', 
      price: 140, 
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dy%3D%22.3em%22%20fill%3D%22%23AAAAAA%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EJasmine%20Rice%3C%2Ftext%3E%3C%2Fsvg%3E'
    },
  ]
};

const CustomerDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState({
    orderCount: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    wishlistCount: 0,
    reviewCount: 0,
    recentOrders: [],
    recentlyViewedProducts: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Use sample data directly without making API call - temporary solution
        setDashboardData(sampleData);
        
        // Uncomment this when backend endpoint is ready
        // const response = await api.get('/customers/dashboard');
        // setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
        // Use sample data as fallback on error
        setDashboardData(sampleData);
      }
    };

    fetchDashboardData();
  }, []); // Remove sampleData from dependencies since it's now static

  // Use sample data if API data is not available
  const data = dashboardData.orderCount === 0 ? sampleData : dashboardData;

  // Format date 
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format price to rupees with comma separators
  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      
      {/* Welcome Message */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border-l-4 border-green-500">
        <h3 className="font-semibold text-lg text-gray-800">Welcome back, {user?.name || 'Customer'}!</h3>
        <p className="text-gray-600 mt-1">Here's what's happening with your orders and account.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center">
          <div className="bg-blue-100 p-2 rounded-full mb-2">
            <FaBox className="text-blue-600 text-xl" />
          </div>
          <h4 className="font-semibold text-gray-700">Total Orders</h4>
          <p className="text-2xl font-bold text-blue-600">{data.orderCount}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center">
          <div className="bg-yellow-100 p-2 rounded-full mb-2">
            <FaHistory className="text-yellow-600 text-xl" />
          </div>
          <h4 className="font-semibold text-gray-700">Pending</h4>
          <p className="text-2xl font-bold text-yellow-600">{data.pendingOrders}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center">
          <div className="bg-green-100 p-2 rounded-full mb-2">
            <FaShoppingBag className="text-green-600 text-xl" />
          </div>
          <h4 className="font-semibold text-gray-700">Delivered</h4>
          <p className="text-2xl font-bold text-green-600">{data.deliveredOrders}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center">
          <div className="bg-purple-100 p-2 rounded-full mb-2">
            <FaStar className="text-purple-600 text-xl" />
          </div>
          <h4 className="font-semibold text-gray-700">Reviews</h4>
          <p className="text-2xl font-bold text-purple-600">{data.reviewCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="font-semibold text-lg text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/shop" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <FaShoppingBag className="text-green-600 text-2xl mb-2" />
            <span className="text-gray-700 font-medium text-sm">Shop Now</span>
          </Link>
          
          <Link to="/orders" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <FaBox className="text-blue-600 text-2xl mb-2" />
            <span className="text-gray-700 font-medium text-sm">My Orders</span>
          </Link>
          
          <Link to="/profile" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <FaUser className="text-purple-600 text-2xl mb-2" />
            <span className="text-gray-700 font-medium text-sm">My Profile</span>
          </Link>
          
          <Link to="/addresses" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <FaMapMarkerAlt className="text-red-600 text-2xl mb-2" />
            <span className="text-gray-700 font-medium text-sm">Addresses</span>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-800">Recent Orders</h3>
            <Link to="/orders" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {data.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {data.recentOrders.map(order => (
                <Link 
                  key={order._id} 
                  to={`/orders/${order._id}`}
                  className="block border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{order.orderNumber}</h4>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-800">{formatPrice(order.totalAmount)}</span>
                      <span className={`block text-xs px-2 py-1 rounded-full mt-1 ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-800' 
                          : order.status === 'Processing' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No orders yet</p>
              <Link to="/shop" className="mt-2 inline-block text-green-600 hover:text-green-700 font-medium">
                Start Shopping
              </Link>
            </div>
          )}
        </div>

        {/* Recently Viewed Products */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-800">Recently Viewed</h3>
            <Link to="/shop" className="text-green-600 hover:text-green-700 text-sm font-medium">
              Shop More
            </Link>
          </div>
          
          {data.recentlyViewedProducts.length > 0 ? (
            <div className="space-y-3">
              {data.recentlyViewedProducts.map(product => (
                <Link 
                  key={product._id} 
                  to={`/shop/${product._id}`}
                  className="flex items-center border border-gray-200 rounded-lg p-2 hover:bg-gray-50"
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="ml-3 flex-grow">
                    <h4 className="font-medium text-gray-800">{product.name}</h4>
                    <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
                  </div>
                  <button className="text-gray-400 hover:text-red-500">
                    <FaHeart />
                  </button>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No products viewed recently</p>
              <Link to="/shop" className="mt-2 inline-block text-green-600 hover:text-green-700 font-medium">
                Explore Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard; 