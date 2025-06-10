import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/');
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const response = await axios.get(`${apiUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUser(response.data);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.error || 'Failed to fetch user data. Please try logging in again.');
        // Don't log out immediately on network errors to give users a chance to retry
        if (err.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };
  const handleRetry = () => {
    // Re-trigger the useEffect
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="loading-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2 className="error-title">Error</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button 
              onClick={handleRetry}
              className="retry-button"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="dashboard-container">
      {/* Header/Navbar */}
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-logo">
              <h1 className="header-logo-text">LifeOS</h1>
            </div>
            <div className="header-user-section">
              <span className="header-username">Hello, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="header-logout-button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="main-content">
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">Welcome to Your Dashboard</h2>
            <p className="panel-subtitle">
              Your personal life management system is ready for you to start organizing your life.
            </p>
          </div>
          
          {/* Dashboard Cards */}
          <div className="cards-container">
            {/* Tasks Card */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title">Tasks</h3>
                <span className="card-badge">Coming Soon</span>
              </div>
              <p className="card-description">Organize and track your daily tasks and to-dos.</p>
              <button disabled className="card-button">
                Add New Task →
              </button>
            </div>
            
            {/* Projects Card */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title">Projects</h3>
                <span className="card-badge">Coming Soon</span>
              </div>
              <p className="card-description">Manage your projects and track their progress.</p>
              <button disabled className="card-button">
                Create Project →
              </button>
            </div>
            
            {/* Habits Card */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title">Habits</h3>
                <span className="card-badge">Coming Soon</span>
              </div>
              <p className="card-description">Build and track your daily habits and routines.</p>
              <button disabled className="card-button">
                Start Habit →
              </button>
            </div>
          </div>
        </div>
        
        {/* Account Info */}
        <div className="dashboard-panel account-section">
          <div className="panel-header">
            <h3 className="panel-title">Account Information</h3>
          </div>
          <div className="account-grid">
            <div>
              <p className="account-item-label">Name</p>
              <p className="account-item-value">{user?.name}</p>
            </div>
            <div>
              <p className="account-item-label">Email</p>
              <p className="account-item-value">{user?.email}</p>
            </div>
            <div>
              <p className="account-item-label">Member Since</p>
              <p className="account-item-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-container">
          <p className="footer-text">
            © {new Date().getFullYear()} LifeOS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
