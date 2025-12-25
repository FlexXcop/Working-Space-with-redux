import { createSlice } from '@reduxjs/toolkit';
// import { formatRupiah } from '../../utils/formatters'; 

// Mock users data
const mockUsers = [
  { 
    id: 1, 
    username: 'admin', 
    name: 'Admin User', 
    email: 'admin@example.com',
    role: 'admin', 
    department: 'Management',
    position: 'System Administrator',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    isActive: true,
    createdAt: '2023-01-15T10:30:00'
  },
  { 
    id: 2, 
    username: 'user1', 
    name: 'Regular User', 
    email: 'user1@example.com',
    role: 'user', 
    department: 'Marketing',
    position: 'Marketing Specialist',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    isActive: true,
    createdAt: '2023-02-20T14:45:00'
  },
  { 
    id: 3, 
    username: 'user2', 
    name: 'John Doe', 
    email: 'john.doe@example.com',
    role: 'user', 
    department: 'Development',
    position: 'Full Stack Developer',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    isActive: true,
    createdAt: '2023-03-10T09:15:00'
  },
  { 
    id: 4, 
    username: 'user3', 
    name: 'Jane Smith', 
    email: 'jane.smith@example.com',
    role: 'user', 
    department: 'Design',
    position: 'UI/UX Designer',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    isActive: false,
    createdAt: '2023-03-25T11:20:00'
  },
  { 
    id: 5, 
    username: 'admin2', 
    name: 'Sarah Johnson', 
    email: 'sarah.j@example.com',
    role: 'admin', 
    department: 'Operations',
    position: 'Operations Manager',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    isActive: true,
    createdAt: '2023-04-05T08:30:00'
  }
];

const initialState = {
  users: mockUsers,
  loading: false,
  error: null,
  selectedUser: null
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Get users
    getUsers: (state) => {
      state.loading = true;
      state.error = null;
    },
    getUsersSuccess: (state, action) => {
      state.users = action.payload;
      state.loading = false;
    },
    getUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Get single user
    getUserById: (state, action) => {
      state.loading = true;
      state.error = null;
      state.selectedUser = null;
    },
    getUserByIdSuccess: (state, action) => {
      state.selectedUser = action.payload;
      state.loading = false;
    },
    getUserByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Add user
    addUser: (state, action) => {
      const newUser = {
        ...action.payload,
        id: Math.max(0, ...state.users.map(u => u.id)) + 1,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      state.users.push(newUser);
    },
    
    // Update user
    updateUser: (state, action) => {
      const { id, ...updates } = action.payload;
      const userIndex = state.users.findIndex(user => user.id === id);
      
      if (userIndex !== -1) {
        state.users[userIndex] = {
          ...state.users[userIndex],
          ...updates
        };
      }
    },
    
    // Toggle user active status
    toggleUserStatus: (state, action) => {
      const userId = action.payload;
      const userIndex = state.users.findIndex(user => user.id === userId);
      
      if (userIndex !== -1) {
        state.users[userIndex].isActive = !state.users[userIndex].isActive;
      }
    },
    
    // Change user role
    changeUserRole: (state, action) => {
      const { userId, role } = action.payload;
      const userIndex = state.users.findIndex(user => user.id === userId);
      
      if (userIndex !== -1) {
        state.users[userIndex].role = role;
      }
    },
    
    // Clear selected user
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    }
  }
});

export const {
  getUsers,
  getUsersSuccess,
  getUsersFailure,
  getUserById,
  getUserByIdSuccess,
  getUserByIdFailure,
  addUser,
  updateUser,
  toggleUserStatus,
  changeUserRole,
  clearSelectedUser
} = usersSlice.actions;

// Selectors
export const selectAllUsers = state => state.users.users;

export const selectUserById = (state, userId) => 
  state.users.users.find(user => user.id === userId);

export const selectActiveUsers = state =>
  state.users.users.filter(user => user.isActive);

export const selectUsersByRole = (state, role) =>
  state.users.users.filter(user => user.role === role);

export const selectUserCount = state => ({
  total: state.users.users.length,
  active: state.users.users.filter(user => user.isActive).length,
  admins: state.users.users.filter(user => user.role === 'admin').length,
  regularUsers: state.users.users.filter(user => user.role === 'user').length
});

export default usersSlice.reducer; 