import React, { useState } from 'react';
import './OrbitalNavigation.css';
import './OrbitalContent.css';

// Mock data for projects
const mockProjects = [
  { id: 1, title: 'LifeOS App', progress: 65, category: 'PERSONAL' },
  { id: 2, title: 'Portfolio Website', progress: 80, category: 'PERSONAL' },
  { id: 3, title: 'E-commerce Platform', progress: 30, category: 'FREELANCE' }
];

// Mock data for tasks
const mockTasks = [
  { id: 1, title: 'Design UI for Dashboard', status: 'IN_PROGRESS', dueDate: '2025-06-15' },
  { id: 2, title: 'Implement Authentication', status: 'COMPLETED', dueDate: '2025-06-05' },
  { id: 3, title: 'Create API Endpoints', status: 'TODO', dueDate: '2025-06-20' }
];

const OrbitalNavigation = () => {
  const [activeContent, setActiveContent] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string>('');

  const handleItemClick = (item: string) => {
    setActiveContent('content');
    setSelectedItem(item);
  };

  const closeContent = () => {
    setActiveContent(null);
  };

  // Render different content based on selected item
  const renderContent = () => {
    switch(selectedItem) {
      case 'dashboard':
        return (
          <div>
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Projects</h3>
                <p className="stat-number">5</p>
                <p>2 active, 3 completed</p>
              </div>
              <div className="stat-card">
                <h3>Tasks</h3>
                <p className="stat-number">24</p>
                <p>8 due this week</p>
              </div>
              <div className="stat-card">
                <h3>Progress</h3>
                <p className="stat-number">68%</p>
                <p>+12% from last week</p>
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div>
            <h2>Project Hub</h2>
            <div className="project-list">
              {mockProjects.map(project => (
                <div key={project.id} className="project-card">
                  <h3>{project.title}</h3>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p>{project.progress}% complete</p>
                  <span className="project-category">{project.category}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div>
            <h2>Task Management</h2>
            <div className="task-list">
              {mockTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className={`status-indicator ${task.status.toLowerCase()}`}></div>
                  <h3>{task.title}</h3>
                  <p>Due: {task.dueDate}</p>
                  <span className="task-status">{task.status}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'habits':
        return (
          <div>
            <h2>Habit Tracking</h2>
            <p>Track and maintain positive habits in your life.</p>
            <div className="habit-grid">
              <div className="habit-card">
                <h3>Morning Meditation</h3>
                <p>5 day streak</p>
              </div>
              <div className="habit-card">
                <h3>Daily Exercise</h3>
                <p>12 day streak</p>
              </div>
              <div className="habit-card">
                <h3>Reading</h3>
                <p>3 day streak</p>
              </div>
            </div>
          </div>
        );
      case 'goals':
        return (
          <div>
            <h2>Goals & Learning</h2>
            <p>Set and track long-term goals and learning progress.</p>
          </div>
        );
      case 'health':
        return (
          <div>
            <h2>Health Metrics</h2>
            <p>Monitor and improve your health and wellness statistics.</p>
          </div>
        );
      case 'notes':
        return (
          <div>
            <h2>Notes & Ideas</h2>
            <p>Capture and organize your thoughts and inspirations.</p>
          </div>
        );
      default:
        return <div>Select an item to view content</div>;
    }
  };

  return (
    <div className="orbital-container">
      {/* Center Hub */}
      <div className="center-hub" onClick={() => handleItemClick('dashboard')}>
        <h2>LifeOS</h2>
        <p>Your Life Operating System</p>
      </div>

      {/* Orbital Rings */}
      <div className="orbital-ring orbit-1"></div>
      <div className="orbital-ring orbit-2"></div>
      <div className="orbital-ring orbit-3"></div>

      {/* Orbital Items - First Orbit */}
      <div 
        className="orbital-item item-projects orbit-item-1" 
        onClick={() => handleItemClick('projects')}
      >
        <span className="orbital-item-icon">📊</span>
        <h3>Projects</h3>
      </div>

      <div 
        className="orbital-item item-tasks orbit-item-2" 
        onClick={() => handleItemClick('tasks')}
      >
        <span className="orbital-item-icon">✓</span>
        <h3>Tasks</h3>
      </div>

      {/* Orbital Items - Second Orbit */}
      <div 
        className="orbital-item item-habits orbit-item-3" 
        onClick={() => handleItemClick('habits')}
      >
        <span className="orbital-item-icon">🔄</span>
        <h3>Habits</h3>
      </div>

      <div 
        className="orbital-item item-goals orbit-item-4" 
        onClick={() => handleItemClick('goals')}
      >
        <span className="orbital-item-icon">🎯</span>
        <h3>Goals</h3>
      </div>

      {/* Orbital Items - Third Orbit */}
      <div 
        className="orbital-item item-health orbit-item-5" 
        onClick={() => handleItemClick('health')}
      >
        <span className="orbital-item-icon">❤️</span>
        <h3>Health</h3>
      </div>

      <div 
        className="orbital-item item-notes orbit-item-6" 
        onClick={() => handleItemClick('notes')}
      >
        <span className="orbital-item-icon">📝</span>
        <h3>Notes</h3>
      </div>

      {/* Content Area */}
      <div className={`content-area ${activeContent ? 'active' : ''}`}>
        <div className="content-header">
          <h2 className="content-title">
            {selectedItem && selectedItem.charAt(0).toUpperCase() + selectedItem.slice(1)}
          </h2>
          <button className="close-btn" onClick={closeContent}>×</button>
        </div>
        <div className="content-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OrbitalNavigation;
