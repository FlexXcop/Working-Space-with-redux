import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectDailyStats, 
  selectRoomUsage, 
  selectTaskDistribution, 
  selectUserActivity,
  selectDateRange,
  selectReportsLoading,
  setDateRange,
  fetchReportData
} from '../features/reports/reportsSlice';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportsPage = () => {
  const dailyStats = useSelector(selectDailyStats);
  const roomUsage = useSelector(selectRoomUsage);
  const taskDistribution = useSelector(selectTaskDistribution);
  const userActivity = useSelector(selectUserActivity);
  const dateRange = useSelector(selectDateRange);
  const loading = useSelector(selectReportsLoading);
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    dispatch(setDateRange({
      ...dateRange,
      [name]: value
    }));
  };
  
  // Handle refresh data
  const handleRefresh = () => {
    dispatch(fetchReportData());
  };

  // Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Co-Working Space Report', 14, 22);
    
    // Add date range
    doc.setFontSize(12);
    doc.text(`Date Range: ${dateRange.start} to ${dateRange.end}`, 14, 30);
    
    // Add room usage table
    doc.setFontSize(16);
    doc.text('Room Usage Statistics', 14, 45);
    
    const roomUsageData = roomUsage.map(item => [
      item.type,
      item.bookings.toString(),
      item.hours.toString(),
      `${item.utilization}%`
    ]);
    
    doc.autoTable({
      startY: 50,
      head: [['Room Type', 'Bookings', 'Hours Used', 'Utilization']],
      body: roomUsageData,
    });
    
    // Add task distribution table
    const taskY = doc.previousAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Task Distribution', 14, taskY);
    
    const taskData = taskDistribution.map(item => [
      item.status,
      item.count.toString()
    ]);
    
    doc.autoTable({
      startY: taskY + 5,
      head: [['Status', 'Count']],
      body: taskData,
    });
    
    // Add user activity table if there's space, otherwise add new page
    let userY = doc.previousAutoTable.finalY + 15;
    
    if (userY > 250) {
      doc.addPage();
      userY = 20;
    }
    
    doc.setFontSize(16);
    doc.text('User Activity', 14, userY);
    
    const userData = userActivity.map(item => [
      item.user.name,
      item.tasksCreated.toString(),
      item.tasksCompleted.toString(),
      item.roomBookings.toString()
    ]);
    
    doc.autoTable({
      startY: userY + 5,
      head: [['User', 'Tasks Created', 'Tasks Completed', 'Room Bookings']],
      body: userData,
    });
    
    // Save the PDF
    doc.save(`cospace-report-${dateRange.start}-to-${dateRange.end}.pdf`);
  };

  // Format CSV data for daily stats
  const dailyStatsCsvData = [
    ['Date', 'Room Usage (%)', 'Task Completion (%)', 'Active Users', 'New Tasks', 'Room Bookings'],
    ...dailyStats.map(stat => [
      stat.date,
      stat.roomUsage,
      stat.taskCompletion,
      stat.activeUsers,
      stat.newTasks,
      stat.roomBookings
    ])
  ];

  // Format CSV data for room usage
  const roomUsageCsvData = [
    ['Room Type', 'Bookings', 'Hours Used', 'Utilization (%)'],
    ...roomUsage.map(room => [
      room.type,
      room.bookings,
      room.hours,
      room.utilization
    ])
  ];

  // Format CSV data for task distribution
  const taskDistributionCsvData = [
    ['Status', 'Count'],
    ...taskDistribution.map(task => [
      task.status,
      task.count
    ])
  ];

  // Format CSV data for user activity
  const userActivityCsvData = [
    ['User', 'Tasks Created', 'Tasks Completed', 'Room Bookings', 'Last Active'],
    ...userActivity.map(activity => [
      activity.user.name,
      activity.tasksCreated,
      activity.tasksCompleted,
      activity.roomBookings,
      new Date(activity.lastActive).toLocaleString()
    ])
  ];

  // Tab content for overview
  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Room Usage Summary */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Room Usage Summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Type
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roomUsage.map((room, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{room.type}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{room.bookings}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{room.hours}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{room.utilization}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-right">
          <CSVLink 
            data={roomUsageCsvData} 
            filename={`room-usage-${dateRange.start}-to-${dateRange.end}.csv`}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Export to CSV
          </CSVLink>
        </div>
      </div>

      {/* Task Distribution */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Task Distribution</h2>
        <div className="flex items-center justify-center h-48">
          <div className="flex items-end space-x-8">
            {taskDistribution.map((task, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-sm font-medium text-gray-600 mb-2">{task.count}</div>
                <div 
                  className={`w-16 ${
                    task.status === 'To Do' ? 'bg-blue-400' :
                    task.status === 'In Progress' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ height: `${task.count * 2}px` }}
                ></div>
                <div className="text-xs font-medium text-gray-500 mt-2">{task.status}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 text-right">
          <CSVLink 
            data={taskDistributionCsvData} 
            filename={`task-distribution-${dateRange.start}-to-${dateRange.end}.csv`}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Export to CSV
          </CSVLink>
        </div>
      </div>

      {/* Export All Button */}
      <div className="md:col-span-2 flex justify-end space-x-3">
        <button
          onClick={exportToPDF}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Export All to PDF
        </button>
        <CSVLink
          data={[
            ['Co-Working Space Report'],
            [`Date Range: ${dateRange.start} to ${dateRange.end}`],
            [''],
            ['ROOM USAGE'],
            ['Room Type', 'Bookings', 'Hours Used', 'Utilization (%)'],
            ...roomUsage.map(room => [room.type, room.bookings, room.hours, room.utilization]),
            [''],
            ['TASK DISTRIBUTION'],
            ['Status', 'Count'],
            ...taskDistribution.map(task => [task.status, task.count]),
            [''],
            ['USER ACTIVITY'],
            ['User', 'Tasks Created', 'Tasks Completed', 'Room Bookings', 'Last Active'],
            ...userActivity.map(activity => [
              activity.user.name,
              activity.tasksCreated,
              activity.tasksCompleted,
              activity.roomBookings,
              new Date(activity.lastActive).toLocaleString()
            ]),
          ]}
          filename={`cospace-full-report-${dateRange.start}-to-${dateRange.end}.csv`}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Export All to CSV
        </CSVLink>
      </div>
    </div>
  );

  // Tab content for daily stats
  const renderDailyStatsTab = () => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Daily Statistics</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room Usage
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task Completion
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active Users
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Tasks
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room Bookings
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dailyStats.map((stat, index) => (
              <tr key={index}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{stat.date}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{stat.roomUsage}%</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{stat.taskCompletion}%</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{stat.activeUsers}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{stat.newTasks}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{stat.roomBookings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-right">
        <CSVLink 
          data={dailyStatsCsvData} 
          filename={`daily-stats-${dateRange.start}-to-${dateRange.end}.csv`}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Export to CSV
        </CSVLink>
      </div>
    </div>
  );

  // Tab content for user activity
  const renderUserActivityTab = () => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">User Activity</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tasks Created
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tasks Completed
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room Bookings
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userActivity.map((activity, index) => (
              <tr key={index}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{activity.user.name}</div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{activity.tasksCreated}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{activity.tasksCompleted}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{activity.roomBookings}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(activity.lastActive).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-right">
        <CSVLink 
          data={userActivityCsvData} 
          filename={`user-activity-${dateRange.start}-to-${dateRange.end}.csv`}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Export to CSV
        </CSVLink>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Statistics</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </>
          ) : 'Refresh Data'}
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-md font-medium text-gray-800 mb-3">Date Range</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start"
              name="start"
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.start}
              onChange={handleDateRangeChange}
            />
          </div>
          <div>
            <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="end"
              name="end"
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.end}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dailyStats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('dailyStats')}
          >
            Daily Stats
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'userActivity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('userActivity')}
          >
            User Activity
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'dailyStats' && renderDailyStatsTab()}
        {activeTab === 'userActivity' && renderUserActivityTab()}
      </div>
    </div>
  );
};

export default ReportsPage; 