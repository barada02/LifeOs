# LifeOS API Design Document

## Overview

This document outlines the API design for the LifeOS application, including all endpoints, request/response formats, and authentication requirements.

## Authentication

All API endpoints except for registration and login require authentication via JWT token.

### Authentication Header

```
Authorization: Bearer <jwt_token>
```

## Base URL

```
/api/v1
```

## Endpoints

### User Management

#### Register User

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
  ```

#### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
  ```

#### Get User Profile

- **URL**: `/users/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-01-01T00:00:00Z"
  }
  ```

#### Update User Profile

- **URL**: `/users/me`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "John Smith",
    "profilePicture": "image_url"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Smith",
    "profilePicture": "image_url",
    "updatedAt": "2023-01-02T00:00:00Z"
  }
  ```

### Project Management

#### Get All Projects

- **URL**: `/projects`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `status`: Filter by project status (ONGOING, COMPLETED, ARCHIVED, UPCOMING)
  - `category`: Filter by project category
  - `search`: Search term for project name or description
  - `sort`: Sort field (e.g., dueDate, createdAt, progress)
  - `order`: Sort order (asc, desc)
  - `page`: Page number for pagination
  - `limit`: Number of items per page
- **Response**:
  ```json
  {
    "projects": [
      {
        "id": 1,
        "name": "LifeOS Development",
        "description": "Personal management system",
        "status": "ONGOING",
        "category": "PERSONAL",
        "startDate": "2023-01-01T00:00:00Z",
        "dueDate": "2023-03-01T00:00:00Z",
        "progress": 35,
        "taskCount": {
          "total": 20,
          "completed": 7
        }
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
  ```

#### Create Project

- **URL**: `/projects`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "New Project",
    "description": "Project description",
    "status": "ONGOING",
    "category": "PERSONAL",
    "startDate": "2023-01-01T00:00:00Z",
    "dueDate": "2023-03-01T00:00:00Z"
  }
  ```
- **Response**:
  ```json
  {
    "id": 2,
    "name": "New Project",
    "description": "Project description",
    "status": "ONGOING",
    "category": "PERSONAL",
    "startDate": "2023-01-01T00:00:00Z",
    "dueDate": "2023-03-01T00:00:00Z",
    "progress": 0,
    "createdAt": "2023-01-10T00:00:00Z"
  }
  ```

#### Get Project Details

- **URL**: `/projects/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": 1,
    "name": "LifeOS Development",
    "description": "Personal management system",
    "status": "ONGOING",
    "category": "PERSONAL",
    "startDate": "2023-01-01T00:00:00Z",
    "dueDate": "2023-03-01T00:00:00Z",
    "progress": 35,
    "notes": "Project implementation notes...",
    "milestones": [
      {
        "id": 1,
        "name": "Design Phase",
        "dueDate": "2023-01-15T00:00:00Z",
        "progress": 100,
        "completed": true
      }
    ],
    "recentTasks": [
      {
        "id": 1,
        "title": "Create database schema",
        "status": "COMPLETED"
      }
    ],
    "createdAt": "2022-12-15T00:00:00Z",
    "updatedAt": "2023-01-10T00:00:00Z"
  }
  ```

#### Update Project

- **URL**: `/projects/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Updated Project Name",
    "status": "COMPLETED",
    "notes": "Updated project notes"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "name": "Updated Project Name",
    "status": "COMPLETED",
    "notes": "Updated project notes",
    "updatedAt": "2023-01-15T00:00:00Z"
  }
  ```

#### Delete Project

- **URL**: `/projects/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "message": "Project deleted successfully"
  }
  ```

#### Get Project Statistics

- **URL**: `/projects/:id/statistics`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "taskCompletion": {
      "total": 20,
      "completed": 7,
      "inProgress": 5,
      "todo": 8
    },
    "milestoneProgress": [
      {
        "name": "Design Phase",
        "progress": 100
      },
      {
        "name": "Development Phase",
        "progress": 30
      }
    ],
    "timeTracking": {
      "totalHours": 45,
      "thisWeek": 12
    },
    "daysRemaining": 45
  }
  ```

### Task Management

#### Get Tasks

- **URL**: `/tasks`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `projectId`: Filter by project
  - `status`: Filter by task status
  - `priority`: Filter by priority
  - `search`: Search term for task title
  - `dueDate`: Filter by due date
  - `sort`: Sort field
  - `order`: Sort order
  - `page`: Page number
  - `limit`: Items per page
- **Response**:
  ```json
  {
    "tasks": [
      {
        "id": 1,
        "title": "Create database schema",
        "description": "Design the PostgreSQL schema with Prisma",
        "status": "COMPLETED",
        "priority": "HIGH",
        "dueDate": "2023-01-10T00:00:00Z",
        "projectId": 1,
        "projectName": "LifeOS Development",
        "milestoneId": 1,
        "milestoneName": "Design Phase",
        "hasSubtasks": true,
        "subtaskCount": {
          "total": 3,
          "completed": 3
        }
      }
    ],
    "pagination": {
      "total": 20,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
  ```

#### Create Task

- **URL**: `/tasks`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Implement authentication",
    "description": "Set up JWT authentication system",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2023-01-20T00:00:00Z",
    "projectId": 1,
    "milestoneId": 2,
    "parentTaskId": null
  }
  ```
- **Response**:
  ```json
  {
    "id": 21,
    "title": "Implement authentication",
    "description": "Set up JWT authentication system",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2023-01-20T00:00:00Z",
    "projectId": 1,
    "milestoneId": 2,
    "parentTaskId": null,
    "createdAt": "2023-01-15T00:00:00Z"
  }
  ```

#### Get Task Details

- **URL**: `/tasks/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": 21,
    "title": "Implement authentication",
    "description": "Set up JWT authentication system",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2023-01-20T00:00:00Z",
    "projectId": 1,
    "projectName": "LifeOS Development",
    "milestoneId": 2,
    "milestoneName": "Development Phase",
    "parentTaskId": null,
    "subtasks": [
      {
        "id": 22,
        "title": "Set up JWT middleware",
        "status": "TODO"
      }
    ],
    "notes": "Research best practices for JWT implementation",
    "timeTracking": {
      "estimated": 4,
      "actual": 0
    },
    "createdAt": "2023-01-15T00:00:00Z",
    "updatedAt": "2023-01-15T00:00:00Z"
  }
  ```

#### Update Task

- **URL**: `/tasks/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS",
    "notes": "Using jsonwebtoken library with bcrypt"
  }
  ```
- **Response**:
  ```json
  {
    "id": 21,
    "title": "Implement authentication",
    "status": "IN_PROGRESS",
    "notes": "Using jsonwebtoken library with bcrypt",
    "updatedAt": "2023-01-16T00:00:00Z"
  }
  ```

#### Delete Task

- **URL**: `/tasks/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```

### Milestone Management

#### Get Milestones

- **URL**: `/projects/:projectId/milestones`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "milestones": [
      {
        "id": 1,
        "name": "Design Phase",
        "description": "Plan and design the application",
        "startDate": "2023-01-01T00:00:00Z",
        "dueDate": "2023-01-15T00:00:00Z",
        "completed": true,
        "progress": 100,
        "taskCount": {
          "total": 5,
          "completed": 5
        }
      }
    ]
  }
  ```

#### Create Milestone

- **URL**: `/projects/:projectId/milestones`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Testing Phase",
    "description": "Test the application",
    "startDate": "2023-02-15T00:00:00Z",
    "dueDate": "2023-02-28T00:00:00Z"
  }
  ```
- **Response**:
  ```json
  {
    "id": 3,
    "name": "Testing Phase",
    "description": "Test the application",
    "startDate": "2023-02-15T00:00:00Z",
    "dueDate": "2023-02-28T00:00:00Z",
    "completed": false,
    "progress": 0,
    "createdAt": "2023-01-15T00:00:00Z"
  }
  ```

#### Update Milestone

- **URL**: `/milestones/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "dueDate": "2023-03-05T00:00:00Z",
    "completed": true
  }
  ```
- **Response**:
  ```json
  {
    "id": 3,
    "name": "Testing Phase",
    "dueDate": "2023-03-05T00:00:00Z",
    "completed": true,
    "updatedAt": "2023-01-15T00:00:00Z"
  }
  ```

#### Delete Milestone

- **URL**: `/milestones/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "message": "Milestone deleted successfully"
  }
  ```

### Resource Management

#### Get Project Resources

- **URL**: `/projects/:projectId/resources`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `type`: Filter by resource type
- **Response**:
  ```json
  {
    "resources": [
      {
        "id": 1,
        "name": "Requirements Document",
        "type": "FILE",
        "url": "https://storage.example.com/files/requirements.pdf",
        "description": "Initial requirements document",
        "createdAt": "2023-01-05T00:00:00Z"
      },
      {
        "id": 2,
        "name": "API Documentation",
        "type": "LINK",
        "url": "https://api.example.com/docs",
        "description": "Reference API documentation",
        "createdAt": "2023-01-07T00:00:00Z"
      }
    ]
  }
  ```

#### Add Resource

- **URL**: `/projects/:projectId/resources`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Design Mockups",
    "type": "FILE",
    "file": "base64_encoded_file_or_multipart_form_data",
    "description": "UI design mockups"
  }
  ```
- **Response**:
  ```json
  {
    "id": 3,
    "name": "Design Mockups",
    "type": "FILE",
    "url": "https://storage.example.com/files/mockups.pdf",
    "description": "UI design mockups",
    "createdAt": "2023-01-15T00:00:00Z"
  }
  ```

#### Delete Resource

- **URL**: `/resources/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "message": "Resource deleted successfully"
  }
  ```

### Habit Tracking

#### Get Habits

- **URL**: `/habits`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `active`: Filter for active habits only (boolean)
- **Response**:
  ```json
  {
    "habits": [
      {
        "id": 1,
        "name": "Daily Meditation",
        "description": "15 minutes of mindfulness",
        "frequency": "DAILY",
        "timeOfDay": "MORNING",
        "targetDaysPerWeek": 7,
        "currentStreak": 12,
        "longestStreak": 30,
        "completionRate": 85,
        "active": true,
        "createdAt": "2022-12-01T00:00:00Z"
      }
    ]
  }
  ```

#### Create Habit

- **URL**: `/habits`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Exercise",
    "description": "30 minutes workout",
    "frequency": "DAILY",
    "timeOfDay": "EVENING",
    "targetDaysPerWeek": 5
  }
  ```
- **Response**:
  ```json
  {
    "id": 2,
    "name": "Exercise",
    "description": "30 minutes workout",
    "frequency": "DAILY",
    "timeOfDay": "EVENING",
    "targetDaysPerWeek": 5,
    "currentStreak": 0,
    "longestStreak": 0,
    "completionRate": 0,
    "active": true,
    "createdAt": "2023-01-15T00:00:00Z"
  }
  ```

#### Log Habit Completion

- **URL**: `/habits/:id/log`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "date": "2023-01-15",
    "notes": "Felt great today",
    "completed": true
  }
  ```
- **Response**:
  ```json
  {
    "id": 120,
    "habitId": 2,
    "date": "2023-01-15",
    "notes": "Felt great today",
    "completed": true,
    "createdAt": "2023-01-15T20:00:00Z"
  }
  ```

#### Get Habit History

- **URL**: `/habits/:id/history`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `startDate`: Start date for history
  - `endDate`: End date for history
- **Response**:
  ```json
  {
    "habitId": 2,
    "name": "Exercise",
    "completions": [
      {
        "date": "2023-01-15",
        "completed": true,
        "notes": "Felt great today"
      },
      {
        "date": "2023-01-14",
        "completed": true,
        "notes": ""
      },
      {
        "date": "2023-01-13",
        "completed": false,
        "notes": "Sick day"
      }
    ],
    "streakData": {
      "currentStreak": 2,
      "longestStreak": 2,
      "completionRate": 66.7
    }
  }
  ```

### Health Metrics

#### Get Health Metrics

- **URL**: `/health-metrics`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `type`: Type of health metric
  - `startDate`: Start date for data
  - `endDate`: End date for data
- **Response**:
  ```json
  {
    "metrics": [
      {
        "id": 1,
        "type": "WEIGHT",
        "value": 70.5,
        "unit": "kg",
        "date": "2023-01-15",
        "notes": "",
        "createdAt": "2023-01-15T08:00:00Z"
      }
    ]
  }
  ```

#### Log Health Metric

- **URL**: `/health-metrics`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "type": "SLEEP",
    "value": 7.5,
    "unit": "hours",
    "date": "2023-01-15",
    "notes": "Woke up refreshed"
  }
  ```
- **Response**:
  ```json
  {
    "id": 2,
    "type": "SLEEP",
    "value": 7.5,
    "unit": "hours",
    "date": "2023-01-15",
    "notes": "Woke up refreshed",
    "createdAt": "2023-01-15T20:00:00Z"
  }
  ```

#### Get Health Trends

- **URL**: `/health-metrics/trends`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `type`: Type of health metric
  - `period`: Time period (week, month, year)
- **Response**:
  ```json
  {
    "type": "WEIGHT",
    "unit": "kg",
    "period": "month",
    "data": [
      {
        "date": "2023-01-01",
        "value": 71.2
      },
      {
        "date": "2023-01-08",
        "value": 70.8
      },
      {
        "date": "2023-01-15",
        "value": 70.5
      }
    ],
    "trend": {
      "direction": "decreasing",
      "change": -0.7,
      "changePercent": -0.98
    }
  }
  ```

### Goals and Learning

#### Get Goals

- **URL**: `/goals`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `status`: Filter by status (ACTIVE, COMPLETED, ARCHIVED)
  - `category`: Filter by category
- **Response**:
  ```json
  {
    "goals": [
      {
        "id": 1,
        "title": "Learn React Native",
        "description": "Master React Native for mobile development",
        "category": "PROFESSIONAL",
        "targetDate": "2023-06-01T00:00:00Z",
        "progress": 35,
        "status": "ACTIVE",
        "subgoalCount": 5,
        "createdAt": "2023-01-01T00:00:00Z"
      }
    ]
  }
  ```

#### Create Goal

- **URL**: `/goals`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Run a Marathon",
    "description": "Train for and complete a full marathon",
    "category": "HEALTH",
    "targetDate": "2023-10-01T00:00:00Z"
  }
  ```
- **Response**:
  ```json
  {
    "id": 2,
    "title": "Run a Marathon",
    "description": "Train for and complete a full marathon",
    "category": "HEALTH",
    "targetDate": "2023-10-01T00:00:00Z",
    "progress": 0,
    "status": "ACTIVE",
    "createdAt": "2023-01-15T00:00:00Z"
  }
  ```

#### Get Goal Details

- **URL**: `/goals/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": 2,
    "title": "Run a Marathon",
    "description": "Train for and complete a full marathon",
    "category": "HEALTH",
    "targetDate": "2023-10-01T00:00:00Z",
    "progress": 0,
    "status": "ACTIVE",
    "notes": "Need to research training plans",
    "subgoals": [
      {
        "id": 5,
        "title": "Run 5km without stopping",
        "progress": 0,
        "completed": false
      }
    ],
    "resources": [
      {
        "id": 10,
        "name": "Marathon Training Guide",
        "type": "LINK",
        "url": "https://example.com/marathon-guide"
      }
    ],
    "createdAt": "2023-01-15T00:00:00Z",
    "updatedAt": "2023-01-15T00:00:00Z"
  }
  ```

#### Add Subgoal

- **URL**: `/goals/:id/subgoals`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Run 10km without stopping",
    "targetDate": "2023-04-01T00:00:00Z"
  }
  ```
- **Response**:
  ```json
  {
    "id": 6,
    "goalId": 2,
    "title": "Run 10km without stopping",
    "targetDate": "2023-04-01T00:00:00Z",
    "progress": 0,
    "completed": false,
    "createdAt": "2023-01-15T00:00:00Z"
  }
  ```

#### Update Goal Progress

- **URL**: `/goals/:id/progress`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "progress": 15,
    "notes": "Started basic training"
  }
  ```
- **Response**:
  ```json
  {
    "id": 2,
    "title": "Run a Marathon",
    "progress": 15,
    "notes": "Started basic training",
    "updatedAt": "2023-01-20T00:00:00Z"
  }
  ```

### Data Visualization

#### Dashboard Summary

- **URL**: `/dashboard/summary`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "projects": {
      "total": 5,
      "byStatus": {
        "ONGOING": 3,
        "COMPLETED": 1,
        "UPCOMING": 1
      },
      "recentActivity": [
        {
          "projectId": 1,
          "projectName": "LifeOS Development",
          "action": "Task completed",
          "timestamp": "2023-01-15T15:30:00Z"
        }
      ]
    },
    "tasks": {
      "total": 35,
      "byStatus": {
        "TODO": 15,
        "IN_PROGRESS": 8,
        "COMPLETED": 12
      },
      "upcoming": [
        {
          "id": 21,
          "title": "Implement authentication",
          "dueDate": "2023-01-20T00:00:00Z",
          "project": "LifeOS Development"
        }
      ]
    },
    "habits": {
      "total": 5,
      "streaks": {
        "current": {
          "best": {
            "habitId": 1,
            "habitName": "Daily Meditation",
            "streak": 12
          }
        }
      },
      "todayCompletion": {
        "completed": 2,
        "total": 5
      }
    },
    "goals": {
      "total": 3,
      "avgProgress": 20,
      "upcomingDeadlines": [
        {
          "id": 1,
          "title": "Learn React Native",
          "targetDate": "2023-06-01T00:00:00Z",
          "progress": 35
        }
      ]
    }
  }
  ```

#### Project Progress Timeline

- **URL**: `/projects/:id/progress-timeline`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `period`: Time period (week, month, all)
- **Response**:
  ```json
  {
    "projectId": 1,
    "projectName": "LifeOS Development",
    "timePoints": [
      {
        "date": "2023-01-01",
        "progress": 0
      },
      {
        "date": "2023-01-08",
        "progress": 15
      },
      {
        "date": "2023-01-15",
        "progress": 35
      }
    ],
    "milestones": [
      {
        "date": "2023-01-15",
        "name": "Design Phase",
        "completed": true
      }
    ]
  }
  ```

#### Habit Streaks Visualization

- **URL**: `/habits/streaks`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "habits": [
      {
        "id": 1,
        "name": "Daily Meditation",
        "currentStreak": 12,
        "longestStreak": 30,
        "lastMonthCompletion": [
          {
            "date": "2023-01-01",
            "completed": true
          },
          // More dates
        ]
      }
    ]
  }
  ```

#### Health Metrics Visualization

- **URL**: `/health-metrics/visualization`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `types`: Array of metric types
  - `period`: Time period
- **Response**:
  ```json
  {
    "period": "month",
    "metrics": {
      "WEIGHT": {
        "unit": "kg",
        "data": [
          {
            "date": "2023-01-01",
            "value": 71.2
          },
          // More data points
        ],
        "trend": {
          "direction": "decreasing",
          "change": -0.7
        }
      },
      "SLEEP": {
        "unit": "hours",
        "data": [
          {
            "date": "2023-01-01",
            "value": 7.0
          },
          // More data points
        ],
        "trend": {
          "direction": "increasing",
          "change": 0.5
        }
      }
    }
  }
  ```

## Error Responses

All API endpoints will return standard error responses in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional error details
  }
}
```

## Common Error Codes

- `UNAUTHORIZED`: Authentication required or token invalid
- `FORBIDDEN`: User does not have permission for this action
- `NOT_FOUND`: Requested resource not found
- `VALIDATION_ERROR`: Invalid input data
- `SERVER_ERROR`: Unexpected server error

## Rate Limiting

API endpoints are rate-limited to 100 requests per minute per user. Rate limit headers will be included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1610000000
```

## Pagination

Endpoints that return collections support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Pagination metadata is included in the response:

```json
{
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```
