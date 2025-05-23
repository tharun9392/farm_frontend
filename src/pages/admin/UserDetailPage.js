import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import userService from '../../services/userService';
import Loader from '../../components/common/Loader';

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserById(userId);
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details. Please try again.');
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await userService.updateUserStatus(userId, newStatus);
      toast.success(`User status updated to ${newStatus}`);
      fetchUserDetails(); // Refresh the data
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status. Please try again.');
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'farmer':
        return 'bg-green-100 text-green-800';
      case 'customer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">User Details</h1>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/admin/users')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to Users
              </button>
              <Link
                to={`/admin/users/${userId}/edit`}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Edit User
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="my-8 flex justify-center">
              <Loader size="large" />
            </div>
          ) : !user ? (
            <div className="bg-white shadow rounded-lg p-6 my-6">
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The user you're looking for doesn't exist or you don't have permission to view it.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* User Profile Card */}
              <div className="bg-white shadow rounded-lg overflow-hidden my-6">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      User Profile
                    </h3>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(user.status)}`}>
                      {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                    </span>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Personal details and account information
                  </p>
                </div>
                
                <div className="border-b border-gray-200 bg-white px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-24 w-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="h-24 w-24 rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.classList.add('avatar-fallback');
                          }}
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-6">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {user.name || 'Unnamed User'}
                      </h1>
                      <p className="text-sm text-gray-500">
                        {user.email || 'No email provided'}
                      </p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                          {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Phone
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.phone || 'Not provided'}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Registered On
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Account Status
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Is Active
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.isActive ? 'Yes' : 'No'}
                        </dd>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-1">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.address ? (
                            <div>
                              <p>{user.address.street || 'No street'}</p>
                              <p>{user.address.city || 'No city'}, {user.address.state || 'No state'} {user.address.postalCode || 'No postal code'}</p>
                              <p>{user.address.country || 'No country'}</p>
                            </div>
                          ) : (
                            'No address provided'
                          )}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    {user.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange('blocked')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Block User
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange('active')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Activate User
                      </button>
                    )}
                    <Link
                      to={`/admin/users/${userId}/edit`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Edit User
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Additional user-specific sections based on role */}
              {user.role === 'farmer' && (
                <div className="bg-white shadow rounded-lg overflow-hidden my-6">
                  <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Farm Details
                    </h3>
                  </div>
                  <div className="border-b border-gray-200 bg-white px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Farm Name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.farmDetails?.farmName || 'Not provided'}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Farm Location
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.farmDetails?.farmLocation || 'Not provided'}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Farm Size (acres)
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.farmDetails?.farmSize || 'Not provided'}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Farming Experience (years)
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.farmDetails?.farmingExperience || 'Not provided'}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetailPage; 