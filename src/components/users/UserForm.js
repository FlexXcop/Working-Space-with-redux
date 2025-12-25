import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { addUser, updateUser, selectUserById } from '../../features/users/usersSlice';

const UserForm = ({ editMode = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const existingUser = useSelector(state => 
    editMode && userId ? selectUserById(state, parseInt(userId)) : null
  );
  
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'user',
    department: '',
    position: '',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  });
  
  // Load existing user data when in edit mode
  useEffect(() => {
    if (editMode && existingUser) {
      setFormData({
        username: existingUser.username,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        department: existingUser.department,
        position: existingUser.position,
        avatar: existingUser.avatar
      });
    }
  }, [editMode, existingUser]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editMode && existingUser) {
      dispatch(updateUser({
        id: parseInt(userId),
        ...formData
      }));
    } else {
      dispatch(addUser(formData));
    }
    
    navigate('/users');
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {editMode ? 'Edit User' : 'Create New User'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              id="department"
              name="department"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>
          
          {/* Position */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              type="text"
              id="position"
              name="position"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter position"
              value={formData.position}
              onChange={handleChange}
            />
          </div>
          
          {/* Avatar URL */}
          <div className="md:col-span-2">
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL
            </label>
            <input
              type="text"
              id="avatar"
              name="avatar"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter avatar URL"
              value={formData.avatar}
              onChange={handleChange}
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty to use default avatar</p>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => navigate('/users')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {editMode ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm; 