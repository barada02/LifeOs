import React from 'react';
import { Link } from 'react-router-dom';
import OrbitalNavigation from './OrbitalNavigation';
import './OrbitalDemoPage.css';

const OrbitalDemoPage = () => {
  return (
    <div className="orbital-demo-page">
      {/* Header */}
      <div className="demo-header">
        <h1>LifeOS Orbital UI Experiment</h1>
        <div className="demo-header-actions">
          <Link to="/" className="demo-header-button">Back to Landing Page</Link>
        </div>
      </div>
      
      {/* Demo Area */}
      <div className="demo-container">
        <OrbitalNavigation />
      </div>
      
      {/* Instructions */}
      <div className="demo-instructions">
        <h2>How to Use</h2>
        <ul>
          <li>Click on the center hub to view your dashboard</li>
          <li>Click on any orbital element to see that section's content</li>
          <li>Explore how the navigation feels more intuitive and organic</li>
        </ul>
        <p>This is an experimental UI concept that represents different life aspects as orbital elements around a central hub. Instead of traditional menus, navigation occurs through a spatial model that visually represents the relationship between different sections.</p>
      </div>
    </div>
  );
};

export default OrbitalDemoPage;
