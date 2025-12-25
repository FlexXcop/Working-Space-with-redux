import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Dashboard Search Component
const DashboardSearch = ({ role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const rooms = useSelector(state => state.rooms.rooms);
  const tasks = useSelector(state => state.tasks.tasks);
  const users = useSelector(state => state.users.users);
  const isAdmin = role === 'admin';

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const filteredRooms = rooms.filter(room =>
      room.name.toLowerCase().includes(term.toLowerCase()) ||
      room.description.toLowerCase().includes(term.toLowerCase())
    ).map(room => ({ type: 'room', id: room.id, title: room.name, description: `${room.type} • Floor ${room.floor}` }));

    const filteredTasks = tasks.filter(task =>
      task.title.toLowerCase().includes(term.toLowerCase()) ||
      task.description.toLowerCase().includes(term.toLowerCase())
    ).map(task => ({ type: 'task', id: task.id, title: task.title, description: `${task.status} • ${task.priority} priority` }));

    let filteredUsers = [];
    if (isAdmin) {
      filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(term.toLowerCase()) ||
        user.username.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase())
      ).map(user => ({ type: 'user', id: user.id, title: user.name, description: `${user.role} • ${user.department}` }));
    }

    const results = [...filteredRooms, ...filteredTasks, ...filteredUsers].slice(0, 10);
    setSearchResults(results);
    setShowResults(results.length > 0);
  };

  const handleResultClick = (result) => {
    setShowResults(false);

    switch (result.type) {
      case 'room':
        navigate(`/rooms/${result.id}`);
        break;
      case 'task':
        navigate(`/tasks/${result.id}`);
        break;
      case 'user':
        navigate(`/users/${result.id}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search for rooms, tasks, or users..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
      </div>

      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {searchResults.length > 0 ? (
            <ul className="py-1 max-h-64 overflow-y-auto">
              {searchResults.map((result, index) => (
                <li
                  key={`${result.type}-${result.id}`}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-center">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                      result.type === 'room' ? 'bg-purple-100 text-purple-600' :
                        result.type === 'task' ? 'bg-blue-100 text-blue-600' :
                          'bg-green-100 text-green-600'
                      }`}>
                      {result.type === 'room' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                      {result.type === 'task' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                      {result.type === 'user' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{result.title}</p>
                      <p className="text-xs text-gray-500">{result.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No results found. Try a different search term.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Dashboard Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color} text-white mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

// Recent Activity Item Component
const ActivityItem = ({ type, title, time, status, icon }) => (
  <div className="flex items-center p-3 border-b border-gray-100 last:border-0">
    <div className="mr-4">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
    <div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        status === 'completed' ? 'bg-green-100 text-green-800' :
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
        }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, role } = useSelector(state => state.auth);
  const isAdmin = role === 'admin';

  // Ambil notifikasi untuk user yang sedang login
  const notifications = useSelector(state =>
    state.tasks.notifications
      ? state.tasks.notifications.filter(n => n.userId === user?.id && !n.read)
      : []
  );

  // Sample stats data
  const stats = [
    {
      title: "Total Tasks",
      value: "12",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: "bg-blue-500"
    },
    {
      title: "Room Bookings",
      value: "8",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-purple-500"
    },
    {
      title: "Available Rooms",
      value: "5",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "bg-green-500"
    },
    {
      title: isAdmin ? "Total Users" : "Completed Tasks",
      value: isAdmin ? "24" : "5",
      icon: isAdmin ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-orange-500"
    }
  ];

  // Sample activity data
  const activities = [
    {
      type: 'task',
      title: 'Project proposal submitted',
      time: '2 hours ago',
      status: 'completed',
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      type: 'reservation',
      title: 'Meeting room "Orion" booked',
      time: '5 hours ago',
      status: 'confirmed',
      icon: (
        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      type: 'task',
      title: 'Design review pending',
      time: '1 day ago',
      status: 'pending',
      icon: (
        <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      type: 'reservation',
      title: 'Conference room cancelled',
      time: '2 days ago',
      status: 'cancelled',
      icon: (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-600">Here's what's happening with your workspace today</p>
      </div>

      {/* Notifikasi reservasi */}
      {notifications.length > 0 && (
        <div className="mb-4">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-3 mb-2 rounded text-white ${n.message.includes('approved') ? 'bg-green-500' : 'bg-red-500'}`}
            >
              <strong>Notifikasi:</strong> {n.message}
            </div>
          ))}
        </div>
      )}

      {/* Search Component */}
      <DashboardSearch role={role} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="/tasks/new" className="flex flex-col items-center bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors">
              <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">New Task</span>
            </a>
            <a href="/rooms" className="flex flex-col items-center bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors">
              <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Book Room</span>
            </a>
            {isAdmin && (
              <>
                <a href="/users" className="flex flex-col items-center bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors">
                  <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Add User</span>
                </a>
                <a href="/rooms/new" className="flex flex-col items-center bg-red-50 hover:bg-red-100 p-4 rounded-lg transition-colors">
                  <svg className="w-8 h-8 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Add Room</span>
                </a>
              </>
            )}
            {!isAdmin && (
              <>
                <a href="/tasks" className="flex flex-col items-center bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors">
                  <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">My Tasks</span>
                </a>
                <a href="/reports" className="flex flex-col items-center bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg transition-colors">
                  <svg className="w-8 h-8 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">My Reports</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="divide-y divide-gray-100">
            {activities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
          <div className="mt-4 pt-2 border-t border-gray-100">
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all activity
            </a>
          </div>
        </div>
      </div>

      {/* Admin Guide for Reservation Approval */}
      {isAdmin && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Room Reservation Management</h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-900">How to approve room reservations:</h3>
              <ol className="mt-2 ml-5 list-decimal text-sm text-gray-600 space-y-2">
                <li>Go to <a href="/rooms/reservations" className="text-blue-600 hover:underline">Reservations</a> page to see all pending requests</li>
                <li>Review reservation details including date, time, and purpose</li>
                <li>Click the "Approve" button to confirm a reservation</li>
                <li>Click the "Reject" button to decline a reservation</li>
                <li>Users will receive notifications about their reservation status</li>
              </ol>
            </div>
            <div className="flex">
              <a
                href="/rooms/reservations"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Reservations
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;