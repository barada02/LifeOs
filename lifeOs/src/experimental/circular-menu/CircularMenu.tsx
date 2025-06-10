import React, { useState, useRef, useEffect } from 'react';
import './CircularMenu.css';

// Mock data for projects
const mockProjects = [
  { id: 1, title: 'LifeOS Development', category: 'PERSONAL', progress: 65, tasks: { total: 20, completed: 13 } },
  { id: 2, title: 'Website Redesign', category: 'FREELANCE', progress: 40, tasks: { total: 15, completed: 6 } },
  { id: 3, title: 'Mobile App', category: 'HACKATHON', progress: 80, tasks: { total: 12, completed: 10 } },
  { id: 4, title: 'Learning TypeScript', category: 'PERSONAL', progress: 25, tasks: { total: 8, completed: 2 } },
];

// Mock data for tasks
const mockTasks = [
  { id: 1, title: 'Design user interface', dueDate: '2025-06-20', priority: 'HIGH', completed: false },
  { id: 2, title: 'Implement authentication', dueDate: '2025-06-15', priority: 'HIGH', completed: true },
  { id: 3, title: 'Create database schema', dueDate: '2025-06-12', priority: 'MEDIUM', completed: false },
  { id: 4, title: 'Write API documentation', dueDate: '2025-06-25', priority: 'LOW', completed: false },
  { id: 5, title: 'Setup CI/CD pipeline', dueDate: '2025-06-30', priority: 'MEDIUM', completed: false },
];

// Mock data for habits
const mockHabits = [
  { id: 1, title: 'Morning Meditation', streak: 15 },
  { id: 2, title: 'Exercise', streak: 8 },
  { id: 3, title: 'Reading', streak: 21 },
  { id: 4, title: 'Coding Practice', streak: 30 },
];

interface CircularMenuProps {
  // Add any props here if needed
}

const CircularMenu: React.FC<CircularMenuProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeContent, setActiveContent] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setActiveContent(null);
    }
  };

  const handleMenuItemClick = (contentType: string) => {
    setActiveContent(contentType);
    setIsMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeContent) {
      case 'dashboard':
        return (
          <div>
            <div className="stats-grid">
              <div className="stat-card content-item">
                <h3 className="stat-title">Total Projects</h3>
                <p className="stat-value">5</p>
                <p className="stat-trend trend-up">↑ 2 from last month</p>
              </div>
              <div className="stat-card content-item">
                <h3 className="stat-title">Active Tasks</h3>
                <p className="stat-value">12</p>
                <p className="stat-trend trend-down">↓ 3 from last week</p>
              </div>
              <div className="stat-card content-item">
                <h3 className="stat-title">Completed Tasks</h3>
                <p className="stat-value">28</p>
                <p className="stat-trend trend-up">↑ 5 this week</p>
              </div>
              <div className="stat-card content-item">
                <h3 className="stat-title">Productivity Score</h3>
                <p className="stat-value">82%</p>
                <p className="stat-trend trend-up">↑ 7% improvement</p>
              </div>
            </div>
            
            <h2 className="content-item">Upcoming Deadlines</h2>
            <div className="tasks-list content-item">
              {mockTasks.slice(0, 3).map(task => (
                <div key={task.id} className="task-item">
                  <input type="checkbox" className="task-checkbox" checked={task.completed} readOnly />
                  <div className="task-content">
                    <h3 className="task-title">{task.title}</h3>
                    <div className="task-meta">
                      <div className="task-due">
                        <span>Due: {task.dueDate}</span>
                      </div>
                      <div className={`task-priority priority-${task.priority.toLowerCase()}`}>
                        <span>{task.priority}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'projects':
        return (
          <div>
            <div className="projects-grid">
              {mockProjects.map(project => (
                <div key={project.id} className="project-card content-item">
                  <div className="project-header">
                    <h3 className="project-title">{project.title}</h3>
                    <span className="project-category">{project.category}</span>
                  </div>
                  <div className="project-progress">
                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{ width: `${project.progress}%` }}></div>
                    </div>
                    <div className="progress-stats">
                      <span>{project.progress}% complete</span>
                      <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'tasks':
        return (
          <div>
            <div className="tasks-list">
              {mockTasks.map(task => (
                <div key={task.id} className="task-item content-item">
                  <input type="checkbox" className="task-checkbox" checked={task.completed} readOnly />
                  <div className="task-content">
                    <h3 className="task-title">{task.title}</h3>
                    <div className="task-meta">
                      <div className="task-due">
                        <span>Due: {task.dueDate}</span>
                      </div>
                      <div className={`task-priority priority-${task.priority.toLowerCase()}`}>
                        <span>{task.priority}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'habits':
        return (
          <div className="habits-grid">
            {mockHabits.map(habit => (
              <div key={habit.id} className="habit-card content-item">
                <h3 className="habit-title">{habit.title}</h3>
                <p className="habit-streak">{habit.streak}</p>
                <p className="habit-subtitle">day streak</p>
              </div>
            ))}
          </div>
        );
        
      case 'goals':
        return (
          <div className="content-item">
            <h2>Your Goals</h2>
            <p>Goal tracking features coming soon...</p>
          </div>
        );
        
      case 'settings':
        return (
          <div className="content-item">
            <h2>Settings</h2>
            <p>Configure your LifeOS experience...</p>
          </div>
        );
        
      default:
        return (
          <div className="content-item">
            <h2>Welcome to LifeOS</h2>
            <p>Select an option from the menu to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="content-container">
      {/* Main Content Area */}
      <div className={`content-panel ${activeContent ? 'active' : ''}`}>
        <div className="content-header">
          <h2 className="content-title">
            {activeContent ? activeContent.charAt(0).toUpperCase() + activeContent.slice(1) : 'LifeOS'}
          </h2>
        </div>
        <div className="content-body">
          {renderContent()}
        </div>
      </div>
      
      {/* Circular Menu */}
      <div className="circular-menu-container" ref={menuRef}>
        {/* Menu Items */}
        <div className={`menu-items ${isMenuOpen ? 'open' : ''}`}>
          <div className="menu-item" onClick={() => handleMenuItemClick('dashboard')}>
            <span className="menu-item-icon">📊</span>
            <div className="menu-tooltip">Dashboard</div>
          </div>
          <div className="menu-item" onClick={() => handleMenuItemClick('projects')}>
            <span className="menu-item-icon">📂</span>
            <div className="menu-tooltip">Projects</div>
          </div>
          <div className="menu-item" onClick={() => handleMenuItemClick('tasks')}>
            <span className="menu-item-icon">✓</span>
            <div className="menu-tooltip">Tasks</div>
          </div>
          <div className="menu-item" onClick={() => handleMenuItemClick('habits')}>
            <span className="menu-item-icon">🔄</span>
            <div className="menu-tooltip">Habits</div>
          </div>
          <div className="menu-item" onClick={() => handleMenuItemClick('goals')}>
            <span className="menu-item-icon">🎯</span>
            <div className="menu-tooltip">Goals</div>
          </div>
          <div className="menu-item" onClick={() => handleMenuItemClick('settings')}>
            <span className="menu-item-icon">⚙️</span>
            <div className="menu-tooltip">Settings</div>
          </div>
        </div>
        
        {/* Toggle Button */}
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className={`menu-toggle-icon ${isMenuOpen ? 'open' : ''}`}>+</span>
        </button>
      </div>
    </div>
  );
};

export default CircularMenu;
