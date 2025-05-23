import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import messageService from '../../services/messageService';

const ConversationPanel = ({ receiverId, onBack }) => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);
  
  // Load conversation on mount and when receiverId changes
  useEffect(() => {
    if (receiverId) {
      fetchConversation();
    }
  }, [receiverId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async (nextPage = 1) => {
    if (!receiverId) return;
    
    try {
      setLoading(true);
      const response = await messageService.getConversation(receiverId, { page: nextPage });
      
      if (nextPage === 1) {
        setMessages(response.messages || []);
      } else {
        setMessages(prev => [...response.messages, ...prev]);
      }
      
      setHasMore(response.totalPages > nextPage);
      setPage(nextPage);
      
      // Set receiver info from the first message if available
      if (response.messages && response.messages.length > 0) {
        const otherUser = response.messages[0].sender._id === user._id 
          ? response.messages[0].receiver 
          : response.messages[0].sender;
        setReceiver(otherUser);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load messages. Please try again.');
      setLoading(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loading) {
      fetchConversation(page + 1);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    
    // Load more messages when user scrolls to the top
    if (scrollTop === 0 && hasMore && !loading) {
      loadMoreMessages();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      const messageData = {
        receiverId,
        content: newMessage.trim()
      };
      
      const response = await messageService.sendMessage(messageData);
      
      // Add the new message to the conversation
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      setSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatMessageDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6 flex items-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center p-1 mr-2 border border-transparent rounded-full shadow-sm text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        {receiver ? (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {receiver.avatar ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={receiver.avatar}
                  alt={receiver.name}
                />
              ) : (
                <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">{receiver.name}</h3>
              <p className="text-xs text-gray-500">{receiver.role === 'admin' ? 'Administrator' : 'Staff'}</p>
            </div>
          </div>
        ) : (
          <h3 className="text-sm font-medium text-gray-900">Loading...</h3>
        )}
      </div>
      
      {/* Message List */}
      <div 
        className="flex-1 p-4 overflow-y-auto"
        ref={messageListRef}
        onScroll={handleScroll}
      >
        {loading && page === 1 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start the conversation by sending a message.
            </p>
          </div>
        ) : (
          <>
            {loading && page > 1 && (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            )}
            
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="mb-6">
                <div className="relative flex items-center py-3">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-3 text-xs text-gray-500">{date}</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                
                {dateMessages.map((message, index) => {
                  const isCurrentUser = message.sender._id === user._id;
                  
                  return (
                    <div 
                      key={message._id} 
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      {!isCurrentUser && (
                        <div className="flex-shrink-0 mr-2">
                          {message.sender.avatar ? (
                            <img 
                              className="h-8 w-8 rounded-full" 
                              src={message.sender.avatar} 
                              alt={message.sender.name} 
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div 
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                          isCurrentUser 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}>
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message Input */}
      <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="form-input block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              !newMessage.trim() || sending
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            }`}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationPanel;