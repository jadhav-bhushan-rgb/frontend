import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserInfoDisplay = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
        <span className="mr-2">👤</span>
        User Information
      </h3>
      
      {/* Personal Information Only */}
      <div className="space-y-2">
        <h4 className="text-md font-medium text-gray-700 border-b pb-2">Personal Details</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Name:</span>
            <span className="text-sm text-gray-800">
              {user.firstName} {user.lastName}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Email:</span>
            <span className="text-sm text-gray-800">{user.email}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Phone:</span>
            <span className="text-sm text-gray-800">{user.phoneNumber}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Department:</span>
            <span className="text-sm text-gray-800">{user.department}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoDisplay;


