import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../features/users/usersSlice';
import { loginSuccess } from '../features/auth/authSlice';

const SettingsPage = () => {
  const auth = useSelector(state => state.auth);
  const { user, token, role } = auth;
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Account Settings Form
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    avatar: user?.avatar || ''
  });
  
  useEffect(() => {
    if (user) {
      setAccountForm({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);
  
  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    reservationReminders: true,
    systemUpdates: false
  });
  
  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: false,
    showProfile: true,
    shareUsageData: true
  });
  
  // Handle account form change
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountForm({
      ...accountForm,
      [name]: value
    });
  };
  
  // Handle account form submit
  const handleAccountSubmit = (e) => {
    e.preventDefault();
    
    // Dispatch update user action
    if (user) {
      const updatedUser = {
        id: user.id,
        ...accountForm
      };
      
      // Update in the users slice
      dispatch(updateUser(updatedUser));
      
      // Also update in the auth slice to persist changes
      dispatch(loginSuccess({
        user: updatedUser,
        token,
        role
      }));
      
      setSuccessMessage('Account settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };
  
  // Handle notification settings change
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };
  
  // Handle notification settings submit
  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    // Here you would save notification settings
    setSuccessMessage('Notification settings updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  // Handle privacy settings change
  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings({
      ...privacySettings,
      [name]: checked
    });
  };
  
  // Handle privacy settings submit
  const handlePrivacySubmit = (e) => {
    e.preventDefault();
    // Here you would save privacy settings
    setSuccessMessage('Privacy settings updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  if (!user) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-medium text-gray-900">User not found</h2>
          <p className="mt-2 text-gray-600">Please log in to access settings.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="md:w-1/4">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Settings</h2>
            </div>
            <nav className="p-4">
              <ul className="space-y-1">
                <li>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'profile' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'account' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('account')}
                  >
                    Account
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'notifications' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    Notifications
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'privacy' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('privacy')}
                  >
                    Privacy
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Settings Content */}
        <div className="md:w-3/4">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-50 border-b border-green-200">
                <p className="text-green-700">{successMessage}</p>
              </div>
            )}
            
            {/* Profile View */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Your Profile</h2>
                
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Profile Picture */}
                  <div className="w-full md:w-1/3 flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden mb-4">
                      <img 
                        src={user.avatar || 'https://via.placeholder.com/150'} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-medium text-center">{user.name}</h3>
                    <p className="text-sm text-gray-500 text-center">{user.roleDescription || user.role}</p>
                    <p className="text-sm text-gray-500 text-center">Member since: {user.joinDate || 'N/A'}</p>
                  </div>
                  
                  {/* Profile Details */}
                  <div className="w-full md:w-2/3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                        <p className="mt-1 text-md text-gray-900">{user.name}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Username</h3>
                        <p className="mt-1 text-md text-gray-900">{user.username}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1 text-md text-gray-900">{user.email || 'Not set'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Department</h3>
                        <p className="mt-1 text-md text-gray-900">{user.department || 'Not set'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                        <p className="mt-1 text-md text-gray-900">{user.phoneNumber || 'Not set'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Role</h3>
                        <p className="mt-1 text-md text-gray-900">{user.role === 'admin' ? 'Administrator' : 'Regular User'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setActiveTab('account')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
                <form onSubmit={handleAccountSubmit}>
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <div className="mr-4">
                        <img 
                          src={accountForm.avatar || 'https://via.placeholder.com/80'} 
                          alt="Profile" 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-md font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.role}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={accountForm.name}
                          onChange={handleAccountChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={accountForm.username}
                          onChange={handleAccountChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={accountForm.email}
                          onChange={handleAccountChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                          Avatar URL
                        </label>
                        <input
                          type="text"
                          id="avatar"
                          name="avatar"
                          value={accountForm.avatar}
                          onChange={handleAccountChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Account Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
                <form onSubmit={handleNotificationSubmit}>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-xs text-gray-500">Receive important updates via email</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          name="emailNotifications"
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Task Reminders</h3>
                        <p className="text-xs text-gray-500">Get notified about upcoming task deadlines</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="taskReminders"
                          name="taskReminders"
                          checked={notificationSettings.taskReminders}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Reservation Reminders</h3>
                        <p className="text-xs text-gray-500">Get notified about your upcoming room reservations</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="reservationReminders"
                          name="reservationReminders"
                          checked={notificationSettings.reservationReminders}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">System Updates</h3>
                        <p className="text-xs text-gray-500">Get notified about system updates and maintenance</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="systemUpdates"
                          name="systemUpdates"
                          checked={notificationSettings.systemUpdates}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Notification Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h2>
                <form onSubmit={handlePrivacySubmit}>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Show Email Address</h3>
                        <p className="text-xs text-gray-500">Allow other users to see your email address</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showEmail"
                          name="showEmail"
                          checked={privacySettings.showEmail}
                          onChange={handlePrivacyChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Show Profile</h3>
                        <p className="text-xs text-gray-500">Allow your profile to be visible to other users</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showProfile"
                          name="showProfile"
                          checked={privacySettings.showProfile}
                          onChange={handlePrivacyChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Usage Data</h3>
                        <p className="text-xs text-gray-500">Allow us to collect anonymous usage data to improve the service</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="shareUsageData"
                          name="shareUsageData"
                          checked={privacySettings.shareUsageData}
                          onChange={handlePrivacyChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Privacy Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 