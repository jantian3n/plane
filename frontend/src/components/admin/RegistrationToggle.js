import React, { useState, useEffect } from 'react';
import '../../styles/AdminComponents.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function RegistrationToggle() {
  const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    fetchRegistrationStatus();
  }, []);
  
  const fetchRegistrationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/settings/allowRegistration`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch registration status');
      }
      
      const data = await response.json();
      setIsRegistrationEnabled(data.setting.value);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching registration status:', error);
      setError('Failed to load registration status');
      setIsLoading(false);
    }
  };
  
  const toggleRegistration = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/settings/allowRegistration`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: !isRegistrationEnabled }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update registration status');
      }
      
      const data = await response.json();
      setIsRegistrationEnabled(data.setting.value);
      setSuccess(`Registration is now ${data.setting.value ? 'enabled' : 'disabled'}`);
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating registration status:', error);
      setError('Failed to update registration status');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="admin-card">
      <h3>User Registration Control</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="toggle-container">
        <span>Registration Status: </span>
        <span className={`status-badge ${isRegistrationEnabled ? 'active' : 'banned'}`}>
          {isRegistrationEnabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      
      <button 
        className={`btn ${isRegistrationEnabled ? 'btn-ban' : 'btn-unban'}`}
        onClick={toggleRegistration}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : isRegistrationEnabled ? 'Disable Registration' : 'Enable Registration'}
      </button>
      
      <p className="setting-description">
        {isRegistrationEnabled 
          ? 'New users can currently register accounts on the platform.' 
          : 'New user registration is currently disabled.'}
      </p>
    </div>
  );
}

export default RegistrationToggle;