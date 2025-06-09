# LifeOS Database Schema Design

## Overview

This document outlines the database schema for the LifeOS application, a comprehensive life management system for organizing projects, tasks, habits, and goals.

## Enums

```prisma
enum TaskStatus {
  TODO
  IN_PROGRESS
  WAITING
  COMPLETED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}

enum ProjectStatus {
  ONGOING
  COMPLETED
  ARCHIVED
  UPCOMING
}

enum ProjectCategory {
  HACKATHON
  PERSONAL
  ACADEMIC
  FREELANCE
  OTHER
}

enum ResourceType {
  LINK
  FILE
  IDEA
  NOTE
}

enum HealthMetricType {
  WEIGHT
  SLEEP
  STEPS
  MOOD
  ENERGY
}
```

## Core Entities

### User
```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  passwordHash  String
  name          String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  projects      Project[]
  tasks         Task[]
  habits        Habit[]
  goals         Goal[]
  healthMetrics HealthMetric[]
}
```

### Project
```prisma
model Project {
  id            Int             @id @default(autoincrement())
  title         String
  description   String?
  status        ProjectStatus   @default(ONGOING)
  category      ProjectCategory @default(PERSONAL)
  startDate     DateTime?
  deadline      DateTime?
  progress      Float           @default(0) // 0-100
  userId        Int
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  tasks         Task[]
  milestones    Milestone[]
  resources     Resource[]
  notes         ProjectNote[]
  
  @@index([status])
  @@index([userId])
  @@index([category])
}
```

### Task
```prisma
model Task {
  id            Int           @id @default(autoincrement())
  title         String
  description   String?
  status        TaskStatus    @default(TODO)
  priority      TaskPriority  @default(MEDIUM)
  dueDate       DateTime?
  completedAt   DateTime?
  estimatedHours Float?
  actualHours   Float?
  
  // Progress tracking
  progress      Float         @default(0) // 0-100 percentage
  isSubtask     Boolean       @default(false) // Explicit flag for subtasks
  
  // Relations
  userId        Int
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId     Int?
  project       Project?      @relation(fields: [projectId], references: [id], onDelete: SetNull)
  
  // Self-relation for subtasks
  parentTaskId  Int?
  parentTask    Task?         @relation("SubTasks", fields: [parentTaskId], references: [id], onDelete: SetNull)
  subTasks      Task[]        @relation("SubTasks")
  
  // Milestone relation - tasks remain even if milestone is deleted
  milestoneId   Int?
  milestone     Milestone?    @relation(fields: [milestoneId], references: [id], onDelete: SetNull)
  
  // Skill relation for learning tasks
  isLearningTask Boolean      @default(false)
  skillId       Int?
  skill         Skill?        @relation(fields: [skillId], references: [id], onDelete: SetNull)
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  @@index([status])
  @@index([dueDate])
  @@index([userId])
  @@index([projectId])
  @@index([milestoneId])
  @@index([parentTaskId])
}
```

### Milestone
```prisma
model Milestone {
  id            Int       @id @default(autoincrement())
  title         String
  description   String?
  dueDate       DateTime?
  completedAt   DateTime?
  progress      Float     @default(0) // 0-100, calculated from associated tasks
  projectId     Int
  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  tasks         Task[]
}
```

### Resource
```prisma
model Resource {
  id            Int           @id @default(autoincrement())
  title         String
  type          ResourceType
  content       String
  projectId     Int
  project       Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  @@index([projectId])
}
```

### ProjectNote
```prisma
model ProjectNote {
  id            Int       @id @default(autoincrement())
  title         String
  content       String
  projectId     Int
  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## Life Management Entities

### Habit
```prisma
model Habit {
  id            Int       @id @default(autoincrement())
  title         String
  description   String?
  category      String?   // health, productivity, learning, etc.
  frequency     String    // daily, weekdays, weekly, custom
  timeOfDay     String?   // morning, afternoon, evening
  active        Boolean   @default(true)
  userId        Int
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  streaks       HabitStreak[]
  completions   HabitCompletion[]
  
  @@index([userId])
  @@index([category])
  @@index([active])
}
```

### HabitCompletion
```prisma
model HabitCompletion {
  id            Int       @id @default(autoincrement())
  completed     Boolean   @default(true)
  completedAt   DateTime  @default(now())
  notes         String?
  habitId       Int
  habit         Habit     @relation(fields: [habitId], references: [id], onDelete: Cascade)
  
  @@unique([habitId, completedAt])
  @@index([completedAt])
  @@index([habitId])
}
```

### HabitStreak
```prisma
model HabitStreak {
  id            Int       @id @default(autoincrement())
  startDate     DateTime
  endDate       DateTime?
  currentStreak Int       @default(1)
  habitId       Int
  habit         Habit     @relation(fields: [habitId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### HealthMetric
```prisma
model HealthMetric {
  id            Int              @id @default(autoincrement())
  type          HealthMetricType
  value         Float
  unit          String?          // kg, hours, steps, score (1-10)
  notes         String?
  recordedAt    DateTime         @default(now())
  userId        Int
  user          User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([type])
  @@index([recordedAt])
}
```

## Goals & Learning

### Goal
```prisma
model Goal {
  id            Int       @id @default(autoincrement())
  title         String
  description   String?
  category      String?   // career, personal, education, health
  targetDate    DateTime?
  completedAt   DateTime?
  progress      Float     @default(0) // 0-100
  userId        Int
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  subGoals      SubGoal[]
  skills        Skill[]
  
  @@index([userId])
  @@index([category])
  @@index([completedAt])
}
```

### SubGoal
```prisma
model SubGoal {
  id            Int       @id @default(autoincrement())
  title         String
  completed     Boolean   @default(false)
  completedAt   DateTime?
  goalId        Int
  goal          Goal      @relation(fields: [goalId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Skill
```prisma
model Skill {
  id            Int       @id @default(autoincrement())
  name          String
  description   String?
  proficiency   Float     @default(0) // 0-100
  goalId        Int?
  goal          Goal?     @relation(fields: [goalId], references: [id], onDelete: SetNull)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  tasks         Task[]
  learningResources LearningResource[]
}
```

### LearningResource
```prisma
model LearningResource {
  id            Int       @id @default(autoincrement())
  title         String
  type          String    // course, book, video, article, website
  url           String?
  notes         String?
  completed     Boolean   @default(false)
  completedAt   DateTime?
  skillId       Int
  skill         Skill     @relation(fields: [skillId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## Visualization & Analytics

The visualization and analytics for the application will be generated from the data in these models. For example:
- Project progress over time
- Habit completion rates
- Task completion statistics
- Health metric trends

### Progress Calculation Methods

For each level of the hierarchy, progress is calculated as follows:

1. **Task with subtasks**: 
   - Progress = (Number of completed subtasks / Total subtasks) * 100
   - When a subtask is marked complete, the parent task's progress is automatically updated

2. **Milestone**: 
   - Progress = (Sum of task progress) / (Number of tasks)
   - Each task contributes equally to milestone completion

3. **Project**: 
   - Progress = (Sum of milestone progress) / (Number of milestones)
   - Each milestone represents a key phase of the project

Alternative calculation using time estimates:

1. **Task with subtasks**: 
   - Progress = (Sum of completed subtask hours / Total subtask hours) * 100
   - This gives more weight to time-intensive subtasks

2. **Milestone**: 
   - Progress = (Sum of task hours completed / Total task hours) * 100
   - Accounts for varying task complexity

3. **Project**: 
   - Progress = (Sum of milestone progress weighted by tasks) / (Total tasks)
   - Provides more accurate representation of actual work completed

### Dashboard Timeline Logic

For the main dashboard timeline view, only specific tasks will be shown:
- Top-level tasks only (where `isSubtask = false`)
- Tasks not associated with milestones (optional filtering)
- Tasks based on user-selected filters (project, priority, etc.)

Subtasks remain hidden in the timeline view but are accessible when viewing a specific task's details.

## Schema Evolution

This schema provides a strong foundation for the LifeOS MVP. As the application evolves, we may need to add:
1. Collaboration features (sharing projects, assigning tasks)
2. More detailed analytics tables
3. Integration with external services
4. Notification preferences and logs

## Implementation Notes

- All datetime fields should use UTC
- All deletion operations on parent records handle related records appropriately:
  - User deletion: Cascades to all user data
  - Project deletion: Cascades to resources, notes, milestones
  - Milestone deletion: Tasks remain (SetNull on milestoneId) to preserve task data
  - Parent task deletion: Subtasks remain (SetNull on parentTaskId) to preserve task data
- Indexes are added to frequently queried fields for performance
- Enums are used for fields with fixed sets of values to ensure data consistency
- For visualization data, we may want to create materialized views or additional tables to optimize performance

## Task-Milestone Independence

Tasks and milestones are designed as independent entities:
- Tasks can exist without being associated with a milestone
- When a task is associated with a milestone, it contributes to the milestone's progress
- If a milestone is deleted, associated tasks remain in the system with their milestoneId set to null
- Progress is calculated programmatically based on task completion

This approach ensures:
1. No data loss when organizational structures change
2. Flexibility in moving tasks between projects and milestones
3. Consistent progress tracking across the hierarchy

## Next Steps

1. Review the schema for completeness
2. Implement in Prisma
3. Create initial migrations
4. Develop seed data for testing
