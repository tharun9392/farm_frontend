import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from '@headlessui/react';
import { FaBars, FaTimes, FaChartBar, FaUsers, FaCube, FaClock, FaSync, 
  FaArchive, FaShoppingCart, FaChartPie, FaFileAlt, FaCog, FaClipboardList,
  FaSignOutAlt, FaStore, FaHeart, FaStar, FaShoppingBag, FaHistory,
  FaMoneyBillWave, FaBoxOpen } from 'react-icons/fa';
import { logout } from '../features/auth/authSlice';
import { getUserProfileImage, handleImageError } from '../utils/imageUtils';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Generate navigation based on user role
  const getNavigation = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: <FaChartBar /> },
          { name: 'Users', href: '/admin/users', icon: <FaUsers /> },
          { name: 'Farmers', href: '/admin/farmers', icon: <FaUsers /> },
          { name: 'Products', href: '/admin/products', icon: <FaCube /> },
          { name: 'Pending Paddy', href: '/admin/pending-products', icon: <FaClock /> },
          { name: 'Process Paddy', href: '/admin/process-paddy', icon: <FaSync /> },
          { name: 'Inventory', href: '/admin/inventory', icon: <FaArchive /> },
          { name: 'Orders', href: '/admin/orders', icon: <FaShoppingCart /> },
          { name: 'Order Analytics', href: '/admin/order-analytics', icon: <FaChartPie /> },
          { name: 'Reports', href: '/admin/reports', icon: <FaFileAlt /> },
          { name: 'Settings', href: '/admin/settings', icon: <FaCog /> },
        ];
      case 'staff':
        return [
          { name: 'Dashboard', href: '/staff/dashboard', icon: <FaChartBar /> },
          { name: 'Pending Paddy', href: '/staff/pending-products', icon: <FaClock /> },
          { name: 'Process Paddy', href: '/staff/process-paddy', icon: <FaSync /> },
          { name: 'Inventory', href: '/staff/inventory', icon: <FaArchive /> },
          { name: 'Orders', href: '/staff/orders', icon: <FaShoppingCart /> },
          { name: 'Order Analytics', href: '/staff/order-analytics', icon: <FaChartPie /> },
          { name: 'Customers', href: '/staff/customers', icon: <FaUsers /> },
          { name: 'Tasks', href: '/staff/tasks', icon: <FaClipboardList /> },
        ];
      case 'farmer':
        return [
          { name: 'Dashboard', href: '/farmer/dashboard', icon: <FaChartBar /> },
          { name: 'Sell Paddy', href: '/farmer/sell-paddy', icon: <FaBoxOpen /> },
          { name: 'My Sales', href: '/farmer/sales', icon: <FaMoneyBillWave /> },
          { name: 'Transactions', href: '/farmer/transactions', icon: <FaHistory /> },
          { name: 'Settings', href: '/farmer/settings', icon: <FaCog /> },
        ];
      case 'customer':
        return [
          { name: 'Dashboard', href: '/customer/dashboard', icon: <FaChartBar /> },
          { name: 'Shop', href: '/customer/shop', icon: <FaStore /> },
          { name: 'Orders', href: '/customer/orders', icon: <FaShoppingBag /> },
          { name: 'Wishlist', href: '/customer/wishlist', icon: <FaHeart /> },
          { name: 'Reviews', href: '/customer/reviews', icon: <FaStar /> },
          { name: 'Settings', href: '/customer/settings', icon: <FaCog /> },
        ];
      default:
        return [];
    }
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 flex transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative flex w-full max-w-xs flex-col bg-white pt-5 pb-4 shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex flex-shrink-0 items-center px-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-green-600">FarmeRice</span>
            </Link>
          </div>

          <div className="mt-8 flex flex-1 flex-col px-3">
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out ${
                    location.pathname === item.href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  <span className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    location.pathname === item.href ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                  }`}>
                    {item.icon}
                  </span>
                  {item.name}
                  {location.pathname === item.href && (
                    <span className="absolute inset-y-0 left-0 w-1 bg-primary-600 rounded-tr-lg rounded-br-lg" 
                    aria-hidden="true"></span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.profileImage ? (
                  <img
                    src={getUserProfileImage(user.profileImage)}
                    alt={user?.name || "User"}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-500 text-white flex items-center justify-center ring-2 ring-white">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <FaSignOutAlt className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-lg">
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-green-600">FarmeRice</span>
            </Link>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 space-y-2 px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out ${
                    location.pathname === item.href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  <span className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    location.pathname === item.href ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                  }`}>
                    {item.icon}
                  </span>
                  {item.name}
                  {location.pathname === item.href && (
                    <span className="absolute inset-y-0 left-0 w-1 bg-primary-600 rounded-tr-lg rounded-br-lg" 
                    aria-hidden="true"></span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.profileImage ? (
                  <img
                    src={getUserProfileImage(user.profileImage)}
                    alt={user?.name || "User"}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-500 text-white flex items-center justify-center ring-2 ring-white">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Sign out"
              >
                <FaSignOutAlt className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm md:hidden">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <FaBars className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 