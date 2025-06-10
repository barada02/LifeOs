import { PrismaClient, Milestone } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateMilestoneDto {
  title: string;
  description?: string;
  dueDate?: Date;
  projectId: number;
}

export interface UpdateMilestoneDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  completedAt?: Date | null;
  progress?: number;
}

export class MilestoneService {
  /**
   * Create a new milestone
   */
  async createMilestone(data: CreateMilestoneDto): Promise<Milestone> {
    return prisma.milestone.create({
      data,
    });
  }

  /**
   * Get all milestones for a project
   */
  async getMilestonesByProject(projectId: number): Promise<Milestone[]> {
    return prisma.milestone.findMany({
      where: {
        projectId,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  /**
   * Get a milestone by ID
   */
  async getMilestoneById(id: number): Promise<Milestone | null> {
    return prisma.milestone.findUnique({
      where: {
        id,
      },
      include: {
        tasks: true,
      },
    });
  }

  /**
   * Update a milestone
   */
  async updateMilestone(id: number, data: UpdateMilestoneDto): Promise<Milestone | null> {
    // First check if milestone exists
    const milestone = await this.getMilestoneById(id);
    
    if (!milestone) {
      return null;
    }
    
    return prisma.milestone.update({
      where: {
        id,
      },
      data,
    });
  }

  /**
   * Delete a milestone
   */
  async deleteMilestone(id: number): Promise<boolean> {
    // First check if milestone exists
    const milestone = await this.getMilestoneById(id);
    
    if (!milestone) {
      return false;
    }
    
    await prisma.milestone.delete({
      where: {
        id,
      },
    });
    
    return true;
  }

  /**
   * Update milestone progress based on associated tasks
   */
  async updateMilestoneProgress(id: number): Promise<Milestone | null> {
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    });

    if (!milestone) {
      return null;
    }

    // No tasks, so progress can't be calculated
    if (milestone.tasks.length === 0) {
      return milestone;
    }

    // Calculate progress based on tasks
    const taskProgress = milestone.tasks.reduce((sum, task) => {
      if (task.status === 'COMPLETED') {
        return sum + 100;
      } else {
        return sum + task.progress;
      }
    }, 0);

    const progress = taskProgress / milestone.tasks.length;
    
    // Update milestone with calculated progress
    return prisma.milestone.update({
      where: { id },
      data: { 
        progress,
        // If all tasks are completed, mark the milestone as completed
        completedAt: progress === 100 ? new Date() : milestone.completedAt
      },
    });
  }
}
