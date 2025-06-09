# LifeOS Frontend Component Structure

This document outlines the component structure for the LifeOS frontend application, detailing the organization, component hierarchy, and responsibilities.

## Core Architecture

The frontend is built with React and TypeScript, using Zustand for state management, React Router for navigation, and Tailwind CSS for styling.

## Directory Structure

```
src/
├── assets/             # Static assets (images, icons, etc.)
├── components/         # Reusable UI components
│   ├── common/         # Common UI elements
│   ├── dashboard/      # Dashboard-specific components
│   ├── projects/       # Project management components
│   ├── tasks/          # Task management components
│   ├── habits/         # Habit tracking components
│   ├── health/         # Health tracking components
│   ├── goals/          # Goal management components
│   └── visualizations/ # Data visualization components
├── context/            # React contexts
├── hooks/              # Custom React hooks
├── layouts/            # Page layout components
├── pages/              # Page components
├── services/           # API and service layer
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Component Hierarchy

### Layout Components

#### `MainLayout`
- Primary layout for authenticated users
- Includes navigation sidebar, top bar, and content area
- Handles responsive behavior

#### `AuthLayout`
- Layout for authentication pages
- Simplified design for login, registration, etc.

### Page Components

#### `DashboardPage`
- Main dashboard view
- Aggregates widgets and overview panels
- Layout: `MainLayout`

#### `ProjectsPage`
- Project hub/listing page
- Shows project cards with filtering
- Layout: `MainLayout`

#### `ProjectDetailPage`
- Detailed view for a single project
- Shows tasks, milestones, resources
- Layout: `MainLayout`

#### `TasksPage`
- Task management page
- Lists all tasks with filtering and sorting
- Layout: `MainLayout`

#### `HabitsPage`
- Habit tracking dashboard
- Shows habit trackers and statistics
- Layout: `MainLayout`

#### `HealthPage`
- Health metrics dashboard
- Shows health data and trends
- Layout: `MainLayout`

#### `GoalsPage`
- Goals and learning dashboard
- Shows goals, progress, and resources
- Layout: `MainLayout`

#### `VisualizationsPage`
- Advanced visualizations dashboard
- Shows comprehensive data visualizations
- Layout: `MainLayout`

#### `LoginPage`
- User login form
- Layout: `AuthLayout`

#### `RegisterPage`
- User registration form
- Layout: `AuthLayout`

### Common Components

#### `Sidebar`
- Main navigation sidebar
- Shows links to main sections
- Includes user profile info

#### `TopBar`
- Top navigation bar
- Includes search, notifications, and user menu

#### `SearchBar`
- Global search component
- Searches across projects, tasks, etc.

#### `UserMenu`
- User profile dropdown menu
- Links to settings, logout, etc.

#### `NotificationCenter`
- Displays system notifications
- Shows task deadlines, milestone completions, etc.

#### `ConfirmDialog`
- Reusable confirmation dialog
- Used for deletions and important actions

#### `Toast`
- Notification toast component
- Shows success/error messages

### Dashboard Components

#### `DashboardSummary`
- Overview of key metrics
- Shows counts for projects, tasks, etc.

#### `RecentActivity`
- Recent activity feed
- Shows latest actions and updates

#### `UpcomingDeadlines`
- List of upcoming deadlines
- Shows tasks and milestones due soon

#### `QuickActions`
- Shortcuts for common actions
- Create task, log habit, etc.

#### `ProgressSummary`
- Overall progress visualization
- Shows project and goal progress

### Project Components

#### `ProjectCard`
- Card representation of a project
- Shows key project information
- Used in project listing

#### `ProjectFilter`
- Filtering controls for projects
- Filter by status, category, etc.

#### `ProjectHeader`
- Header for project detail page
- Shows project title, status, progress

#### `ProjectTimeline`
- Timeline visualization for project
- Shows milestones and key dates

#### `ProjectTaskList`
- List of tasks for a project
- Grouped by milestone or status

#### `NewProjectModal`
- Modal for creating a new project
- Form with project details

### Task Components

#### `TaskCard`
- Card representation of a task
- Shows task title, status, due date

#### `TaskList`
- List of tasks with filtering
- Shows tasks in table or kanban view

#### `TaskDetail`
- Detailed view of a task
- Shows all task information

#### `TaskForm`
- Form for creating/editing tasks
- Includes all task fields

#### `SubtaskList`
- List of subtasks for a task
- Shows nested task hierarchy

#### `TaskStatusDropdown`
- Dropdown for changing task status
- Updates task status in real-time

#### `TaskPriorityBadge`
- Visual indicator for task priority
- Color-coded for different priorities

### Habit Components

#### `HabitTracker`
- Calendar-style habit tracker
- Shows completion status for each day

#### `HabitCard`
- Card representation of a habit
- Shows habit name, streak, completion rate

#### `HabitForm`
- Form for creating/editing habits
- Includes frequency, target days, etc.

#### `StreakDisplay`
- Visual representation of habit streak
- Shows current streak and record

#### `HabitCompletionButton`
- Button for marking habit as complete
- Updates streak in real-time

#### `HabitStatistics`
- Statistics for a habit
- Shows completion rate, streaks, etc.

### Health Components

#### `HealthMetricInput`
- Form for logging health metrics
- Input for weight, sleep, etc.

#### `HealthTrendChart`
- Line chart for health metric trends
- Shows changes over time

#### `MetricCard`
- Card showing a health metric
- Shows current value and trend

#### `HealthSummary`
- Summary of health metrics
- Shows key health indicators

### Goal Components

#### `GoalCard`
- Card representation of a goal
- Shows goal title, progress, deadline

#### `GoalProgress`
- Progress indicator for a goal
- Shows percentage complete

#### `SubgoalList`
- List of subgoals for a goal
- Shows nested goal hierarchy

#### `GoalForm`
- Form for creating/editing goals
- Includes all goal fields

#### `LearningResourceList`
- List of resources for a goal
- Shows links, files, etc.

### Visualization Components

#### `LineChart`
- Line chart component
- Used for trend visualization

#### `BarChart`
- Bar chart component
- Used for comparison visualization

#### `PieChart`
- Pie chart component
- Used for distribution visualization

#### `GanttChart`
- Gantt chart for project timeline
- Shows tasks and milestones over time

#### `HeatMap`
- Calendar heatmap
- Shows activity intensity over time

#### `ProgressRing`
- Circular progress indicator
- Shows percentage complete

#### `SparkLine`
- Inline trend visualization
- Shows compact trend in limited space

## Data Visualization Strategy

### Dashboard Visualizations

1. **Project Progress Overview**
   - Type: Stacked bar chart
   - Data: Project completion percentages by category
   - Purpose: Quick overview of all project progress

2. **Task Status Distribution**
   - Type: Pie chart
   - Data: Tasks by status
   - Purpose: Show distribution of tasks across statuses

3. **Upcoming Deadlines Timeline**
   - Type: Timeline chart
   - Data: Tasks and milestones with due dates
   - Purpose: Show upcoming deadlines

### Project Visualizations

1. **Project Timeline**
   - Type: Gantt chart
   - Data: Tasks and milestones with dates
   - Purpose: Show project schedule and dependencies

2. **Task Status Breakdown**
   - Type: Grouped bar chart
   - Data: Tasks by status and milestone
   - Purpose: Show task completion across milestones

3. **Progress Over Time**
   - Type: Line chart
   - Data: Project progress percentage over time
   - Purpose: Show project momentum

### Habit Visualizations

1. **Habit Streak Calendar**
   - Type: Calendar heatmap
   - Data: Habit completion by date
   - Purpose: Show consistency and patterns

2. **Streak Length Comparison**
   - Type: Bar chart
   - Data: Current streak vs. longest streak
   - Purpose: Motivate to beat personal best

3. **Weekly Completion Rate**
   - Type: Line chart
   - Data: Percentage of habit completion by week
   - Purpose: Show consistency over time

### Health Visualizations

1. **Metric Trend Line**
   - Type: Line chart
   - Data: Health metric values over time
   - Purpose: Show progress and trends

2. **Correlation Chart**
   - Type: Scatter plot
   - Data: Relationship between two metrics
   - Purpose: Identify correlations

3. **Daily Distribution**
   - Type: Box plot
   - Data: Distribution of metrics by time of day
   - Purpose: Identify patterns in daily variations

### Goal Visualizations

1. **Goal Progress Tracker**
   - Type: Progress bars
   - Data: Current progress towards goals
   - Purpose: Show advancement towards targets

2. **Learning Path**
   - Type: Network diagram
   - Data: Skills and their relationships
   - Purpose: Visualize skill development path

3. **Goal Timeline**
   - Type: Timeline chart
   - Data: Goals and subgoals with target dates
   - Purpose: Show goal schedule and dependencies

## State Management

Zustand store slices for different domains:

### Auth Store
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

### Project Store
```typescript
interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProjectById: (id: number) => Promise<void>;
  createProject: (projectData: CreateProjectData) => Promise<void>;
  updateProject: (id: number, projectData: UpdateProjectData) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
}
```

### Task Store
```typescript
interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  fetchTaskById: (id: number) => Promise<void>;
  createTask: (taskData: CreateTaskData) => Promise<void>;
  updateTask: (id: number, taskData: UpdateTaskData) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}
```

### Habit Store
```typescript
interface HabitState {
  habits: Habit[];
  habitHistory: Record<number, HabitCompletion[]>;
  isLoading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  fetchHabitHistory: (id: number, dateRange: DateRange) => Promise<void>;
  createHabit: (habitData: CreateHabitData) => Promise<void>;
  logHabitCompletion: (id: number, data: HabitCompletionData) => Promise<void>;
}
```

### Health Store
```typescript
interface HealthState {
  metrics: HealthMetric[];
  trends: Record<HealthMetricType, MetricTrend>;
  isLoading: boolean;
  error: string | null;
  fetchMetrics: (type: HealthMetricType, dateRange: DateRange) => Promise<void>;
  fetchTrends: (type: HealthMetricType, period: string) => Promise<void>;
  logMetric: (metricData: LogHealthMetricData) => Promise<void>;
}
```

### Goal Store
```typescript
interface GoalState {
  goals: Goal[];
  currentGoal: Goal | null;
  isLoading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  fetchGoalById: (id: number) => Promise<void>;
  createGoal: (goalData: CreateGoalData) => Promise<void>;
  updateGoalProgress: (id: number, progress: number) => Promise<void>;
  addSubgoal: (goalId: number, subgoalData: CreateSubgoalData) => Promise<void>;
}
```

### UI Store
```typescript
interface UIState {
  sidebarOpen: boolean;
  currentTheme: 'light' | 'dark';
  notifications: Notification[];
  toggleSidebar: () => void;
  toggleTheme: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}
```

## Custom Hooks

### Data Fetching Hooks

```typescript
// Project hooks
const useProjects = () => {...}
const useProjectDetails = (id: number) => {...}

// Task hooks
const useTasks = (filters?: TaskFilters) => {...}
const useTaskDetails = (id: number) => {...}

// Habit hooks
const useHabits = () => {...}
const useHabitHistory = (id: number, dateRange: DateRange) => {...}

// Health hooks
const useHealthMetrics = (type: HealthMetricType, dateRange: DateRange) => {...}
const useHealthTrends = (type: HealthMetricType, period: string) => {...}

// Goal hooks
const useGoals = () => {...}
const useGoalDetails = (id: number) => {...}
```

### Utility Hooks

```typescript
// Authentication
const useAuth = () => {...}

// Form handling
const useFormWithValidation = <T>(initialValues: T, validationSchema: any) => {...}

// Notifications
const useNotifications = () => {...}

// Theme
const useTheme = () => {...}

// Responsive design
const useMediaQuery = (query: string) => {...}

// Visualization
const useChartData = (data: any[], options: ChartOptions) => {...}
```

## Responsive Design Approach

The application uses a mobile-first approach with Tailwind CSS for responsive design:

1. **Layout Breakpoints**:
   - `sm`: 640px (small devices)
   - `md`: 768px (medium devices)
   - `lg`: 1024px (large devices)
   - `xl`: 1280px (extra large devices)
   - `2xl`: 1536px (2x extra large devices)

2. **Responsive Patterns**:
   - Sidebar collapses to bottom navigation on mobile
   - Cards stack vertically on smaller screens
   - Tables transform to card views on mobile
   - Charts resize and simplify on smaller screens
   - Forms use full width on mobile

3. **Touch-Friendly UI**:
   - Larger touch targets on mobile
   - Swipe gestures for common actions
   - Bottom sheet dialogs instead of modals on mobile

## Component Development Guidelines

1. **Component Structure**:
   - Each component should be in its own file
   - Include appropriate TypeScript interfaces
   - Export default the main component

2. **Styling**:
   - Use Tailwind CSS for styling
   - Create consistent component variations
   - Use CSS variables for theming

3. **State Management**:
   - Use local state for UI-only state
   - Use Zustand for shared application state
   - Use derived state where possible

4. **Testing**:
   - Write unit tests for business logic
   - Write component tests for complex components
   - Use mock data for testing

5. **Documentation**:
   - Include JSDoc comments for props
   - Document complex logic
   - Include usage examples for reusable components

## Example Component

```tsx
import React from 'react';
import { Task } from '../../types/task';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onClick: (taskId: number) => void;
  className?: string;
}

/**
 * TaskCard component displays a task in a card format
 */
export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onClick, 
  className = '' 
}) => {
  const statusColors = {
    TODO: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    WAITING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800'
  };
  
  const priorityColors = {
    LOW: 'bg-gray-100',
    MEDIUM: 'bg-yellow-100',
    HIGH: 'bg-red-100'
  };

  return (
    <div 
      className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={() => onClick(task.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <Badge 
          label={task.status} 
          className={statusColors[task.status]} 
        />
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span 
            className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} 
          />
          <span className="text-xs text-gray-500">
            {task.priority}
          </span>
        </div>
        
        {task.dueDate && (
          <span className="text-xs text-gray-500">
            Due: {formatDate(task.dueDate)}
          </span>
        )}
      </div>
      
      {task.projectName && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {task.projectName}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
```
