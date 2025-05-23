import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import axios from 'axios';

const AnnouncementPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sendTo: 'all', // all, farmers, customers
    priority: 'normal' // low, normal, high
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // Replace with actual API call when endpoint is available
      const response = await axios.get('/api/announcements');
      setAnnouncements(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
      setLoading(false);
      // For development, use mock data
      setAnnouncements([
        {
          _id: '1',
          title: 'System Maintenance',
          content: 'The system will be under maintenance this Sunday from 2 AM to 4 AM.',
          sentBy: { name: 'Admin User' },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          recipients: { type: 'all', count: 120 },
          status: 'sent'
        },
        {
          _id: '2',
          title: 'New Feature Announcement',
          content: 'We have added a new payment system that allows faster processing of orders.',
          sentBy: { name: 'Admin User' },
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          recipients: { type: 'customers', count: 85 },
          status: 'sent'
        }
      ]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      // Replace with actual API call when endpoint is available
      await axios.post('/api/announcements', formData);
      
      toast.success('Announcement sent successfully');
      setFormData({
        title: '',
        content: '',
        sendTo: 'all',
        priority: 'normal'
      });
      setShowForm(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast.error('Failed to send announcement. Please try again.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
              <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage system-wide announcements
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {showForm ? 'Cancel' : 'New Announcement'}
            </button>
          </div>
          
          {showForm && (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Create New Announcement
                </h3>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="content"
                      id="content"
                      rows={4}
                      value={formData.content}
                      onChange={handleChange}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="sendTo" className="block text-sm font-medium text-gray-700">
                        Recipients
                      </label>
                      <select
                        id="sendTo"
                        name="sendTo"
                        value={formData.sendTo}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      >
                        <option value="all">All Users</option>
                        <option value="farmers">Farmers Only</option>
                        <option value="customers">Customers Only</option>
                        <option value="staff">Staff Only</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Send Announcement
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Announcements
              </h3>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new announcement.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    New Announcement
                  </button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {announcements.map((announcement) => (
                  <li key={announcement._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-primary-600">{announcement.title}</h4>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {announcement.recipients.type === 'all' ? 'All Users' : 
                             announcement.recipients.type === 'farmers' ? 'Farmers Only' : 
                             announcement.recipients.type === 'customers' ? 'Customers Only' : 'Staff Only'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{announcement.content}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          <span>Sent by {announcement.sentBy.name} • </span>
                          <span>{formatDate(announcement.createdAt)} • </span>
                          <span>Sent to {announcement.recipients.count} recipients</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="text-gray-400 hover:text-gray-500"
                          onClick={() => {
                            // Functionality to resend the announcement
                            toast.info('Resend functionality will be implemented soon');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
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

export default AnnouncementPage; 