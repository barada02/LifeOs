import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './AuthForm.css';

interface AuthFormProps {
  isLogin: boolean;
  toggleForm: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin, toggleForm }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user starts typing
    setError('');
    setNetworkError(false);
  };

  const validateForm = () => {
    // Basic form validation
    if (!isLogin && formData.name.trim() === '') {
      setError('Name is required');
      return false;
    }
    
    if (formData.email.trim() === '') {
      setError('Email is required');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setError('');
    setNetworkError(false);
    setLoading(true);

    try {
      let response;

      if (isLogin) {
        response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });
      } else {
        response = await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        // If registration successful, show success message and toggle to login
        if (response.data.success) {
          alert('Registration successful! Please log in with your new account.');
          toggleForm();
          setLoading(false);
          return;
        }
      }

      if (response.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (!err.response) {
        // Network error
        setNetworkError(true);
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        // Server error with response
        setError(
          err.response?.data?.error || 
          'Something went wrong. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">
        {isLogin ? 'Login to LifeOS' : 'Create an Account'}
      </h2>
      
      {error && (
        <div className={`auth-form-error ${networkError ? 'network' : 'standard'}`}>
          <div className="auth-form-error-content">
            <svg className="auth-form-error-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Your full name"
              required={!isLogin}
            />
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder="you@example.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            placeholder="••••••••"
            required
          />
          <p className="form-hint">
            Password must be at least 6 characters long
          </p>
        </div>
        
        {!isLogin && (
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
              required={!isLogin}
            />
          </div>
        )}
        
        <div className="form-button-container">
          <button
            type="submit"
            className="form-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-indicator">
                <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </div>
        
        <div className="toggle-form-button">
          <button
            type="button"
            onClick={toggleForm}
            className="toggle-form-link"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
