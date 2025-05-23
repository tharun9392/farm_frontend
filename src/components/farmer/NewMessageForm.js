import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import messageService from '../../services/messageService';

const NewMessageForm = ({ onMessageSent, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [message, setMessage] = useState('');

  // Fetch admin users for the recipient selection
  useEffect(() => {
    // Mock data - in a real app, we'd fetch admin users from the API
    setAdmins([
      { _id: 'admin1', name: 'Admin User', role: 'admin' },
      { _id: 'admin2', name: 'Support Admin', role: 'admin' }
    ]);
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAdmin || !message.trim()) {
      toast.error('Please select a recipient and enter a message');
      return;
    }
    
    try {
      setSending(true);
      const messageData = {
        receiverId: selectedAdmin,
        content: message.trim()
      };
      
      await messageService.sendMessage(messageData);
      toast.success('Message sent successfully');
      
      // Callback to parent component
      if (onMessageSent) {
        onMessageSent(selectedAdmin);
      }
      
      setSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">New Message</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start a conversation with an administrator
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                Recipient
              </label>
              <select
                id="recipient"
                name="recipient"
                value={selectedAdmin}
                onChange={(e) => setSelectedAdmin(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select an administrator</option>
                {admins.map((admin) => (
                  <option key={admin._id} value={admin._id}>
                    {admin.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || !selectedAdmin || !message.trim()}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  sending || !selectedAdmin || !message.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                Send Message
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default NewMessageForm; 