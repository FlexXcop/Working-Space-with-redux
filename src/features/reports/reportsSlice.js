import { createSlice } from '@reduxjs/toolkit';

// Generate random stats data
const generateDailyStats = (days = 30) => {
  const stats = [];
  let roomUsage = 60;
  let taskCompletion = 70;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    // Random variations
    roomUsage += Math.random() * 10 - 5;
    roomUsage = Math.min(Math.max(roomUsage, 30), 95);
    
    taskCompletion += Math.random() * 12 - 6;
    taskCompletion = Math.min(Math.max(taskCompletion, 40), 100);
    
    stats.push({
      date: date.toISOString().split('T')[0],
      roomUsage: Math.round(roomUsage),
      taskCompletion: Math.round(taskCompletion),
      activeUsers: Math.floor(Math.random() * 15) + 10,
      newTasks: Math.floor(Math.random() * 8) + 1,
      roomBookings: Math.floor(Math.random() * 6) + 1
    });
  }
  
  return stats;
};

// Mock room usage data
const generateRoomUsageData = () => {
  const roomTypes = ['Conference', 'Meeting', 'Brainstorming', 'Focus', 'Office'];
  return roomTypes.map(type => ({
    type,
    bookings: Math.floor(Math.random() * 50) + 20,
    hours: Math.floor(Math.random() * 100) + 50,
    utilization: Math.floor(Math.random() * 30) + 60
  }));
};

// Mock task distribution data
const generateTaskDistribution = () => {
  return [
    { status: 'To Do', count: Math.floor(Math.random() * 10) + 5 },
    { status: 'In Progress', count: Math.floor(Math.random() * 20) + 10 },
    { status: 'Completed', count: Math.floor(Math.random() * 40) + 20 }
  ];
};

// Mock user activity data
const generateUserActivityData = () => {
  const users = [
    { id: 1, name: 'Admin User' },
    { id: 2, name: 'Regular User' },
    { id: 3, name: 'John Doe' },
    { id: 4, name: 'Jane Smith' },
    { id: 5, name: 'Sarah Johnson' }
  ];
  
  return users.map(user => ({
    user,
    tasksCreated: Math.floor(Math.random() * 10) + 1,
    tasksCompleted: Math.floor(Math.random() * 8) + 1,
    roomBookings: Math.floor(Math.random() * 5) + 1,
    lastActive: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
  }));
};

const initialState = {
  dailyStats: generateDailyStats(),
  roomUsage: generateRoomUsageData(),
  taskDistribution: generateTaskDistribution(),
  userActivity: generateUserActivityData(),
  loading: false,
  error: null,
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  }
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    // Get reports
    getReports: (state) => {
      state.loading = true;
      state.error = null;
    },
    getReportsSuccess: (state, action) => {
      const { dailyStats, roomUsage, taskDistribution, userActivity } = action.payload;
      state.dailyStats = dailyStats;
      state.roomUsage = roomUsage;
      state.taskDistribution = taskDistribution;
      state.userActivity = userActivity;
      state.loading = false;
    },
    getReportsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Update date range
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
      // In a real app, this would trigger a refetch of data based on new date range
      // For this demo, we'll regenerate random data
      state.dailyStats = generateDailyStats(
        Math.round((new Date(action.payload.end) - new Date(action.payload.start)) / (24 * 60 * 60 * 1000)) + 1
      );
      state.roomUsage = generateRoomUsageData();
      state.taskDistribution = generateTaskDistribution();
      state.userActivity = generateUserActivityData();
    },
    
    // Refresh reports (regenerate data for demo)
    refreshReports: (state) => {
      state.loading = true;
    },
    refreshReportsSuccess: (state) => {
      state.dailyStats = generateDailyStats(
        Math.round((new Date(state.dateRange.end) - new Date(state.dateRange.start)) / (24 * 60 * 60 * 1000)) + 1
      );
      state.roomUsage = generateRoomUsageData();
      state.taskDistribution = generateTaskDistribution();
      state.userActivity = generateUserActivityData();
      state.loading = false;
    }
  }
});

export const {
  getReports,
  getReportsSuccess,
  getReportsFailure,
  setDateRange,
  refreshReports,
  refreshReportsSuccess
} = reportsSlice.actions;

// Selectors
export const selectDailyStats = state => state.reports.dailyStats;
export const selectRoomUsage = state => state.reports.roomUsage;
export const selectTaskDistribution = state => state.reports.taskDistribution;
export const selectUserActivity = state => state.reports.userActivity;
export const selectDateRange = state => state.reports.dateRange;
export const selectReportsLoading = state => state.reports.loading;

// Thunk to simulate data refresh
export const fetchReportData = () => (dispatch, getState) => {
  dispatch(refreshReports());
  
  // Simulate API call
  setTimeout(() => {
    dispatch(refreshReportsSuccess());
  }, 500);
};

export default reportsSlice.reducer; 