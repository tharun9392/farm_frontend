import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, markAsRead, markAllAsRead } from '../../features/notifications/notificationSlice';
import messageService from '../../services/messageService';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, isLoading } = useSelector(
    (state) => state.notifications
  );
  const { user } = useSelector((state) => state.auth);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  // Fetch notifications on component mount
  useEffect(() => {
    dispatch(getNotifications());
    fetchUnreadMessages();

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadMessages, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  // Fetch unread message count
  const fetchUnreadMessages = async () => {
    try {
      const response = await messageService.getUnreadCount();
      setUnreadMessages(response.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = (e) => {
    e.preventDefault();
    dispatch(markAllAsRead());
  };

  // Get total unread count (notifications + messages)
  const totalUnreadCount = unreadCount + unreadMessages;

  // Get relative time string
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={toggleDropdown}
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1 divide-y divide-gray-100">
            <div className="px-4 py-3 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-800"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Messages notification */}
            {unreadMessages > 0 && (
              <div className="px-4 py-3 bg-blue-50 hover:bg-blue-100">
                <Link 
                  to={user?.role === 'farmer' ? '/farmer/messages' : '/admin/messages'} 
                  className="block"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex justify-between">
                    <div className="w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        New Messages
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        You have {unreadMessages} unread {unreadMessages === 1 ? 'message' : 'messages'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        just now
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            <div className="max-h-72 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-4 py-3 hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification._id, e)}
                          className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-5 text-center">
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              )}
            </div>

            <div className="px-4 py-3 text-center flex justify-between">
              <Link
                to="/notifications"
                className="text-sm font-medium text-primary-600 hover:text-primary-800"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
              
              <Link
                to={user?.role === 'farmer' ? '/farmer/messages' : '/admin/messages'}
                className="text-sm font-medium text-primary-600 hover:text-primary-800"
                onClick={() => setIsOpen(false)}
              >
                View messages
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 