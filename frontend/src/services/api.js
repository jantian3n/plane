const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Profile error:', error);
    throw error;
  }
};

export const getAllUsers = async (token) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

export const updateUserStatus = async (token, userId, status) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update status error:', error);
    throw error;
  }
};

export const getSetting = async (token, key) => {
  try {
    const response = await fetch(`${API_URL}/settings/${key}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch setting');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get setting error:', error);
    throw error;
  }
};

export const updateSetting = async (token, key, value) => {
  try {
    const response = await fetch(`${API_URL}/settings/${key}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update setting');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update setting error:', error);
    throw error;
  }
};

export default {
  register,
  login,
  getUserProfile,
  getAllUsers,
  updateUserStatus,
  getSetting,
  updateSetting
};