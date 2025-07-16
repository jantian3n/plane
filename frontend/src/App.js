import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
import './styles/App.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import GameDashboard from './pages/GameDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      api.getUserProfile(token)
        .then(data => {
          setUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);
  
  const handleLogin = async (credentials) => {
    try {
      const data = await api.login(credentials);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  const handleRegister = async (userData) => {
    try {
      await api.register(userData);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  if (loading) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
      <div className="loading-text">Loading...</div>
    </div>;
  }
  
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={
            user ? <Navigate to="/game" /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/game" /> : <Register onRegister={handleRegister} />
          } />
          {/* 添加一个重定向路由，将/dashboard重定向到/game */}
          <Route path="/dashboard" element={
            user ? <Navigate to="/game" /> : <Navigate to="/" />
          } />
          <Route path="/game/*" element={
            user ? <GameDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />
          } />
          <Route path="/admin/*" element={
            user && user.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;