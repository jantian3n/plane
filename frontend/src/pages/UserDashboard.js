import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/UserDashboard.css';

function UserDashboard({ user, onLogout }) {
  const [userStats, setUserStats] = useState({
    lastOnline: user?.lastOnline || new Date(),
    totalOnlineTime: user?.totalOnlineTime || 0
  });

  // Format online time in hours, minutes
  const formatOnlineTime = (seconds) => {
    if (!seconds) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Game Dashboard</h1>
        <div className="user-nav">
          <span className="welcome-message">Welcome, {user.username}!</span>
          <Link to="/">Home</Link>
          {user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="user-profile">
          <h2>Your Profile</h2>
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Username:</span>
              <span className="info-value">{user.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role:</span>
              <span className="info-value">{user.role === 'admin' ? 'Administrator' : 'User'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Online:</span>
              <span className="info-value">{formatDate(userStats.lastOnline)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Play Time:</span>
              <span className="info-value">{formatOnlineTime(userStats.totalOnlineTime)}</span>
            </div>
          </div>
        </section>

        <section className="game-section">
          <h2>Airport Tycoon Game</h2>
          <div className="game-preview">
            <div className="game-info">
              <h3>Build Your Aviation Empire!</h3>
              <p>Manage airports, buy aircraft, establish routes, and compete with other players.</p>
              <ul className="game-features">
                <li>Build and upgrade your airport with various facilities</li>
                <li>Purchase different aircraft models (ARJ, C919, Airbus)</li>
                <li>Set up profitable routes between airports</li>
                <li>Park your aircraft at other players' airports to earn money</li>
                <li>Compete on the global leaderboard</li>
              </ul>
              <Link to="/game" className="play-game-btn">Play Airport Tycoon</Link>
            </div>
            <div className="game-screenshot">
              <div className="game-image-placeholder">
                <div className="airport-icon"></div>
                <p>Your Airport Awaits!</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} Web Game. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default UserDashboard;