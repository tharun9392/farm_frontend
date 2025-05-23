import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import taskService from '../../services/taskService';
import api from '../../services/api';

const NewTaskPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    category: 'inventory',
    status: 'pending'
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch staff members on component mount
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        setLoading(true);
        console.log('Fetching staff members...');
        
        // Try to get all users first as a fallback approach
        const allUsersResponse = await api.get('/users');
        console.log('All users response:', allUsersResponse.data);
        
        // Get admin users
        const adminResponse = await api.get('/users', { 
          params: { role: 'admin' } 
        });
        console.log('Admin users response:', adminResponse.data);
        
        // Get staff users
        const staffResponse = await api.get('/users', { 
          params: { role: 'staff' } 
        });
        console.log('Staff users response:', staffResponse.data);
        
        // Combine the results
        let allStaff = [
          ...(adminResponse.data.data || []),
          ...(staffResponse.data.data || [])
        ];
        
        // If specific role filtering didn't work, try to extract from all users
        if (allStaff.length === 0 && allUsersResponse.data) {
          const allUsers = allUsersResponse.data.data || [];
          allStaff = allUsers.filter(user => 
            user.role === 'admin' || user.role === 'staff'
          );
          console.log('Extracted staff from all users:', allStaff.length);
        }
        
        console.log('Final staff members:', allStaff);
        
        // If no staff members were found, add current user as fallback
        if (allStaff.length === 0) {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (currentUser && currentUser._id) {
            allStaff.push(currentUser);
            console.log('Added current user as fallback:', currentUser.name || currentUser.username);
          }
        }
        
        setStaffMembers(allStaff);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching staff members:', error);
        toast.error('Failed to load staff members. Please try again.');
        
        // Add fallback admin user in case of error
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser && currentUser._id) {
          setStaffMembers([currentUser]);
          console.log('Added current user as fallback after error:', currentUser.name || currentUser.username);
        } else {
          // Emergency fallback option
          setStaffMembers([
            { _id: 'admin', name: 'Admin User', role: 'admin' }
          ]);
          console.log('Added emergency fallback admin user');
        }
        
        setLoading(false);
      }
    };

    fetchStaffMembers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Task title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Task description is required';
    }
    
    if (!formData.assignedTo) {
      errors.assignedTo = 'Please select a staff member';
    }
    
    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
    } else {
      const dueDate = new Date(formData.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.dueDate = 'Please enter a valid date';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await taskService.createTask(formData);
      
      toast.success('Task created successfully!');
      navigate('/admin/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Task</h1>
          <p className="mt-2 text-sm text-gray-700">
            Assign a new task to a staff member
          </p>
          
          <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  {/* Task Title */}
                  <div className="sm:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                        validationErrors.title 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      }`}
                    />
                    {validationErrors.title && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.title}</p>
                    )}
                  </div>
                  
                  {/* Task Description */}
                  <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      required
                      value={formData.description}
                      onChange={handleChange}
                      className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                        validationErrors.description 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      }`}
                    />
                    {validationErrors.description && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>
                    )}
                  </div>
                  
                  {/* Assigned To */}
                  <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                      Assign To *
                    </label>
                    <select
                      id="assignedTo"
                      name="assignedTo"
                      required
                      value={formData.assignedTo}
                      onChange={handleChange}
                      className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                        validationErrors.assignedTo 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      }`}
                    >
                      <option value="">-- Select Staff Member ({staffMembers.length} available) --</option>
                      {staffMembers.map(staff => (
                        <option key={staff._id || staff.id} value={staff._id || staff.id}>
                          {staff.name || staff.username || 'Unknown'} ({staff.role || 'staff'})
                        </option>
                      ))}
                      {staffMembers.length === 0 && (
                        <option value="" disabled>No staff members available</option>
                      )}
                    </select>
                    {validationErrors.assignedTo && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.assignedTo}</p>
                    )}
                  </div>
                  
                  {/* Due Date */}
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      id="dueDate"
                      required
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                        validationErrors.dueDate 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      }`}
                    />
                    {validationErrors.dueDate && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.dueDate}</p>
                    )}
                  </div>
                  
                  {/* Priority */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="inventory">Inventory</option>
                      <option value="farmer">Farmer</option>
                      <option value="customer">Customer</option>
                      <option value="order">Order</option>
                      <option value="system">System</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/tasks')}
                    className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : 'Create Task'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewTaskPage; 