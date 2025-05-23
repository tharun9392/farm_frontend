import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaUserCircle, FaLock, FaBell, FaCreditCard } from 'react-icons/fa';

const SettingsPage = () => {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="sm:flex">
              {/* Sidebar / Tabs */}
              <div className="bg-gray-50 p-4 sm:p-6 sm:w-64 border-b sm:border-b-0 sm:border-r border-gray-200">
                <nav className="space-y-1">
                  <button
                    onClick={() => handleTabChange('profile')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'profile'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <FaUserCircle className={`mr-3 h-5 w-5 ${
                      activeTab === 'profile' ? 'text-primary-500' : 'text-gray-400'
                    }`} />
                    <span>Profile</span>
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('farm')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'farm'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${
                      activeTab === 'farm' ? 'text-primary-500' : 'text-gray-400'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Farm Details</span>
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('security')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'security'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <FaLock className={`mr-3 h-5 w-5 ${
                      activeTab === 'security' ? 'text-primary-500' : 'text-gray-400'
                    }`} />
                    <span>Security</span>
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('notifications')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'notifications'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <FaBell className={`mr-3 h-5 w-5 ${
                      activeTab === 'notifications' ? 'text-primary-500' : 'text-gray-400'
                    }`} />
                    <span>Notifications</span>
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('payment')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'payment'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <FaCreditCard className={`mr-3 h-5 w-5 ${
                      activeTab === 'payment' ? 'text-primary-500' : 'text-gray-400'
                    }`} />
                    <span>Payment Methods</span>
                  </button>
                </nav>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-4 sm:p-6">
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your personal information and contact details.
                    </p>
                    
                    <div className="mt-6 grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          defaultValue={user?.name?.split(' ')[0] || ''}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          defaultValue={user?.name?.split(' ').slice(1).join(' ') || ''}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          defaultValue={user?.email || ''}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          defaultValue={user?.phone || ''}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'farm' && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Farm Details</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Update information about your farm.
                    </p>
                    
                    <div className="mt-6 grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
                          Farm Name
                        </label>
                        <input
                          type="text"
                          name="farmName"
                          id="farmName"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700">
                          Farm Size (acres)
                        </label>
                        <input
                          type="number"
                          name="farmSize"
                          id="farmSize"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="col-span-6">
                        <label htmlFor="farmLocation" className="block text-sm font-medium text-gray-700">
                          Farm Location
                        </label>
                        <input
                          type="text"
                          name="farmLocation"
                          id="farmLocation"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Security</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your password and security settings.
                    </p>
                    
                    <div className="mt-6 grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-5 border-t border-gray-200 flex justify-end">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
