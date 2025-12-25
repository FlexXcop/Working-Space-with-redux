import { createSlice } from '@reduxjs/toolkit';

// Mock task data
const mockTasks = [
  {
    id: 1,
    title: 'Create project proposal',
    description: 'Draft a proposal for the new client project',
    status: 'completed',
    priority: 'high',
    dueDate: '2023-07-15',
    assignedTo: 2,
    assignedBy: 1,
    createdAt: '2023-07-01',
    updatedAt: '2023-07-10',
    comments: [
      { id: 1, userId: 1, text: 'Please add more details', createdAt: '2023-07-05' },
      { id: 2, userId: 2, text: 'Updated with requested changes', createdAt: '2023-07-08' }
    ]
  },
  {
    id: 2,
    title: 'Design website mockups',
    description: 'Create initial UI designs for homepage and dashboard',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2023-07-20',
    assignedTo: 2,
    assignedBy: 1,
    createdAt: '2023-07-05',
    updatedAt: '2023-07-05',
    comments: []
  },
  {
    id: 3,
    title: 'Client meeting preparation',
    description: 'Prepare slides and demo for client meeting',
    status: 'to-do',
    priority: 'high',
    dueDate: '2023-07-18',
    assignedTo: 3,
    assignedBy: 1,
    createdAt: '2023-07-10',
    updatedAt: '2023-07-10',
    comments: []
  },
  {
    id: 4,
    title: 'Backend API development',
    description: 'Implement REST APIs for user management module',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2023-07-25',
    assignedTo: 2,
    assignedBy: 1,
    createdAt: '2023-07-08',
    updatedAt: '2023-07-12',
    comments: [
      { id: 3, userId: 1, text: 'How is this progressing?', createdAt: '2023-07-12' }
    ]
  },
  {
    id: 5,
    title: 'Code review for login module',
    description: 'Review and provide feedback on login and authentication code',
    status: 'to-do',
    priority: 'medium',
    dueDate: '2023-07-16',
    assignedTo: 3,
    assignedBy: 1,
    createdAt: '2023-07-11',
    updatedAt: '2023-07-11',
    comments: []
  }
];

const initialState = {
  tasks: mockTasks,
  loading: false,
  error: null,
  filters: {
    status: null,
    priority: null,
    assignedTo: null
  },
  notifications: []
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Get tasks
    getTasks: (state) => {
      state.loading = true;
      state.error = null;
    },
    getTasksSuccess: (state, action) => {
      state.tasks = action.payload;
      state.loading = false;
    },
    getTasksFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Add task
    addTask: (state, action) => {
      const newTask = {
        ...action.payload,
        id: Math.max(0, ...state.tasks.map(t => t.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: []
      };
      state.tasks.push(newTask);
    },
    
    // Update task
    updateTask: (state, action) => {
      const { id, ...updates } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === id);
      
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    
    // Delete task
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    
    // Add comment to task
    addComment: (state, action) => {
      const { taskId, userId, text } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        const newComment = {
          id: Math.max(0, ...state.tasks[taskIndex].comments.map(c => c.id)) + 1,
          userId,
          text,
          createdAt: new Date().toISOString()
        };
        
        state.tasks[taskIndex].comments.push(newComment);
      }
    },
    
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        status: null,
        priority: null,
        assignedTo: null
      };
    },
    
    // Add notification
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
        read: false,
        createdAt: new Date().toISOString()
      });
    },
    
    // Mark notification as read
    markNotificationAsRead: (state, action) => {
      const notificationIndex = state.notifications.findIndex(
        notification => notification.id === action.payload
      );
      
      if (notificationIndex !== -1) {
        state.notifications[notificationIndex].read = true;
      }
    },
    
    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
    }
  }
});

export const {
  getTasks,
  getTasksSuccess,
  getTasksFailure,
  addTask,
  updateTask,
  deleteTask,
  addComment,
  setFilters,
  clearFilters,
  addNotification,
  markNotificationAsRead,
  clearNotifications
} = tasksSlice.actions;

// Selectors
export const selectAllTasks = state => state.tasks.tasks;

export const selectTaskById = (state, taskId) => 
  state.tasks.tasks.find(task => task.id === taskId);

export const selectFilteredTasks = state => {
  const { tasks, filters } = state.tasks;
  
  return tasks.filter(task => {
    // Filter by status
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    // Filter by priority
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    
    // Filter by assignee
    if (filters.assignedTo && task.assignedTo !== filters.assignedTo) {
      return false;
    }
    
    return true;
  });
};

export const selectTasksByStatus = state => {
  const allTasks = selectFilteredTasks(state);
  
  return {
    todo: allTasks.filter(task => task.status === 'to-do'),
    inProgress: allTasks.filter(task => task.status === 'in-progress'),
    completed: allTasks.filter(task => task.status === 'completed')
  };
};

export const selectTasksAssignedToUser = (state, userId) => 
  state.tasks.tasks.filter(task => task.assignedTo === userId);

export const selectUnreadNotifications = state => 
  state.tasks.notifications.filter(notification => !notification.read);

// Add selectTasksByAssignee selector that will filter tasks by assignee
export const selectTasksByAssignee = (state, assigneeId) => {
  return state.tasks.tasks.filter(task => task.assignedTo === assigneeId);
};

// Add a selector to get my tasks (tasks assigned to the current user)
export const selectMyTasks = (state) => {
  const currentUserId = state.auth.user?.id;
  if (!currentUserId) return [];
  return state.tasks.tasks.filter(task => task.assignedTo === currentUserId);
};

// Add a selector to get my tasks grouped by status
export const selectMyTasksByStatus = (state) => {
  const myTasks = selectMyTasks(state);
  return {
    todo: myTasks.filter(task => task.status === 'to-do'),
    inProgress: myTasks.filter(task => task.status === 'in-progress'),
    completed: myTasks.filter(task => task.status === 'completed')
  };
};

export default tasksSlice.reducer; 