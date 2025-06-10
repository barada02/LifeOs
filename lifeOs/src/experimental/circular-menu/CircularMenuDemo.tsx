import React from 'react';
import { Link } from 'react-router-dom';
import CircularMenu from './CircularMenu';
import './CircularMenuDemo.css';

const CircularMenuDemo = () => {
  return (
    <div className="circular-demo-container">
      <div className="demo-header">
        <h1>LifeOS Circular Menu Demo</h1>
        <Link to="/" className="back-button">Back to Home</Link>
      </div>
      
      <div className="demo-content">
        <CircularMenu />
      </div>
      
      <div className="demo-instructions">
        <div className="instructions-panel">
          <h2>How to Use</h2>
          <ol>
            <li>Click the blue button in the bottom-right corner to toggle the menu</li>
            <li>Select any menu item to see its content</li>
            <li>Explore the different sections: Dashboard, Projects, Tasks, etc.</li>
          </ol>
          <p>This UI concept keeps the interface clean while making all functions accessible with a single click. The circular menu pattern provides a natural and intuitive way to navigate between related items.</p>
        </div>
      </div>
    </div>
  );
};

export default CircularMenuDemo;
