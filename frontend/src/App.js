import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import Dashboard from './components/dashboard/dashboard';
import BudgetDashboard from './components/budget/BudgetDashboard';
import Charts from './components/charts/Charts';
import Forum from './components/forum/Forum';
import Profile from './components/profile/Profile';
import './App.css';
import Backup from './components/backup/Backup';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/signin" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          
          <Route path="/transactions" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/budget" element={
            <ProtectedRoute>
              <BudgetDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/charts" element={
            <ProtectedRoute>
              <Charts />
            </ProtectedRoute>
          } />
          
          <Route path="/forum" element={
            <ProtectedRoute>
              <Forum />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/backup" element={
    <ProtectedRoute>
        <Backup />
    </ProtectedRoute>
} />
          
          <Route path="/" element={<Navigate to="/transactions" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;