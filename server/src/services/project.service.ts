import { PrismaClient, Project, ProjectCategory, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateProjectDto {
  title: string;
  description?: string;
  status?: ProjectStatus;
  category?: ProjectCategory;
  startDate?: Date;
  deadline?: Date;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  category?: ProjectCategory;
  startDate?: Date;
  deadline?: Date;
  progress?: number;
}

export class ProjectService {
  /**
   * Create a new project
   */
  async createProject(userId: number, data: CreateProjectDto): Promise<Project> {
    return prisma.project.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  /**
   * Get all projects for a user
   */
  async getAllProjects(userId: number): Promise<Project[]> {
    return prisma.project.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * Get a project by ID
   */
  async getProjectById(id: number, userId: number): Promise<Project | null> {
    return prisma.project.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  /**
   * Update a project
   */
  async updateProject(id: number, userId: number, data: UpdateProjectDto): Promise<Project | null> {
    // First check if project exists and belongs to user
    const project = await this.getProjectById(id, userId);
    
    if (!project) {
      return null;
    }
    
    return prisma.project.update({
      where: {
        id,
      },
      data,
    });
  }

  /**
   * Delete a project
   */
  async deleteProject(id: number, userId: number): Promise<boolean> {
    // First check if project exists and belongs to user
    const project = await this.getProjectById(id, userId);
    
    if (!project) {
      return false;
    }
    
    await prisma.project.delete({
      where: {
        id,
      },
    });
    
    return true;
  }

  /**
   * Calculate project statistics
   */
  async getProjectStatistics(id: number, userId: number): Promise<any> {
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        tasks: true,
        milestones: true,
      },
    });

    if (!project) {
      return null;
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length;
    const inProgressTasks = project.tasks.filter(task => task.status === 'IN_PROGRESS').length;
    const todoTasks = project.tasks.filter(task => task.status === 'TODO').length;
    const waitingTasks = project.tasks.filter(task => task.status === 'WAITING').length;
    
    const taskCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate overall progress based on task and milestone progress
    let progress = taskCompletion;
    
    // If we have milestones, factor them into the progress calculation
    if (project.milestones.length > 0) {
      const milestoneProgress = project.milestones.reduce((sum, milestone) => sum + milestone.progress, 0) / project.milestones.length;
      progress = (taskCompletion + milestoneProgress) / 2;
    }
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      waitingTasks,
      taskCompletionRate: taskCompletion,
      progress,
      milestones: project.milestones.length,
    };
  }

  /**
   * Update project progress
   */
  async updateProjectProgress(id: number): Promise<Project | null> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: true,
        milestones: true,
      },
    });

    if (!project) {
      return null;
    }

    let progress = 0;
    
    // Calculate progress based on tasks
    if (project.tasks.length > 0) {
      const taskProgress = project.tasks.reduce((sum, task) => {
        if (task.status === 'COMPLETED') {
          return sum + 100;
        } else {
          return sum + task.progress;
        }
      }, 0) / project.tasks.length;
      
      progress = taskProgress;
    }
    
    // If milestones exist, factor them into the calculation
    if (project.milestones.length > 0) {
      const milestoneProgress = project.milestones.reduce((sum, milestone) => sum + milestone.progress, 0) / project.milestones.length;
      
      // Weight milestones and tasks equally
      progress = (progress + milestoneProgress) / 2;
    }
    
    // Update the project with the new progress value
    return prisma.project.update({
      where: { id },
      data: { progress },
    });
  }
}
