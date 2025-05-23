import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import messageService from '../../services/messageService';
import { toast } from 'react-toastify';

const AdminMessagesPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      if (userId) {
        // Fetch specific conversation
        const response = await messageService.getConversation(userId);
        setSelectedConversation(response.conversation);
      } else {
        // Fetch all conversations
        const response = await messageService.getAdminConversations();
        setMessages(response.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await messageService.sendMessage({
        receiverId: selectedConversation.userId,
        content: newMessage.trim()
      });
      setNewMessage('');
      fetchMessages(); // Refresh messages
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage communications with farmers and customers
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : selectedConversation ? (
                <div className="flex flex-col h-[calc(100vh-300px)]">
                  {/* Conversation Header */}
                  <div className="border-b border-gray-200 px-4 py-4 sm:px-6 flex items-center">
                    <button
                      onClick={() => {
                        setSelectedConversation(null);
                        navigate('/admin/messages');
                      }}
                      className="mr-4 text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {selectedConversation.userName}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.userRole.charAt(0).toUpperCase() + selectedConversation.userRole.slice(1)}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[70%] ${
                            message.isAdmin
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
                    <form onSubmit={handleSendMessage} className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 focus:ring-primary-500 focus:border-primary-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You don't have any messages yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      <ul className="divide-y divide-gray-200">
                        {messages.map((conversation) => (
                          <li
                            key={conversation._id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/admin/messages/${conversation.userId}`)}
                          >
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                      <span className="text-primary-600 font-medium">
                                        {conversation.userName[0].toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="flex items-center">
                                      <h3 className="text-sm font-medium text-gray-900">
                                        {conversation.userName}
                                      </h3>
                                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {conversation.userRole}
                                      </span>
                                      {conversation.unreadCount > 0 && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                          {conversation.unreadCount} new
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {conversation.lastMessage}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatDate(conversation.lastMessageAt)}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <svg
                                    className="h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminMessagesPage; 