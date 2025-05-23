import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../features/notifications/notificationSlice';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, isLoading, unreadCount } = useSelector((state) => state.notifications);
  
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all');
  
  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);
  
  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };
  
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      dispatch(deleteNotification(id));
    }
  };
  
  const getTimeAgo = (date) => {
    const now = new Date();
    const createdAt = new Date(date);
    const timeDifference = now - createdAt;
    
    // Convert time difference to appropriate unit
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) {
      return createdAt.toLocaleDateString();
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  const getTypeLabel = (type) => {
    switch (type) {
      case 'order':
        return 'Order';
      case 'payment':
        return 'Payment';
      case 'inventory':
        return 'Inventory';
      case 'account':
        return 'Account';
      case 'system':
        return 'System';
      case 'message':
        return 'Message';
      case 'low-stock':
        return 'Low Stock';
      case 'delivery':
        return 'Delivery';
      case 'quality':
        return 'Quality Check';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'inventory':
        return 'bg-yellow-100 text-yellow-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'account':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      case 'message':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivery':
        return 'bg-orange-100 text-orange-800';
      case 'quality':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getIconForType = (type) => {
    switch (type) {
      case 'order':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'payment':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        );
      case 'inventory':
      case 'low-stock':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
      case 'account':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'message':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case 'delivery':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  // Filter notifications
  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'read') return notification.isRead;
      if (filter === 'unread') return !notification.isRead;
      return true;
    })
    .filter(notification => {
      if (typeFilter === 'all') return true;
      return notification.type === typeFilter;
    });
  
  // Get unique notification types for filter dropdown
  const notificationTypes = ['all', ...new Set(notifications.map(n => n.type))];
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage your notification history
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-4 border-b border-gray-200 sm:px-6 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-4">
                <div>
                  <label htmlFor="filter" className="sr-only">Filter</label>
                  <select
                    id="filter"
                    name="filter"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="unread">Unread ({unreadCount})</option>
                    <option value="read">Read</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="typeFilter" className="sr-only">Type</label>
                  <select
                    id="typeFilter"
                    name="typeFilter"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    {notificationTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : getTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'unread' ? 'You have no unread notifications.' : 'No notifications match your current filters.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <li key={notification._id} className={`${!notification.isRead ? 'bg-blue-50' : ''}`}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {getIconForType(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                                {getTypeLabel(notification.type)}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            {notification.actionLink && (
                              <div className="mt-2">
                                <Link 
                                  to={notification.actionLink}
                                  className="text-sm font-medium text-primary-600 hover:text-primary-800"
                                >
                                  View details
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-start space-x-4">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="bg-white rounded-md text-sm font-medium text-primary-600 hover:text-primary-800 focus:outline-none"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="bg-white rounded-md text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage; 