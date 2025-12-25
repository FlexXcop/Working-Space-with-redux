import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserById } from '../../features/users/usersSlice';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const parsedUserId = parseInt(userId);
  const user = useSelector(state => selectUserById(state, parsedUserId));
  
  if (!user) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-medium text-gray-900">User not found</h2>
          <p className="mt-2 text-gray-600">The user you're looking for doesn't exist or has been removed.</p>
          <button
            className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => navigate('/users')}
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }
  
  // Format date to human readable
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-4xl mx-auto">
      <div className="md:flex">
        {/* User Avatar and Basic Info */}
        <div className="md:w-1/3 p-6 bg-gray-50 border-r border-gray-200">
          <div className="flex flex-col items-center">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-32 h-32 rounded-full object-cover mb-4"
            />
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500">{user.position}</p>
            
            <div className="mt-4 w-full">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-500">Username</span>
                <span className="text-sm text-gray-900">{user.username}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <span className="text-sm text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-500">Department</span>
                <span className="text-sm text-gray-900">{user.department}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-500">Role</span>
                <span className={`text-sm rounded-full px-2 py-1 ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <span className={`text-sm rounded-full px-2 py-1 ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium text-gray-500">Joined</span>
                <span className="text-sm text-gray-900">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Details */}
        <div className="md:w-2/3 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">User Details</h2>
          
          {/* Placeholder for user activity or additional info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">Account Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-gray-500 text-sm">Assigned Tasks</span>
                <span className="text-xl font-bold text-blue-600">5</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-gray-500 text-sm">Room Bookings</span>
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-gray-500 text-sm">Completed Tasks</span>
                <span className="text-xl font-bold text-green-600">12</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-gray-500 text-sm">Last Activity</span>
                <span className="text-sm font-medium text-gray-600">Today</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Link
              to={`/users/edit/${userId}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit User
            </Link>
            <button
              className={`px-4 py-2 rounded-md ${
                user.isActive 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              {user.isActive ? 'Deactivate Account' : 'Activate Account'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 pb-6 pt-2 border-t border-gray-200">
        <button
          onClick={() => navigate('/users')}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Users
        </button>
      </div>
    </div>
  );
};

export default UserDetail; 