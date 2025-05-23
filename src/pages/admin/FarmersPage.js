import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import FarmerList from '../../components/admin/FarmerList';
import FarmerPendingProducts from '../../components/admin/FarmerPendingProducts';

const FarmersPage = ({ pendingOnly = false }) => {
  const pendingProductsRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [creatingTest, setCreatingTest] = useState(false);
  
  // Check if we're returning from the inventory purchase page
  useEffect(() => {
    // If we have state with refreshPendingProducts=true, refresh the products list
    if (location.state?.refreshPendingProducts) {
      console.log('Refreshing pending products after returning from purchase page');
      pendingProductsRef.current?.refresh();
    }
  }, [location]);

  const handleCreateTestPaddy = async () => {
    try {
      setCreatingTest(true);
      const response = await fetch('/api/products/test/create-paddy', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create test paddy');
      }
      
      const data = await response.json();
      console.log('Created test paddy:', data);
      
      toast.success('Test paddy created successfully');
      
      // Refresh the pending products list
      pendingProductsRef.current?.refresh();
    } catch (error) {
      console.error('Error creating test paddy:', error);
      toast.error('Failed to create test paddy');
    } finally {
      setCreatingTest(false);
    }
  };

  const handleViewPendingProducts = () => {
    navigate('/admin/pending-products');
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {pendingOnly ? "Pending Farmer Approvals" : "Farmer Management"}
              </h1>
              
              <p className="mt-2 text-sm text-gray-700">
                {pendingOnly 
                  ? "Review and approve pending farmer registration requests."
                  : "Approve and manage farmers on the platform. Review applications and monitor farmer activity."}
              </p>
            </div>
            
            {pendingOnly && (
              <div className="flex space-x-2">
                <button
                  onClick={handleViewPendingProducts}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View All Pending Products
                </button>
                <button
                  onClick={handleCreateTestPaddy}
                  disabled={creatingTest}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {creatingTest ? 'Creating...' : 'Create Test Paddy'}
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            {pendingOnly ? (
              <>
                {/* Display farmer registration approval section */}
                <div className="mb-10">
                  <FarmerList pendingOnly={pendingOnly} />
                </div>
                
                {/* Display pending product approval section */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Pending Product Approvals
                  </h2>
                  <FarmerPendingProducts ref={pendingProductsRef} />
                </div>
              </>
            ) : (
              <FarmerList pendingOnly={pendingOnly} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FarmersPage; 