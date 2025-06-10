import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <h1 className="header-logo">LifeOS</h1>
          <button 
            onClick={() => setIsLogin(true)}
            className="header-button"
          >
            Sign In
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="main-content">
        {/* Left Column - Marketing Content */}
        <div className="marketing-content">
          <h2 className="marketing-title">Organize Your Life with LifeOS</h2>
          <p className="marketing-subtitle">
            Your comprehensive life management system for organizing projects, tasks, habits, and goals. Take control of your time and boost your productivity.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">Project Management</h3>
              <p className="feature-description">Organize your work and personal projects in one place.</p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Task Tracking</h3>
              <p className="feature-description">Never forget important tasks with our intuitive system.</p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Habit Building</h3>
              <p className="feature-description">Build consistent habits that lead to long-term success.</p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Goal Setting</h3>
              <p className="feature-description">Set and achieve your short and long-term life goals.</p>
            </div>
          </div>
        </div>
        
        {/* Right Column - Auth Form */}
        <div className="auth-container">
          <AuthForm isLogin={isLogin} toggleForm={toggleForm} />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <p className="footer-text">
            © {new Date().getFullYear()} LifeOS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
