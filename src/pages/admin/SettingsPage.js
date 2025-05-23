import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';

const SettingsPage = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Farmer Rice',
    siteDescription: 'Connect farmers directly with consumers',
    contactEmail: 'support@farmerrice.com',
    contactPhone: '+1 (123) 456-7890',
    enableNotifications: true,
    enableEmails: true
  });

  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // This would normally save to your API
      // await settingsService.updateGeneralSettings(generalSettings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success('Settings saved successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Settings</h1>
          
          <div className="mt-6 grid grid-cols-1 gap-6">
            {/* General Settings Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Site Name */}
                  <div>
                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                      Site Name
                    </label>
                    <input
                      type="text"
                      name="siteName"
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* Site Description */}
                  <div>
                    <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                      Site Description
                    </label>
                    <input
                      type="text"
                      name="siteDescription"
                      id="siteDescription"
                      value={generalSettings.siteDescription}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* Contact Email */}
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      id="contactEmail"
                      value={generalSettings.contactEmail}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* Contact Phone */}
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      name="contactPhone"
                      id="contactPhone"
                      value={generalSettings.contactPhone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* Enable Notifications */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="enableNotifications"
                        name="enableNotifications"
                        type="checkbox"
                        checked={generalSettings.enableNotifications}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-700">
                        Enable Notifications
                      </label>
                    </div>
                  </div>
                  
                  {/* Enable Email Notifications */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="enableEmails"
                        name="enableEmails"
                        type="checkbox"
                        checked={generalSettings.enableEmails}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="enableEmails" className="ml-2 block text-sm text-gray-700">
                        Enable Email Notifications
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="mr-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage; 