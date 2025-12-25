import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { markNotificationAsRead, clearNotifications } from '../../features/tasks/tasksSlice';

const Header = ({ sidebarOpen, setSidebarOpen, user, onLogout }) => {
  const dispatch = useDispatch();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  // get all notifications from the tasks 
  const allNotifications = useSelector(state => state.tasks.notifications);
  
  // filter notifications 
  const userNotifications = allNotifications.filter(
    notification => !notification.userId || notification.userId === user?.id
  );
  
  // count unread notifications
  const unreadCount = userNotifications.filter(notification => !notification.read).length;

  const handleProfileClick = (e) => {
    e.preventDefault();
    setUserMenuOpen(false);
    navigate(`/users/${user.id}`);
  };

  const handleSettingsClick = (e) => {
    e.preventDefault();
    setUserMenuOpen(false);
    navigate('/settings');
  };
  
  const handleNotificationClick = (notification) => {
    dispatch(markNotificationAsRead(notification.id));
    
    // Navigate based on notification type
    if (notification.type === 'task' && notification.relatedId) {
      navigate(`/tasks/${notification.relatedId}`);
    } else if (notification.type === 'reservation' && notification.relatedId) {
      navigate(`/rooms/reservations/${notification.relatedId}`);
    }
    
    setNotificationsOpen(false);
  };
  
  const handleClearAll = () => {
    userNotifications.forEach(notification => {
      dispatch(markNotificationAsRead(notification.id));
    });
  };
  
  // Format relative time
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'reservation':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsOpen && !event.target.closest('.notifications-container')) {
        setNotificationsOpen(false);
      }
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen, userMenuOpen]);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shadow-sm">
      {/* mobile menu button */}
      <button
        className="block p-2 text-gray-600 md:hidden focus:outline-none"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* logo - visible on mobile */}
      <div className="md:hidden font-bold text-xl text-gray-800">CoSpace</div>

      {/* Search Bar */}
      <div className="hidden md:flex items-center flex-1 mx-4">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right side icons */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative notifications-container">
          <button 
            className="p-1 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {userNotifications.length > 0 && (
                  <button 
                    onClick={handleClearAll} 
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              {userNotifications.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {userNotifications.slice(0, 10).map(notification => (
                    <div 
                      key={notification.id} 
                      className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex">
                        {getNotificationIcon(notification.type)}
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{getRelativeTime(notification.createdAt)}</p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {userNotifications.length > 10 && (
                    <div className="px-4 py-2 text-center">
                      <Link 
                        to="/all-notifications" 
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        View all {userNotifications.length} notifications
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="mt-2 text-sm">No notifications yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative user-menu-container">
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
            <svg className="hidden md:block w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <div className="px-4 py-2 text-xs text-gray-500">
                Signed in as <span className="font-medium">{user?.role}</span>
              </div>
              <hr className="my-1" />
              <a href="#" onClick={handleProfileClick} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
              <a href="#" onClick={handleSettingsClick} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
              <hr className="my-1" />
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 