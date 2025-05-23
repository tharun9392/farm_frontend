import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
          { name: 'Dashboard', href: '/admin/dashboard', icon: 'chart-bar' },
          { name: 'Users', href: '/admin/users', icon: 'users' },
          { name: 'Farmers', href: '/admin/farmers', icon: 'user-group' },
          { name: 'Products', href: '/admin/products', icon: 'cube' },
          { name: 'Pending Paddy', href: '/admin/pending-products', icon: 'clock' },
          { name: 'Process Paddy', href: '/admin/process-paddy', icon: 'refresh' },
          { name: 'Inventory', href: '/admin/inventory', icon: 'archive' },
          { name: 'Orders', href: '/admin/orders', icon: 'shopping-cart' },
          { name: 'Order Analytics', href: '/admin/order-analytics', icon: 'chart-pie' },
          { name: 'Reports', href: '/admin/reports', icon: 'document-report' },
          { name: 'Settings', href: '/admin/settings', icon: 'cog' },
        ];
      case 'staff':
        return [
          { name: 'Dashboard', href: '/staff/dashboard', icon: 'chart-bar' },
          { name: 'Pending Paddy', href: '/staff/pending-products', icon: 'clock' },
          { name: 'Process Paddy', href: '/staff/process-paddy', icon: 'refresh' },
          { name: 'Inventory', href: '/staff/inventory', icon: 'archive' },
          { name: 'Orders', href: '/staff/orders', icon: 'shopping-cart' },
          { name: 'Order Analytics', href: '/staff/order-analytics', icon: 'chart-pie' },
          { name: 'Customers', href: '/staff/customers', icon: 'users' },
          { name: 'Tasks', href: '/staff/tasks', icon: 'clipboard-list' },
        ];
      case 'farmer':
        return [
          { name: 'Dashboard', href: '/farmer/dashboard', icon: 'chart-bar' },
          { name: 'Sell Paddy', href: '/farmer/sell-paddy', icon: 'cube' },
          { name: 'My Paddy Sales', href: '/farmer/sales', icon: 'cash' },
          { name: 'Transactions', href: '/farmer/transactions', icon: 'currency-rupee' },
          { name: 'Messages', href: '/farmer/messages', icon: 'chat' },
          { name: 'Settings', href: '/farmer/settings', icon: 'cog' },
        ];
      case 'customer':
        return [
          { name: 'Dashboard', href: '/customer/dashboard', icon: 'chart-bar' },
          { name: 'Shop', href: '/customer/shop', icon: 'shopping-bag' },
          { name: 'Orders', href: '/customer/orders', icon: 'shopping-cart' },
          { name: 'Wishlist', href: '/customer/wishlist', icon: 'heart' },
          { name: 'Reviews', href: '/customer/reviews', icon: 'star' },
          { name: 'Settings', href: '/customer/settings', icon: 'cog' },
        ];
      default:
        return [];
    }
  };

  const navigation = getNavigation();

  // Utility function to render icons
  const renderIcon = (iconName) => {
    // This is a simple placeholder - you might want to use a proper icon library like heroicons
    return (
      <svg
        className="mr-3 h-5 w-5 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 flex transform transition-transform md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative flex w-full max-w-xs flex-col bg-white pt-5 pb-4">
          <div className="absolute top-0 right-0 p-2">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-shrink-0 items-center px-4">
            <Link to="/" className="text-xl font-bold text-primary-600">
              FarmeRice
            </Link>
          </div>

          <div className="mt-5 flex flex-1 flex-col px-2">
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center rounded-md px-3 py-2 text-sm font-medium`}
                >
                  {renderIcon(item.icon)}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <svg
                className="mr-3 h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <Link to="/" className="text-xl font-bold text-primary-600">
                FarmeRice
              </Link>
            </div>
            <div className="mt-5 flex flex-1 flex-col px-2">
              <nav className="flex-1 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    {renderIcon(item.icon)}
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.profileImage ? (
                  <img
                    src={getUserProfileImage(user.profileImage)}
                    alt={user?.name || "User"}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-500 text-white flex items-center justify-center">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <svg
                className="mr-3 h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
          <button
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
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