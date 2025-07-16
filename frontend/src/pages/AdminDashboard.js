import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import RegistrationToggle from '../components/admin/RegistrationToggle';
import '../styles/AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.pathname === '/admin') {
      navigate('/admin/settings');
    }
  }, [location, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${newStatus === 'active' ? 'unban' : 'ban'} user`);
      }

      // Update users list
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
      setError(`Failed to update user status: ${error.message}`);
    }
  };

  // Settings management section
  const SettingsPanel = () => (
    <div className="admin-panel">
      <h2>System Settings</h2>
      <RegistrationToggle />
    </div>
  );

  // User management section
  const UsersPanel = () => (
    <div className="admin-panel">
      <h2>User Management</h2>
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Online</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(user => (
                <tr key={user._id} className={user.status === 'banned' ? 'banned-user' : ''}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-badge ${user.status === 'active' ? 'active' : 'banned'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{new Date(user.lastOnline).toLocaleString()}</td>
                  <td>
                    <div className="action-buttons">
                      {user.status === 'active' ? (
                        <button 
                          className="btn btn-ban" 
                          onClick={() => handleStatusChange(user._id, 'banned')}
                          disabled={user.role === 'admin'}
                        >
                          Ban
                        </button>
                      ) : (
                        <button 
                          className="btn btn-unban" 
                          onClick={() => handleStatusChange(user._id, 'active')}
                        >
                          Unban
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-table">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-nav">
          <Link to="/dashboard">Game Dashboard</Link>
          <span>|</span>
          <span className="welcome-message">Admin: {user.username}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="admin-container">
        <div className="admin-sidebar">
          <nav>
            <ul>
              <li><Link to="/admin/settings">System Settings</Link></li>
              <li><Link to="/admin/users">User Management</Link></li>
            </ul>
          </nav>
        </div>

        <div className="admin-content">
          <Routes>
            <Route path="/settings" element={<SettingsPanel />} />
            <Route path="/users" element={<UsersPanel />} />
          </Routes>
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} Web Game Admin Panel. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AdminDashboard;