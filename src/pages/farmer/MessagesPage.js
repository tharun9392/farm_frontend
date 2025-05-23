import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import MessageList from '../../components/farmer/MessageList';
import ConversationPanel from '../../components/farmer/ConversationPanel';
import NewMessageForm from '../../components/farmer/NewMessageForm';
import messageService from '../../services/messageService';

const MessagesPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState(userId ? 'conversation' : 'list');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Update view based on URL params
    if (userId) {
      setView('conversation');
    } else if (window.location.pathname.includes('/new')) {
      setView('new');
    } else {
      setView('list');
    }

    // Fetch unread message count
    fetchUnreadCount();

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const fetchUnreadCount = async () => {
    try {
      const response = await messageService.getUnreadCount();
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleBackToList = () => {
    navigate('/farmer/messages');
    setView('list');
  };

  const handleNewMessage = () => {
    navigate('/farmer/messages/new');
    setView('new');
  };

  const handleMessageSent = (recipientId) => {
    navigate(`/farmer/messages/${recipientId}`);
    setView('conversation');
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
              <p className="mt-1 text-sm text-gray-500">
                Communicate with administrators and support
              </p>
            </div>
            {view === 'list' && (
              <button
                type="button"
                onClick={handleNewMessage}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Message
              </button>
            )}
          </div>
          
          <div className="mt-6">
            {view === 'list' && <MessageList />}
            
            {view === 'conversation' && userId && (
              <ConversationPanel 
                receiverId={userId} 
                onBack={handleBackToList} 
              />
            )}
            
            {view === 'new' && (
              <NewMessageForm 
                onMessageSent={handleMessageSent}
                onCancel={handleBackToList}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage; 