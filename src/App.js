import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import RoomsPage from './pages/RoomsPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';


const App = () => {
  const { isAuthenticated, role } = useSelector(state => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
         <Route path="/register" element={!isAuthenticated ? <RegisterForm /> : <Navigate to="/dashboard" />} />
        
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks/*" element={<TasksPage />} />
            <Route path="/rooms/*" element={<RoomsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Admin only routes */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin" userRole={role} />}>
              <Route path="/users/*" element={<UsersPage />} />
            </Route>
            
            <Route path="/reports/*" element={<ReportsPage />} />
          </Route>
        </Route>
        
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App; 