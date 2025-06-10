import { PrismaClient, Task, TaskPriority, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Define a Task type with subTasks included
type TaskWithSubTasks = Task & {
  subTasks: Task[];
};

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  estimatedHours?: number;
  projectId?: number;
  parentTaskId?: number;
  milestoneId?: number;
  isSubtask?: boolean;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  projectId?: number;
  parentTaskId?: number;
  milestoneId?: number;
  completedAt?: Date | null;
}

export class TaskService {
  /**
   * Create a new task
   */
  async createTask(userId: number, data: CreateTaskDto): Promise<Task> {
    return prisma.task.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  /**
   * Get all tasks for a user
   */
  async getAllTasks(userId: number): Promise<Task[]> {
    return prisma.task.findMany({
      where: {
        userId,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  /**
   * Get tasks by project
   */
  async getTasksByProject(projectId: number, userId: number): Promise<Task[]> {
    return prisma.task.findMany({
      where: {
        projectId,
        userId,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  /**
   * Get subtasks for a task
   */
  async getSubtasks(taskId: number, userId: number): Promise<Task[]> {
    return prisma.task.findMany({
      where: {
        parentTaskId: taskId,
        userId,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }
  /**
   * Get a task by ID
   */
  async getTaskById(id: number, userId: number): Promise<TaskWithSubTasks | null> {
    return prisma.task.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        subTasks: true,
      },
    }) as Promise<TaskWithSubTasks | null>;
  }

  /**
   * Update a task
   */
  async updateTask(id: number, userId: number, data: UpdateTaskDto): Promise<Task | null> {
    // First check if task exists and belongs to user
    const task = await this.getTaskById(id, userId);
    
    if (!task) {
      return null;
    }
    
    let updateData = { ...data };
    
    // If status is changed to COMPLETED, set completedAt date
    if (data.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    }
    // If status is changed from COMPLETED, clear completedAt date
    else if (data.status && data.status !== 'COMPLETED' && task.status === 'COMPLETED') {
      updateData.completedAt = null;
    }
      const updatedTask = await prisma.task.update({
      where: {
        id,
      },
      data: updateData,
    });
    
    // If this is a parent task, update its progress based on subtasks
    if (task.subTasks && task.subTasks.length > 0) {
      await this.updateTaskProgress(id);
    }
    
    // If this task belongs to a project, update project progress
    if (task.projectId) {
      await this.updateProjectTasksProgress(task.projectId);
    }
    
    return updatedTask;
  }

  /**
   * Delete a task
   */
  async deleteTask(id: number, userId: number): Promise<boolean> {
    // First check if task exists and belongs to user
    const task = await this.getTaskById(id, userId);
    
    if (!task) {
      return false;
    }
    
    await prisma.task.delete({
      where: {
        id,
      },
    });
    
    // If this task belonged to a project, update project progress
    if (task.projectId) {
      await this.updateProjectTasksProgress(task.projectId);
    }
    
    return true;
  }

  /**
   * Complete a task
   */
  async completeTask(id: number, userId: number): Promise<Task | null> {
    return this.updateTask(id, userId, {
      status: 'COMPLETED',
      progress: 100,
      completedAt: new Date(),
    });
  }
  /**
   * Update task progress based on subtasks
   */
  async updateTaskProgress(id: number): Promise<Task | null> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        subTasks: true,
      },
    }) as TaskWithSubTasks | null;

    if (!task) {
      return null;
    }

    // No subtasks, so progress is determined directly
    if (task.subTasks.length === 0) {
      return task;
    }

    // Calculate progress based on subtasks
    const subtaskProgress = task.subTasks.reduce((sum, subtask) => {
      if (subtask.status === 'COMPLETED') {
        return sum + 100;
      } else {
        return sum + subtask.progress;
      }
    }, 0);

    const progress = task.subTasks.length > 0 ? subtaskProgress / task.subTasks.length : 0;
    
    // Update task with calculated progress
    return prisma.task.update({
      where: { id },
      data: { progress },
    });
  }

  /**
   * Update project progress based on tasks
   */
  async updateProjectTasksProgress(projectId: number): Promise<void> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
      },
    });

    if (!project || project.tasks.length === 0) {
      return;
    }

    // Calculate progress based on tasks
    const taskProgress = project.tasks.reduce((sum, task) => {
      if (task.status === 'COMPLETED') {
        return sum + 100;
      } else {
        return sum + task.progress;
      }
    }, 0);

    const progress = taskProgress / project.tasks.length;
    
    // Update project with calculated progress
    await prisma.project.update({
      where: { id: projectId },
      data: { progress },
    });
  }
}
