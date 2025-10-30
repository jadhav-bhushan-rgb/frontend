import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff,
  FaUser,
  FaUserShield,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

const SubAdminManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    permissions: {
      canCreateQuotations: false,
      canManageUsers: false,
      canViewAllInquiries: false,
      canManageOrders: false
    }
  });

  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading } = useQuery(
    'admin-users',
    async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.users || [];
    }
  );

  // Create sub-admin mutation
  const createSubAdminMutation = useMutation(
    async (userData) => {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/subadmin', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('Sub-admin created successfully');
        setShowCreateModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create sub-admin');
      }
    }
  );

  // Update permissions mutation
  const updatePermissionsMutation = useMutation(
    async ({ userId, permissions }) => {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/admin/subadmin/${userId}/permissions`, 
        { permissions }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('Permissions updated successfully');
        setShowEditModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update permissions');
      }
    }
  );

  // Toggle user status mutation
  const toggleStatusMutation = useMutation(
    async ({ userId, isActive }) => {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/admin/subadmin/${userId}/status`, 
        { isActive }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('User status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user status');
      }
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    async (userId) => {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/admin/subadmin/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('User deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      permissions: {
        canCreateQuotations: false,
        canManageUsers: false,
        canViewAllInquiries: false,
        canManageOrders: false
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissions.')) {
      const permissionField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCreateSubAdmin = (e) => {
    e.preventDefault();
    createSubAdminMutation.mutate(formData);
  };

  const handleEditPermissions = (user) => {
    setSelectedUser(user);
    setFormData(prev => ({
      ...prev,
      permissions: user.permissions || {
        canCreateQuotations: false,
        canManageUsers: false,
        canViewAllInquiries: false,
        canManageOrders: false
      }
    }));
    setShowEditModal(true);
  };

  const handleUpdatePermissions = (e) => {
    e.preventDefault();
    updatePermissionsMutation.mutate({
      userId: selectedUser._id,
      permissions: formData.permissions
    });
  };

  const handleToggleStatus = (user) => {
    toggleStatusMutation.mutate({
      userId: user._id,
      isActive: !user.isActive
    });
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      deleteUserMutation.mutate(user._id);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaUserShield className="text-red-500" />;
      case 'subadmin':
        return <FaUser className="text-blue-500" />;
      case 'backoffice':
        return <FaUser className="text-green-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaCheck className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaTimes className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  const subAdmins = users.filter(user => user.role === 'subadmin');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sub-Admin Management</h2>
          <p className="text-gray-600">Manage sub-admin users and their permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Create Sub-Admin
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sub-Admin Users</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subAdmins.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Sub-Admin
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {user.permissions?.canCreateQuotations && (
                          <div className="text-green-600">✓ Create Quotations</div>
                        )}
                        {user.permissions?.canManageUsers && (
                          <div className="text-green-600">✓ Manage Users</div>
                        )}
                        {user.permissions?.canViewAllInquiries && (
                          <div className="text-green-600">✓ View All Inquiries</div>
                        )}
                        {user.permissions?.canManageOrders && (
                          <div className="text-green-600">✓ Manage Orders</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditPermissions(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={user.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                        >
                          {user.isActive ? <FaToggleOff className="w-4 h-4" /> : <FaToggleOn className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Sub-Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border w-11/12 max-w-4xl shadow-lg rounded-lg bg-white">
            <div className="bg-white rounded-lg">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Create Sub-Admin</h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">Fill in the details to create a new sub-admin user</p>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateSubAdmin} className="px-6 py-6">
                <div className="space-y-6">
                  {/* Personal Information Section */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter last name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter password"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Password must be at least 8 characters with uppercase, lowercase, number and special character
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Permissions Section */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Permissions</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-4">Select the permissions you want to grant to this sub-admin:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="permissions.canCreateQuotations"
                            checked={formData.permissions.canCreateQuotations}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Create Quotations</div>
                            <div className="text-xs text-gray-500">Allow creating and managing quotations</div>
                          </div>
                        </label>
                        <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="permissions.canManageUsers"
                            checked={formData.permissions.canManageUsers}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Manage Users</div>
                            <div className="text-xs text-gray-500">Allow managing other users</div>
                          </div>
                        </label>
                        <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="permissions.canViewAllInquiries"
                            checked={formData.permissions.canViewAllInquiries}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">View All Inquiries</div>
                            <div className="text-xs text-gray-500">Allow viewing all inquiries</div>
                          </div>
                        </label>
                        <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="permissions.canManageOrders"
                            checked={formData.permissions.canManageOrders}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Manage Orders</div>
                            <div className="text-xs text-gray-500">Allow managing orders</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSubAdminMutation.isLoading}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {createSubAdminMutation.isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      'Create Sub-Admin'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-0 border w-11/12 max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="bg-white rounded-lg">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Edit Permissions
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Update permissions for {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleUpdatePermissions} className="px-6 py-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">User Permissions</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-4">Select the permissions you want to grant to this sub-admin:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          name="permissions.canCreateQuotations"
                          checked={formData.permissions.canCreateQuotations}
                          onChange={handleInputChange}
                          className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Create Quotations</div>
                          <div className="text-xs text-gray-500">Allow creating and managing quotations</div>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          name="permissions.canManageUsers"
                          checked={formData.permissions.canManageUsers}
                          onChange={handleInputChange}
                          className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Manage Users</div>
                          <div className="text-xs text-gray-500">Allow managing other users</div>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          name="permissions.canViewAllInquiries"
                          checked={formData.permissions.canViewAllInquiries}
                          onChange={handleInputChange}
                          className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">View All Inquiries</div>
                          <div className="text-xs text-gray-500">Allow viewing all inquiries</div>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          name="permissions.canManageOrders"
                          checked={formData.permissions.canManageOrders}
                          onChange={handleInputChange}
                          className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Manage Orders</div>
                          <div className="text-xs text-gray-500">Allow managing orders</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatePermissionsMutation.isLoading}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatePermissionsMutation.isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      'Update Permissions'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminManagement;
