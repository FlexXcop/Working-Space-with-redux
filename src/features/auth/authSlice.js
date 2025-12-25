import { createSlice } from '@reduxjs/toolkit';

// Mock users data
const mockUsers = [
  { 
    id: 1, 
    username: 'admin', 
    password: 'admin123', 
    role: 'admin', 
    name: 'Admin User',
    email: 'admin@coworkspace.com',
    department: 'Management',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    phoneNumber: '+628123456789',
    roleDescription: 'Administrator',
    joinDate: '2022-01-01'
  },
  { 
    id: 2, 
    username: 'user1', 
    password: 'user123', 
    role: 'user', 
    name: 'Regular User',
    email: 'user@coworkspace.com',
    department: 'Marketing',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    phoneNumber: '+628234567890',
    roleDescription: 'Member',
    joinDate: '2022-03-15'
  },
  { 
    id: 3, 
    username: 'user2', 
    password: 'user123', 
    role: 'user', 
    name: 'Hussen Worker',
    email: 'hussen@coworkspace.com',
    department: 'Design',
    avatar: 'https://randomuser.me/api/portraits/lego/5.jpg',
    phoneNumber: '+628345678901',
    roleDescription: 'Member',
    joinDate: '2022-05-20'
  },
];

const initialState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { user, token, role } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
    },
  },
});

// Async thunk for login
export const login = (credentials) => (dispatch) => {
  dispatch(loginStart());
  
  // Simulate API call with timeout
  setTimeout(() => {
    const user = mockUsers.find(
      (u) => u.username === credentials.username && u.password === credentials.password
    );
    
    if (user) {
      // Generate fake token
      const token = `fake-jwt-token-${Math.random().toString(36).substring(2)}`;
      
      // Create user object without password
      const { password, ...userWithoutPassword } = user;
      
      dispatch(loginSuccess({
        user: userWithoutPassword,
        token,
        role: user.role,
      }));
    } else {
      dispatch(loginFailure('Invalid username or password'));
    }
  }, 800);
};

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

export default authSlice.reducer; 