# LifeOS Backend Architecture

This document outlines the backend architecture for the LifeOS application, detailing the server structure, implementation approach, and technical decisions.

## Technology Stack

- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Validation**: Zod
- **Logging**: Winston

## Directory Structure

```
server/
├── src/
│   ├── config/               # Configuration files
│   │   ├── database.ts       # Database configuration
│   │   ├── auth.ts           # Authentication configuration
│   │   └── env.ts            # Environment variables
│   ├── controllers/          # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── project.controller.ts
│   │   ├── task.controller.ts
│   │   ├── milestone.controller.ts
│   │   ├── resource.controller.ts
│   │   ├── habit.controller.ts
│   │   ├── health.controller.ts
│   │   └── goal.controller.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── logging.middleware.ts
│   ├── models/               # Data models and DTOs
│   │   ├── user.model.ts
│   │   ├── project.model.ts
│   │   ├── task.model.ts
│   │   ├── milestone.model.ts
│   │   ├── resource.model.ts
│   │   ├── habit.model.ts
│   │   ├── health.model.ts
│   │   └── goal.model.ts
│   ├── repositories/         # Data access layer
│   │   ├── user.repository.ts
│   │   ├── project.repository.ts
│   │   ├── task.repository.ts
│   │   ├── milestone.repository.ts
│   │   ├── resource.repository.ts
│   │   ├── habit.repository.ts
│   │   ├── health.repository.ts
│   │   └── goal.repository.ts
│   ├── services/             # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── project.service.ts
│   │   ├── task.service.ts
│   │   ├── milestone.service.ts
│   │   ├── resource.service.ts
│   │   ├── habit.service.ts
│   │   ├── health.service.ts
│   │   ├── goal.service.ts
│   │   └── progress.service.ts
│   ├── routes/               # API routes
│   │   ├── auth.routes.ts
│   │   ├── project.routes.ts
│   │   ├── task.routes.ts
│   │   ├── milestone.routes.ts
│   │   ├── resource.routes.ts
│   │   ├── habit.routes.ts
│   │   ├── health.routes.ts
│   │   ├── goal.routes.ts
│   │   └── index.ts
│   ├── utils/                # Utility functions
│   │   ├── logger.ts
│   │   ├── validation.ts
│   │   ├── dates.ts
│   │   └── progress-calculator.ts
│   ├── types/                # TypeScript type definitions
│   │   ├── express.d.ts      # Express augmentation
│   │   ├── request.d.ts      # Request type extensions
│   │   └── response.d.ts     # Response type extensions
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── prisma/                   # Prisma ORM
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts               # Seed data
├── tests/                    # Test files
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   ├── fixtures/             # Test fixtures
│   └── setup.ts              # Test setup
├── .env                      # Environment variables
├── .env.example              # Example environment variables
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── jest.config.js            # Jest configuration
```

## Architectural Pattern

The backend follows a layered architecture pattern with clear separation of concerns:

1. **Routes Layer**
   - Defines API endpoints
   - Maps HTTP methods to controller functions
   - Applies middleware for authentication, validation, etc.

2. **Controller Layer**
   - Handles HTTP requests and responses
   - Validates input data
   - Delegates business logic to services
   - Formats responses

3. **Service Layer**
   - Implements business logic
   - Orchestrates data access through repositories
   - Handles data transformations
   - Manages cross-cutting concerns

4. **Repository Layer**
   - Abstracts database access
   - Implements data access patterns
   - Handles database transactions
   - Maps database entities to domain models

5. **Model Layer**
   - Defines data structures
   - Implements data validation
   - Represents domain entities

## Data Flow

1. **Request Flow**
   - Client sends HTTP request
   - Router directs to appropriate controller
   - Middleware processes request (auth, validation)
   - Controller validates input
   - Controller calls service
   - Service implements business logic
   - Repository accesses database
   - Response flows back through layers

2. **Response Flow**
   - Repository returns data
   - Service processes/transforms data
   - Controller formats response
   - Middleware processes response
   - Response sent to client

## Authentication and Authorization

1. **Authentication Strategy**
   - JWT-based authentication
   - Token issued on login/registration
   - Refresh token mechanism for session extension
   - Secure HTTP-only cookies for token storage

2. **Authorization Strategy**
   - Role-based access control
   - Resource ownership verification
   - Middleware for route protection
   - Fine-grained permission checks in services

## Error Handling

1. **Global Error Handler**
   - Centralized error handling middleware
   - Standardized error response format
   - Error logging and monitoring

2. **Custom Error Classes**
   - HTTP error classes (400, 401, 403, 404, 500)
   - Domain-specific error classes
   - Error code system for client-side handling

## Data Validation

1. **Input Validation**
   - Zod schemas for request validation
   - Validation middleware for routes
   - Strong TypeScript typing

2. **Database Validation**
   - Prisma schema constraints
   - Database-level constraints (unique, foreign keys)

## Database Access

1. **Prisma ORM**
   - Type-safe database access
   - Migrations for schema versioning
   - Transaction support
   - Relation handling

2. **Repository Pattern**
   - Abstraction over Prisma client
   - Reusable query building
   - Business logic separation from data access

## Progress Calculation

A key feature of LifeOS is automatic progress calculation for projects, milestones, and goals. This is implemented through the Progress Service:

```typescript
// Progress calculation for projects
export class ProgressService {
  constructor(
    private taskRepository: TaskRepository,
    private milestoneRepository: MilestoneRepository
  ) {}

  async calculateProjectProgress(projectId: number): Promise<number> {
    // Get all tasks for the project
    const tasks = await this.taskRepository.findByProjectId(projectId);
    
    if (tasks.length === 0) return 0;
    
    // Calculate weighted progress based on task priority and status
    const totalWeight = tasks.reduce((sum, task) => sum + this.getTaskWeight(task), 0);
    const completedWeight = tasks.reduce((sum, task) => {
      return sum + (this.getTaskCompletionPercentage(task) * this.getTaskWeight(task));
    }, 0);
    
    return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  }

  async calculateMilestoneProgress(milestoneId: number): Promise<number> {
    // Get all tasks for the milestone
    const tasks = await this.taskRepository.findByMilestoneId(milestoneId);
    
    if (tasks.length === 0) return 0;
    
    // Calculate simple average progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
    
    return ((completedTasks + (inProgressTasks * 0.5)) / totalTasks) * 100;
  }
  
  private getTaskWeight(task: Task): number {
    // Assign weights based on priority
    switch (task.priority) {
      case 'HIGH': return 3;
      case 'MEDIUM': return 2;
      case 'LOW': return 1;
      default: return 1;
    }
  }
  
  private getTaskCompletionPercentage(task: Task): number {
    // Calculate completion percentage based on status
    switch (task.status) {
      case 'COMPLETED': return 1;
      case 'IN_PROGRESS': return 0.5;
      case 'WAITING': return 0.25;
      case 'TODO': return 0;
      default: return 0;
    }
  }
}
```

## Habit Streak Calculation

Habit streaks are calculated using a specialized service:

```typescript
export class HabitStreakService {
  async calculateStreak(habitId: number, userId: number): Promise<{ current: number, longest: number }> {
    const habitCompletions = await this.habitCompletionRepository.findByHabitId(habitId);
    
    // Sort completions by date (newest first)
    const sortedCompletions = habitCompletions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Calculate current streak
    let currentStreak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedCompletions.length; i++) {
      const completion = sortedCompletions[i];
      const completionDate = new Date(completion.date);
      completionDate.setHours(0, 0, 0, 0);
      
      // Check if date is today or consecutive previous day
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (
        completion.completed && 
        completionDate.getTime() === expectedDate.getTime()
      ) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let currentLongestStreak = 0;
    
    for (let i = 0; i < sortedCompletions.length - 1; i++) {
      const currentDate = new Date(sortedCompletions[i].date);
      const nextDate = new Date(sortedCompletions[i + 1].date);
      
      // Calculate difference in days
      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (sortedCompletions[i].completed) {
        if (diffDays === 1) {
          currentLongestStreak++;
        } else {
          currentLongestStreak = 1;
        }
        
        longestStreak = Math.max(longestStreak, currentLongestStreak);
      }
    }
    
    return {
      current: currentStreak,
      longest: Math.max(longestStreak, currentStreak)
    };
  }
}
```

## Health Metric Trend Analysis

Health metrics are analyzed for trends using statistical methods:

```typescript
export class HealthMetricService {
  async calculateTrend(
    userId: number, 
    metricType: HealthMetricType, 
    period: 'week' | 'month' | 'year'
  ): Promise<MetricTrend> {
    // Get metrics for the specified period
    const startDate = this.getStartDateForPeriod(period);
    const metrics = await this.healthMetricRepository.findByTypeAndDateRange(
      userId,
      metricType,
      startDate,
      new Date()
    );
    
    if (metrics.length < 2) {
      return {
        direction: 'stable',
        change: 0,
        changePercent: 0
      };
    }
    
    // Sort by date (oldest first)
    const sortedMetrics = metrics.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Get first and last values
    const firstValue = sortedMetrics[0].value;
    const lastValue = sortedMetrics[sortedMetrics.length - 1].value;
    
    // Calculate change
    const change = lastValue - firstValue;
    const changePercent = (change / firstValue) * 100;
    
    // Determine direction
    let direction: 'increasing' | 'decreasing' | 'stable';
    
    if (Math.abs(changePercent) < 1) {
      direction = 'stable';
    } else if (change > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }
    
    return {
      direction,
      change,
      changePercent
    };
  }
  
  private getStartDateForPeriod(period: 'week' | 'month' | 'year'): Date {
    const now = new Date();
    
    switch (period) {
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        now.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return now;
  }
}
```

## Data Aggregation for Visualizations

Data for visualizations is aggregated through specialized service methods:

```typescript
export class VisualizationService {
  async getProjectProgressTimeline(
    projectId: number, 
    period: 'week' | 'month' | 'all'
  ): Promise<ProgressTimelinePoint[]> {
    // Get project history
    const projectHistory = await this.projectHistoryRepository.findByProjectId(
      projectId,
      this.getStartDateForPeriod(period)
    );
    
    // Get milestones
    const milestones = await this.milestoneRepository.findByProjectId(projectId);
    
    // Create timeline points from project history
    const timelinePoints = projectHistory.map(history => ({
      date: history.timestamp,
      progress: history.progress
    }));
    
    // Add milestone points
    const milestonePoints = milestones.map(milestone => ({
      date: milestone.dueDate,
      name: milestone.name,
      completed: milestone.completed
    }));
    
    return {
      timePoints: timelinePoints,
      milestones: milestonePoints
    };
  }
  
  async getHabitStreakVisualization(userId: number): Promise<HabitStreakData[]> {
    // Get all active habits
    const habits = await this.habitRepository.findByUserId(userId, { active: true });
    
    // For each habit, get streak data and last month completion
    const habitData = await Promise.all(
      habits.map(async habit => {
        const streaks = await this.habitStreakService.calculateStreak(habit.id, userId);
        const lastMonthCompletions = await this.habitCompletionRepository.findByHabitIdAndDateRange(
          habit.id,
          this.getStartDateForPeriod('month'),
          new Date()
        );
        
        return {
          id: habit.id,
          name: habit.name,
          currentStreak: streaks.current,
          longestStreak: streaks.longest,
          lastMonthCompletion: lastMonthCompletions.map(completion => ({
            date: completion.date,
            completed: completion.completed
          }))
        };
      })
    );
    
    return habitData;
  }
  
  async getHealthMetricsVisualization(
    userId: number,
    types: HealthMetricType[],
    period: 'week' | 'month' | 'year'
  ): Promise<HealthMetricVisualization> {
    const startDate = this.getStartDateForPeriod(period);
    const metricsData: Record<HealthMetricType, MetricVisualizationData> = {} as any;
    
    // For each metric type, get data and calculate trend
    for (const type of types) {
      const metrics = await this.healthMetricRepository.findByTypeAndDateRange(
        userId,
        type,
        startDate,
        new Date()
      );
      
      const trend = await this.healthMetricService.calculateTrend(userId, type, period);
      const unit = metrics.length > 0 ? metrics[0].unit : '';
      
      metricsData[type] = {
        unit,
        data: metrics.map(metric => ({
          date: metric.date,
          value: metric.value
        })),
        trend
      };
    }
    
    return {
      period,
      metrics: metricsData
    };
  }
  
  private getStartDateForPeriod(period: 'week' | 'month' | 'year' | 'all'): Date {
    if (period === 'all') return new Date(0); // Beginning of time
    
    const now = new Date();
    
    switch (period) {
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        now.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return now;
  }
}
```

## API Documentation

The API is documented using Swagger/OpenAPI:

```typescript
// app.ts
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LifeOS API',
      version: '1.0.0',
      description: 'API for LifeOS application',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

## Testing Strategy

1. **Unit Testing**
   - Test individual functions and methods
   - Mock dependencies
   - Focus on business logic

2. **Integration Testing**
   - Test API endpoints
   - Test database interactions
   - Use test database

3. **End-to-End Testing**
   - Test complete user flows
   - Simulate real-world scenarios

## Security Measures

1. **Authentication**
   - JWT token validation
   - Password hashing with bcrypt
   - Token expiration and refresh

2. **Authorization**
   - Resource-based access control
   - User ownership verification

3. **Data Protection**
   - Input validation and sanitization
   - Protection against common attacks (XSS, CSRF)
   - Rate limiting

4. **Environment Security**
   - Environment variable management
   - Secrets management
   - Secure header configuration

## Performance Considerations

1. **Database Optimization**
   - Indexed queries
   - Efficient data retrieval
   - Connection pooling

2. **Caching Strategy**
   - Cache frequently accessed data
   - Use Redis for cache storage
   - Implement cache invalidation

3. **Request Processing**
   - Pagination for large data sets
   - Query optimization
   - Asynchronous processing for long-running tasks

## Deployment Considerations

1. **Environment Configuration**
   - Environment-specific variables
   - Feature flags for staged rollout
   - Logging configuration

2. **Database Migration**
   - Version-controlled migrations
   - Rollback capability
   - Data integrity checks

3. **Monitoring and Logging**
   - Error tracking
   - Performance monitoring
   - Request logging

## Example Implementation

### Controller Implementation

```typescript
// src/controllers/project.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '../models/project.model';
import { HttpError } from '../utils/errors';

export class ProjectController {
  constructor(private projectService: ProjectService) {}

  async getAllProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const { status, category, search, sort, order, page, limit } = req.query;
      
      const projects = await this.projectService.getAllProjects(userId, {
        status: status as string,
        category: category as string,
        search: search as string,
        sort: sort as string,
        order: order as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10
      });
      
      return res.json(projects);
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const projectId = parseInt(req.params.id);
      
      const project = await this.projectService.getProjectById(projectId, userId);
      
      if (!project) {
        throw new HttpError(404, 'Project not found');
      }
      
      return res.json(project);
    } catch (error) {
      next(error);
    }
  }

  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const projectData: CreateProjectDto = req.body;
      
      const project = await this.projectService.createProject(projectData, userId);
      
      return res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const projectId = parseInt(req.params.id);
      const projectData: UpdateProjectDto = req.body;
      
      const project = await this.projectService.updateProject(projectId, projectData, userId);
      
      if (!project) {
        throw new HttpError(404, 'Project not found');
      }
      
      return res.json(project);
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const projectId = parseInt(req.params.id);
      
      const success = await this.projectService.deleteProject(projectId, userId);
      
      if (!success) {
        throw new HttpError(404, 'Project not found');
      }
      
      return res.json({ 
        success: true, 
        message: 'Project deleted successfully' 
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const projectId = parseInt(req.params.id);
      
      const statistics = await this.projectService.getProjectStatistics(projectId, userId);
      
      if (!statistics) {
        throw new HttpError(404, 'Project not found');
      }
      
      return res.json(statistics);
    } catch (error) {
      next(error);
    }
  }
}
```

### Service Implementation

```typescript
// src/services/project.service.ts
import { ProjectRepository } from '../repositories/project.repository';
import { TaskRepository } from '../repositories/task.repository';
import { MilestoneRepository } from '../repositories/milestone.repository';
import { ProgressService } from './progress.service';
import { CreateProjectDto, UpdateProjectDto, Project, ProjectStatistics } from '../models/project.model';
import { HttpError } from '../utils/errors';

export class ProjectService {
  constructor(
    private projectRepository: ProjectRepository,
    private taskRepository: TaskRepository,
    private milestoneRepository: MilestoneRepository,
    private progressService: ProgressService
  ) {}

  async getAllProjects(userId: number, filters: any): Promise<{ projects: Project[], pagination: any }> {
    const projects = await this.projectRepository.findByUserId(userId, filters);
    const count = await this.projectRepository.countByUserId(userId, filters);
    
    // Enhance projects with task counts
    const enhancedProjects = await Promise.all(
      projects.map(async project => {
        const taskCount = await this.taskRepository.countByProjectId(project.id);
        const completedTaskCount = await this.taskRepository.countByProjectIdAndStatus(
          project.id, 
          'COMPLETED'
        );
        
        return {
          ...project,
          taskCount: {
            total: taskCount,
            completed: completedTaskCount
          }
        };
      })
    );
    
    return {
      projects: enhancedProjects,
      pagination: {
        total: count,
        page: filters.page,
        limit: filters.limit,
        pages: Math.ceil(count / filters.limit)
      }
    };
  }

  async getProjectById(projectId: number, userId: number): Promise<Project | null> {
    const project = await this.projectRepository.findById(projectId);
    
    if (!project || project.userId !== userId) {
      return null;
    }
    
    // Get milestones
    const milestones = await this.milestoneRepository.findByProjectId(projectId);
    
    // Get recent tasks
    const recentTasks = await this.taskRepository.findRecentByProjectId(projectId, 5);
    
    return {
      ...project,
      milestones,
      recentTasks
    };
  }

  async createProject(data: CreateProjectDto, userId: number): Promise<Project> {
    // Create the project
    const project = await this.projectRepository.create({
      ...data,
      userId,
      progress: 0
    });
    
    return project;
  }

  async updateProject(
    projectId: number, 
    data: UpdateProjectDto, 
    userId: number
  ): Promise<Project | null> {
    // Check if project exists and belongs to user
    const project = await this.projectRepository.findById(projectId);
    
    if (!project || project.userId !== userId) {
      return null;
    }
    
    // Update the project
    const updatedProject = await this.projectRepository.update(projectId, data);
    
    // Recalculate progress if needed
    if (data.status === 'COMPLETED') {
      await this.projectRepository.update(projectId, { progress: 100 });
    } else if (data.status !== 'COMPLETED' && project.status === 'COMPLETED') {
      const progress = await this.progressService.calculateProjectProgress(projectId);
      await this.projectRepository.update(projectId, { progress });
    }
    
    return updatedProject;
  }

  async deleteProject(projectId: number, userId: number): Promise<boolean> {
    // Check if project exists and belongs to user
    const project = await this.projectRepository.findById(projectId);
    
    if (!project || project.userId !== userId) {
      return false;
    }
    
    // Delete the project
    await this.projectRepository.delete(projectId);
    
    return true;
  }

  async getProjectStatistics(projectId: number, userId: number): Promise<ProjectStatistics | null> {
    // Check if project exists and belongs to user
    const project = await this.projectRepository.findById(projectId);
    
    if (!project || project.userId !== userId) {
      return null;
    }
    
    // Get task statistics
    const totalTasks = await this.taskRepository.countByProjectId(projectId);
    const completedTasks = await this.taskRepository.countByProjectIdAndStatus(
      projectId, 
      'COMPLETED'
    );
    const inProgressTasks = await this.taskRepository.countByProjectIdAndStatus(
      projectId, 
      'IN_PROGRESS'
    );
    const todoTasks = await this.taskRepository.countByProjectIdAndStatus(
      projectId, 
      'TODO'
    );
    
    // Get milestone progress
    const milestones = await this.milestoneRepository.findByProjectId(projectId);
    const milestoneProgress = await Promise.all(
      milestones.map(async milestone => ({
        name: milestone.name,
        progress: await this.progressService.calculateMilestoneProgress(milestone.id)
      }))
    );
    
    // Get time tracking
    const timeTracking = await this.taskRepository.getTimeTrackingByProjectId(projectId);
    
    // Calculate days remaining
    const daysRemaining = project.dueDate 
      ? Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;
    
    return {
      taskCompletion: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        todo: todoTasks
      },
      milestoneProgress,
      timeTracking,
      daysRemaining
    };
  }
}
```

### Repository Implementation

```typescript
// src/repositories/project.repository.ts
import { PrismaClient } from '@prisma/client';
import { Project, CreateProjectDto, UpdateProjectDto } from '../models/project.model';

export class ProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: number, filters: any): Promise<Project[]> {
    const { status, category, search, sort, order, page, limit } = filters;
    
    const where: any = {
      userId,
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      } : {})
    };
    
    const orderBy: any = {};
    if (sort) {
      orderBy[sort] = order === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }
    
    const projects = await this.prisma.project.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    });
    
    return projects;
  }

  async countByUserId(userId: number, filters: any): Promise<number> {
    const { status, category, search } = filters;
    
    const where: any = {
      userId,
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      } : {})
    };
    
    return this.prisma.project.count({ where });
  }

  async findById(id: number): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id }
    });
  }

  async create(data: CreateProjectDto & { userId: number; progress: number }): Promise<Project> {
    return this.prisma.project.create({
      data
    });
  }

  async update(id: number, data: UpdateProjectDto): Promise<Project> {
    return this.prisma.project.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.project.delete({
      where: { id }
    });
  }
}
```

## Conclusion

This backend architecture provides a robust, scalable foundation for the LifeOS application. The layered approach with clear separation of concerns makes the codebase maintainable and extensible. The specialized services for progress calculation, streak tracking, and data visualization deliver the core features that make LifeOS valuable to users.

The architecture is designed to handle the complexity of life management data while providing fast, reliable API responses. The emphasis on type safety, validation, and error handling ensures a high-quality user experience and maintainable codebase.

Key strengths of this architecture include:

1. **Modular Design**: Each component has a clear responsibility.
2. **Type Safety**: TypeScript and Prisma provide end-to-end type safety.
3. **Maintainability**: Clear separation of concerns and consistent patterns.
4. **Scalability**: Independent layers can be scaled separately.
5. **Testability**: Each layer can be tested in isolation.

As the application grows, this architecture can be extended with additional features such as real-time updates, advanced analytics, and integration with external services.
