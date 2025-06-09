# LifeOS Database Migration and Seeding Plan

This document outlines the strategy for database migration and data seeding for the LifeOS application.

## Migration Strategy

The LifeOS application uses Prisma ORM to manage database migrations. Migrations will be handled through Prisma's migration system, which creates SQL migration files that can be version-controlled and applied consistently across environments.

### Migration Approach

1. **Initial Schema Migration**
   - Create the base schema with all core entities
   - Establish primary relationships
   - Set up basic indexes
   - Define essential constraints

2. **Incremental Migrations**
   - Each new feature or schema change gets its own migration
   - Clear naming convention: `YYYYMMDD_descriptive_name`
   - Reversible when possible (has both up and down migrations)

3. **Migration Testing**
   - Test migrations in development environment
   - Verify data integrity after migration
   - Ensure migrations are idempotent

### Migration File Structure

Migrations will be stored in the `prisma/migrations` directory with the following structure:

```
prisma/
├── migrations/
│   ├── 20230501000000_initial_schema/
│   │   └── migration.sql
│   ├── 20230510000000_add_health_metrics/
│   │   └── migration.sql
│   └── 20230520000000_add_habit_history/
│       └── migration.sql
├── schema.prisma
└── seed.ts
```

### Migration Process

#### Development Environment

1. **Make Schema Changes**
   ```bash
   # Update schema.prisma file
   ```

2. **Generate Migration**
   ```bash
   npx prisma migrate dev --name descriptive_name
   ```

3. **Apply Migration**
   ```bash
   # Automatically applied by the generate command
   ```

4. **Verify Migration**
   ```bash
   npx prisma studio
   ```

#### Production Environment

1. **Test Migration in Staging**
   ```bash
   npx prisma migrate deploy
   ```

2. **Apply to Production**
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify Production Data**
   ```bash
   # Run validation queries
   ```

### Rollback Strategy

1. **Create Rollback Migration**
   ```bash
   # Create a new migration that reverses the changes
   npx prisma migrate dev --name rollback_previous_migration
   ```

2. **Apply Rollback**
   ```bash
   npx prisma migrate deploy
   ```

## Seeding Strategy

Data seeding is essential for development, testing, and demonstration purposes. The seeding process will populate the database with realistic data that showcases the features of the LifeOS application.

### Seed Data Categories

1. **User Data**
   - Demo user account
   - Admin user account
   - Test user accounts with different usage patterns

2. **Project Data**
   - Various project types (personal, academic, work)
   - Different project statuses (ongoing, completed, upcoming)
   - Projects with varying completion levels

3. **Task Data**
   - Tasks with different statuses
   - Tasks with different priorities
   - Tasks with dependencies
   - Tasks with attachments

4. **Milestone Data**
   - Milestones with different completion states
   - Milestones with associated tasks

5. **Resource Data**
   - Links, files, and notes
   - Resources attached to projects

6. **Habit Data**
   - Daily, weekly habits
   - Habits with streak history
   - Habits with different completion rates

7. **Health Metric Data**
   - Weight, sleep, mood data over time
   - Data with clear trends for visualization

8. **Goal Data**
   - Short-term and long-term goals
   - Goals with subgoals
   - Goals with different progress levels

### Seed Implementation

The seed data will be implemented in `prisma/seed.ts` using Prisma Client. The seeding process will be structured to maintain referential integrity and create a realistic data ecosystem.

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const demoUser = await createDemoUser();
  
  // Create projects
  const projects = await createProjects(demoUser.id);
  
  // Create milestones
  const milestones = await createMilestones(projects);
  
  // Create tasks
  await createTasks(projects, milestones, demoUser.id);
  
  // Create resources
  await createResources(projects);
  
  // Create habits
  await createHabits(demoUser.id);
  
  // Create health metrics
  await createHealthMetrics(demoUser.id);
  
  // Create goals
  await createGoals(demoUser.id);
  
  console.log('Seed data created successfully');
}

async function createDemoUser() {
  // Check if demo user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@lifeOS.com' }
  });
  
  if (existingUser) {
    return existingUser;
  }
  
  // Create demo user
  return prisma.user.create({
    data: {
      email: 'demo@lifeOS.com',
      name: 'Demo User',
      password: await hash('password123', 10),
    }
  });
}

async function createProjects(userId: number) {
  const projectData = [
    {
      name: 'LifeOS Development',
      description: 'Personal life management system',
      status: 'ONGOING',
      category: 'PERSONAL',
      startDate: new Date(2023, 0, 1), // Jan 1, 2023
      dueDate: new Date(2023, 2, 31), // Mar 31, 2023
      progress: 35,
      notes: 'Building a comprehensive life management system',
      userId
    },
    {
      name: 'Web Development Course',
      description: 'Learning modern web development',
      status: 'ONGOING',
      category: 'ACADEMIC',
      startDate: new Date(2023, 1, 1), // Feb 1, 2023
      dueDate: new Date(2023, 5, 30), // Jun 30, 2023
      progress: 50,
      notes: 'Focusing on React, Node.js, and modern practices',
      userId
    },
    {
      name: 'Home Renovation',
      description: 'Renovating the kitchen and bathroom',
      status: 'UPCOMING',
      category: 'PERSONAL',
      startDate: new Date(2023, 4, 1), // May 1, 2023
      dueDate: new Date(2023, 6, 31), // Jul 31, 2023
      progress: 0,
      notes: 'Planning phase - gathering ideas and contractors',
      userId
    },
    {
      name: 'Fitness Challenge',
      description: '12-week fitness program',
      status: 'COMPLETED',
      category: 'PERSONAL',
      startDate: new Date(2022, 9, 1), // Oct 1, 2022
      dueDate: new Date(2022, 11, 31), // Dec 31, 2022
      progress: 100,
      notes: 'Successfully completed the 12-week program',
      userId
    }
  ];
  
  const projects = [];
  
  for (const project of projectData) {
    const createdProject = await prisma.project.create({
      data: project
    });
    
    projects.push(createdProject);
  }
  
  return projects;
}

async function createMilestones(projects) {
  const milestones = [];
  
  // Milestones for LifeOS Development
  const lifeOsMilestones = [
    {
      name: 'Design Phase',
      description: 'Design database schema and wireframes',
      startDate: new Date(2023, 0, 1), // Jan 1, 2023
      dueDate: new Date(2023, 0, 15), // Jan 15, 2023
      completed: true,
      projectId: projects[0].id
    },
    {
      name: 'Backend Development',
      description: 'Implement backend API and services',
      startDate: new Date(2023, 0, 16), // Jan 16, 2023
      dueDate: new Date(2023, 1, 28), // Feb 28, 2023
      completed: false,
      projectId: projects[0].id
    },
    {
      name: 'Frontend Development',
      description: 'Implement frontend UI and components',
      startDate: new Date(2023, 1, 16), // Feb 16, 2023
      dueDate: new Date(2023, 2, 31), // Mar 31, 2023
      completed: false,
      projectId: projects[0].id
    }
  ];
  
  // Milestones for Web Development Course
  const coursesMilestones = [
    {
      name: 'HTML & CSS Fundamentals',
      description: 'Master the basics of web layout',
      startDate: new Date(2023, 1, 1), // Feb 1, 2023
      dueDate: new Date(2023, 1, 15), // Feb 15, 2023
      completed: true,
      projectId: projects[1].id
    },
    {
      name: 'JavaScript & React',
      description: 'Learn modern JavaScript and React',
      startDate: new Date(2023, 1, 16), // Feb 16, 2023
      dueDate: new Date(2023, 3, 15), // Apr 15, 2023
      completed: true,
      projectId: projects[1].id
    },
    {
      name: 'Backend & API Development',
      description: 'Build backends with Node.js and Express',
      startDate: new Date(2023, 3, 16), // Apr 16, 2023
      dueDate: new Date(2023, 5, 30), // Jun 30, 2023
      completed: false,
      projectId: projects[1].id
    }
  ];
  
  // Create all milestones
  for (const milestone of [...lifeOsMilestones, ...coursesMilestones]) {
    const createdMilestone = await prisma.milestone.create({
      data: milestone
    });
    
    milestones.push(createdMilestone);
  }
  
  return milestones;
}

async function createTasks(projects, milestones, userId) {
  // Tasks for LifeOS Development - Design Phase
  const designPhaseTasks = [
    {
      title: 'Create database schema',
      description: 'Design the PostgreSQL schema with Prisma',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: new Date(2023, 0, 5), // Jan 5, 2023
      projectId: projects[0].id,
      milestoneId: milestones[0].id,
      userId
    },
    {
      title: 'Design wireframes',
      description: 'Create wireframes for key pages',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      dueDate: new Date(2023, 0, 10), // Jan 10, 2023
      projectId: projects[0].id,
      milestoneId: milestones[0].id,
      userId
    },
    {
      title: 'Create technical architecture',
      description: 'Define the technical stack and architecture',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: new Date(2023, 0, 15), // Jan 15, 2023
      projectId: projects[0].id,
      milestoneId: milestones[0].id,
      userId
    }
  ];
  
  // Tasks for LifeOS Development - Backend Development
  const backendTasks = [
    {
      title: 'Set up project structure',
      description: 'Initialize Node.js project with TypeScript',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      dueDate: new Date(2023, 0, 20), // Jan 20, 2023
      projectId: projects[0].id,
      milestoneId: milestones[1].id,
      userId
    },
    {
      title: 'Implement authentication',
      description: 'Create JWT authentication system',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date(2023, 1, 5), // Feb 5, 2023
      projectId: projects[0].id,
      milestoneId: milestones[1].id,
      userId
    },
    {
      title: 'Create project API',
      description: 'Implement CRUD operations for projects',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(2023, 1, 15), // Feb 15, 2023
      projectId: projects[0].id,
      milestoneId: milestones[1].id,
      userId
    },
    {
      title: 'Create task API',
      description: 'Implement CRUD operations for tasks',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(2023, 1, 25), // Feb 25, 2023
      projectId: projects[0].id,
      milestoneId: milestones[1].id,
      userId
    }
  ];
  
  // Tasks for Web Development Course - HTML & CSS Fundamentals
  const htmlCssTasks = [
    {
      title: 'Complete HTML basics',
      description: 'Learn basic HTML elements and structure',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: new Date(2023, 1, 7), // Feb 7, 2023
      projectId: projects[1].id,
      milestoneId: milestones[3].id,
      userId
    },
    {
      title: 'Master CSS layouts',
      description: 'Learn flexbox and grid layouts',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      dueDate: new Date(2023, 1, 15), // Feb 15, 2023
      projectId: projects[1].id,
      milestoneId: milestones[3].id,
      userId
    }
  ];
  
  // Create all tasks
  for (const task of [...designPhaseTasks, ...backendTasks, ...htmlCssTasks]) {
    await prisma.task.create({
      data: task
    });
  }
  
  // Create subtasks for "Implement authentication"
  const authTask = await prisma.task.findFirst({
    where: {
      title: 'Implement authentication',
      projectId: projects[0].id
    }
  });
  
  if (authTask) {
    const subtasks = [
      {
        title: 'Set up JWT middleware',
        description: 'Create middleware to validate JWT tokens',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId: projects[0].id,
        milestoneId: milestones[1].id,
        parentTaskId: authTask.id,
        isSubtask: true,
        userId
      },
      {
        title: 'Implement login endpoint',
        description: 'Create API endpoint for user login',
        status: 'TODO',
        priority: 'HIGH',
        projectId: projects[0].id,
        milestoneId: milestones[1].id,
        parentTaskId: authTask.id,
        isSubtask: true,
        userId
      },
      {
        title: 'Implement registration endpoint',
        description: 'Create API endpoint for user registration',
        status: 'TODO',
        priority: 'HIGH',
        projectId: projects[0].id,
        milestoneId: milestones[1].id,
        parentTaskId: authTask.id,
        isSubtask: true,
        userId
      }
    ];
    
    for (const subtask of subtasks) {
      await prisma.task.create({
        data: subtask
      });
    }
  }
}

async function createResources(projects) {
  const resources = [
    {
      name: 'Database Schema Diagram',
      type: 'LINK',
      url: 'https://dbdiagram.io/d/lifeOS-schema',
      description: 'Visual representation of database schema',
      projectId: projects[0].id
    },
    {
      name: 'Wireframes',
      type: 'LINK',
      url: 'https://figma.com/file/lifeOS-wireframes',
      description: 'UI wireframes for LifeOS',
      projectId: projects[0].id
    },
    {
      name: 'React Documentation',
      type: 'LINK',
      url: 'https://reactjs.org/docs',
      description: 'Official React documentation',
      projectId: projects[1].id
    },
    {
      name: 'Node.js Best Practices',
      type: 'LINK',
      url: 'https://github.com/goldbergyoni/nodebestpractices',
      description: 'Comprehensive Node.js best practices',
      projectId: projects[1].id
    },
    {
      name: 'Project Requirements',
      type: 'NOTE',
      content: 'The system should include project management, habit tracking, and goal setting features with powerful visualization capabilities.',
      description: 'Key requirements for LifeOS',
      projectId: projects[0].id
    }
  ];
  
  for (const resource of resources) {
    await prisma.resource.create({
      data: resource
    });
  }
}

async function createHabits(userId) {
  const habits = [
    {
      name: 'Daily Meditation',
      description: '15 minutes of mindfulness meditation',
      frequency: 'DAILY',
      timeOfDay: 'MORNING',
      targetDaysPerWeek: 7,
      active: true,
      userId
    },
    {
      name: 'Exercise',
      description: '30 minutes of physical activity',
      frequency: 'DAILY',
      timeOfDay: 'EVENING',
      targetDaysPerWeek: 5,
      active: true,
      userId
    },
    {
      name: 'Read',
      description: 'Read a book for 30 minutes',
      frequency: 'DAILY',
      timeOfDay: 'EVENING',
      targetDaysPerWeek: 7,
      active: true,
      userId
    },
    {
      name: 'Weekly Review',
      description: 'Review goals and projects',
      frequency: 'WEEKLY',
      timeOfDay: 'EVENING',
      targetDaysPerWeek: 1,
      active: true,
      userId
    }
  ];
  
  for (const habit of habits) {
    const createdHabit = await prisma.habit.create({
      data: habit
    });
    
    // Create habit completion history
    await createHabitHistory(createdHabit.id);
  }
}

async function createHabitHistory(habitId) {
  // Create 30 days of history
  const today = new Date();
  const completions = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Randomize completion with 80% success rate
    // For a nice streak pattern, complete most recent days
    const completed = i < 10 ? true : Math.random() < 0.8;
    
    completions.push({
      habitId,
      date,
      completed,
      notes: completed ? 'Completed successfully' : 'Missed today'
    });
  }
  
  for (const completion of completions) {
    await prisma.habitCompletion.create({
      data: completion
    });
  }
}

async function createHealthMetrics(userId) {
  const today = new Date();
  const metrics = [];
  
  // Create 30 days of weight data with slight downward trend
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Start at 75kg and decrease slightly with some randomness
    const weight = 75 - (i * 0.05) + (Math.random() * 0.4 - 0.2);
    
    metrics.push({
      type: 'WEIGHT',
      value: weight,
      unit: 'kg',
      date,
      userId
    });
  }
  
  // Create 30 days of sleep data with variation
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Sleep between 6-8 hours with some randomness
    const sleep = 7 + (Math.random() * 2 - 1);
    
    metrics.push({
      type: 'SLEEP',
      value: sleep,
      unit: 'hours',
      date,
      userId
    });
  }
  
  // Create 30 days of mood data with upward trend
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Mood from 1-10, trending upward
    const mood = 5 + (i * 0.1) + (Math.random() * 2 - 1);
    
    metrics.push({
      type: 'MOOD',
      value: Math.min(Math.max(mood, 1), 10), // Clamp between 1-10
      unit: 'rating',
      date,
      userId
    });
  }
  
  for (const metric of metrics) {
    await prisma.healthMetric.create({
      data: metric
    });
  }
}

async function createGoals(userId) {
  const goals = [
    {
      title: 'Learn React Native',
      description: 'Master React Native for mobile development',
      category: 'PROFESSIONAL',
      targetDate: new Date(2023, 5, 30), // Jun 30, 2023
      progress: 35,
      status: 'ACTIVE',
      userId
    },
    {
      title: 'Run a Marathon',
      description: 'Train for and complete a full marathon',
      category: 'HEALTH',
      targetDate: new Date(2023, 9, 15), // Oct 15, 2023
      progress: 20,
      status: 'ACTIVE',
      userId
    },
    {
      title: 'Read 24 Books',
      description: 'Read 24 books (2 per month) this year',
      category: 'PERSONAL',
      targetDate: new Date(2023, 11, 31), // Dec 31, 2023
      progress: 25,
      status: 'ACTIVE',
      userId
    }
  ];
  
  for (const goal of goals) {
    const createdGoal = await prisma.goal.create({
      data: goal
    });
    
    // Create subgoals
    await createSubgoals(createdGoal);
  }
}

async function createSubgoals(goal) {
  let subgoals = [];
  
  if (goal.title === 'Learn React Native') {
    subgoals = [
      {
        title: 'Complete React Native fundamentals course',
        targetDate: new Date(2023, 2, 31), // Mar 31, 2023
        progress: 100,
        completed: true,
        goalId: goal.id
      },
      {
        title: 'Build a simple todo app',
        targetDate: new Date(2023, 3, 30), // Apr 30, 2023
        progress: 75,
        completed: false,
        goalId: goal.id
      },
      {
        title: 'Learn navigation and state management',
        targetDate: new Date(2023, 4, 31), // May 31, 2023
        progress: 0,
        completed: false,
        goalId: goal.id
      },
      {
        title: 'Build a complex app with API integration',
        targetDate: new Date(2023, 5, 30), // Jun 30, 2023
        progress: 0,
        completed: false,
        goalId: goal.id
      }
    ];
  } else if (goal.title === 'Run a Marathon') {
    subgoals = [
      {
        title: 'Run 5km without stopping',
        targetDate: new Date(2023, 4, 15), // May 15, 2023
        progress: 80,
        completed: false,
        goalId: goal.id
      },
      {
        title: 'Run 10km without stopping',
        targetDate: new Date(2023, 6, 15), // Jul 15, 2023
        progress: 0,
        completed: false,
        goalId: goal.id
      },
      {
        title: 'Complete a half marathon',
        targetDate: new Date(2023, 8, 15), // Sep 15, 2023
        progress: 0,
        completed: false,
        goalId: goal.id
      }
    ];
  } else if (goal.title === 'Read 24 Books') {
    subgoals = [
      {
        title: 'Read 6 books in Q1',
        targetDate: new Date(2023, 2, 31), // Mar 31, 2023
        progress: 100,
        completed: true,
        goalId: goal.id
      },
      {
        title: 'Read 6 books in Q2',
        targetDate: new Date(2023, 5, 30), // Jun 30, 2023
        progress: 33,
        completed: false,
        goalId: goal.id
      },
      {
        title: 'Read 6 books in Q3',
        targetDate: new Date(2023, 8, 30), // Sep 30, 2023
        progress: 0,
        completed: false,
        goalId: goal.id
      },
      {
        title: 'Read 6 books in Q4',
        targetDate: new Date(2023, 11, 31), // Dec 31, 2023
        progress: 0,
        completed: false,
        goalId: goal.id
      }
    ];
  }
  
  for (const subgoal of subgoals) {
    await prisma.subgoal.create({
      data: subgoal
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Running Seeds

#### Development Environment

```bash
# Run seed script
npx prisma db seed
```

#### Test Environment

```bash
# Use specific test seed
NODE_ENV=test npx prisma db seed
```

## Initial Migration Plan

The initial migration will create all necessary tables based on the Prisma schema. Here's the plan for executing this migration:

1. **Prepare Schema**
   - Verify all entity relationships
   - Check index definitions
   - Validate enum types

2. **Generate Migration**
   ```bash
   npx prisma migrate dev --name initial_schema
   ```

3. **Review SQL**
   - Examine generated SQL in `prisma/migrations/YYYYMMDD_initial_schema/migration.sql`
   - Verify table creation order
   - Check constraint definitions

4. **Apply Migration**
   ```bash
   # In development, already applied by migrate dev
   # In other environments:
   npx prisma migrate deploy
   ```

5. **Verify Database State**
   ```bash
   npx prisma db pull
   # Compare pulled schema with intended schema
   ```

## Database Backup Strategy

### Development Backups

1. **Manual Backups**
   ```bash
   pg_dump -U username -d database > backup_$(date +%Y%m%d).sql
   ```

2. **Before Migrations**
   ```bash
   # Script to automatically backup before migrations
   pg_dump -U username -d database > pre_migration_$(date +%Y%m%d).sql
   ```

### Production Backups

1. **Automated Daily Backups**
   - Set up cron job or use cloud provider's backup service
   - Retain backups for 30 days

2. **Pre-Migration Backups**
   - Create snapshot before applying any migration
   - Keep migration-specific backups for 90 days

3. **Backup Testing**
   - Regularly test restoration process
   - Verify data integrity after restoration

## Data Archiving Strategy

As the application accumulates data over time, an archiving strategy will be implemented:

1. **Completed Projects**
   - Archive projects marked as completed after 1 year
   - Move to archive tables with same structure

2. **Old Health Metrics**
   - Aggregate daily metrics to weekly/monthly after 1 year
   - Store detailed data for 1 year, aggregated data indefinitely

3. **Habit History**
   - Keep detailed habit completion data for 1 year
   - Aggregate to monthly statistics after 1 year

## Migration Monitoring

For each migration, especially in production:

1. **Performance Monitoring**
   - Track migration execution time
   - Monitor database performance during migration

2. **Error Handling**
   - Log all migration errors
   - Have rollback plan ready

3. **Data Validation**
   - Run validation queries after migration
   - Verify data integrity and relationships

## Conclusion

This migration and seeding plan provides a structured approach to managing the LifeOS database schema evolution and data population. By following these practices, we ensure:

1. **Consistency**: Schema changes are applied consistently across environments
2. **Reliability**: Migrations are tested and verified before production deployment
3. **Data Integrity**: Backup and validation strategies protect against data loss
4. **Development Efficiency**: Seed data enables realistic testing and development

The plan will evolve as the application grows, with additional migration patterns and seed data added to support new features and use cases.
