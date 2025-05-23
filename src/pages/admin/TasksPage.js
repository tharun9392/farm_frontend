import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import TaskList from '../../components/admin/TaskList';
import MetricsCard from '../../components/admin/MetricsCard';
import taskService from '../../services/taskService';

const TasksPage = () => {
  const [metrics, setMetrics] = useState({
    statusCounts: {},
    priorityCounts: {},
    categoryCounts: {},
    overdueTasks: 0,
    dueTodayTasks: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMetrics();
  }, []);
  
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskMetrics();
      setMetrics(response.data || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching task metrics:', error);
      setLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Staff Task Management</h1>
            <Link
              to="/admin/tasks/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Task
            </Link>
          </div>
          
          <p className="mt-2 text-sm text-gray-700">
            Assign tasks to staff members and monitor their progress
          </p>
          
          {/* Task Metrics */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Pending Tasks */}
            <MetricsCard
              title="Pending Tasks"
              value={loading ? '...' : metrics.statusCounts?.pending || 0}
              icon={{
                bgColor: 'bg-yellow-100',
                color: 'text-yellow-600',
                svg: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }}
            />
            
            {/* In Progress Tasks */}
            <MetricsCard
              title="In Progress"
              value={loading ? '...' : metrics.statusCounts?.['in-progress'] || 0}
              icon={{
                bgColor: 'bg-blue-100',
                color: 'text-blue-600',
                svg: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )
              }}
            />
            
            {/* Completed Tasks */}
            <MetricsCard
              title="Completed"
              value={loading ? '...' : metrics.statusCounts?.completed || 0}
              icon={{
                bgColor: 'bg-green-100',
                color: 'text-green-600',
                svg: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }}
            />
            
            {/* Overdue Tasks */}
            <MetricsCard
              title="Overdue"
              value={loading ? '...' : metrics.overdueTasks || 0}
              icon={{
                bgColor: 'bg-red-100',
                color: 'text-red-600',
                svg: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )
              }}
              subtext={`${loading ? '...' : metrics.dueTodayTasks || 0} due today`}
            />
          </div>
          
          {/* Task List */}
          <div className="mt-6">
            <TaskList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TasksPage; 