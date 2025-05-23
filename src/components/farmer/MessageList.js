import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import messageService from '../../services/messageService';

const MessageList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.conversations || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations. Please try again.');
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date >= today) {
        return format(date, 'h:mm a'); // Today
      } else if (date >= yesterday) {
        return 'Yesterday'; // Yesterday
      } else {
        return format(date, 'MMM d'); // Older dates
      }
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Messages</h3>
        <p className="mt-1 text-sm text-gray-500">
          Communications with administrators and support
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-10 px-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start a conversation with an administrator for support.
          </p>
          <div className="mt-6">
            <Link
              to="/farmer/messages/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Message
            </Link>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 overflow-y-auto max-h-96">
          {conversations.map((conversation) => (
            <li key={conversation.conversationId}>
              <Link
                to={`/farmer/messages/${conversation.otherUser._id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        {conversation.otherUser.avatar ? (
                          <img
                            className="h-12 w-12 rounded-full"
                            src={conversation.otherUser.avatar}
                            alt={conversation.otherUser.name}
                          />
                        ) : (
                          <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {conversation.otherUser.name}
                          </p>
                          <p className="ml-1 text-xs text-gray-500">
                            ({conversation.otherUser.role === 'admin' ? 'Administrator' : 'Staff'})
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className={`mt-1 text-sm ${conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'} truncate`}>
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-5">
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(conversation.lastMessage.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessageList; 