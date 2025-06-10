import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during validation',
    });
  }
};

// Project Schemas
export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['ONGOING', 'COMPLETED', 'ARCHIVED', 'UPCOMING']).optional(),
  category: z.enum(['HACKATHON', 'PERSONAL', 'ACADEMIC', 'FREELANCE', 'OTHER']).optional(),
  startDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  deadline: z.string().optional().transform(str => str ? new Date(str) : undefined),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['ONGOING', 'COMPLETED', 'ARCHIVED', 'UPCOMING']).optional(),
  category: z.enum(['HACKATHON', 'PERSONAL', 'ACADEMIC', 'FREELANCE', 'OTHER']).optional(),
  startDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  deadline: z.string().optional().transform(str => str ? new Date(str) : undefined),
  progress: z.number().min(0).max(100).optional(),
});

// Task Schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'WAITING', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  estimatedHours: z.number().optional(),
  projectId: z.number().optional(),
  parentTaskId: z.number().optional(),
  milestoneId: z.number().optional(),
  isSubtask: z.boolean().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'WAITING', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  progress: z.number().min(0).max(100).optional(),
  projectId: z.number().optional(),
  parentTaskId: z.number().optional(),
  milestoneId: z.number().optional(),
});

export const updateTaskProgressSchema = z.object({
  progress: z.number().min(0).max(100),
});

// Milestone Schemas
export const createMilestoneSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  projectId: z.number(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  dueDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  completedAt: z.string().optional().transform(str => str ? new Date(str) : null),
  progress: z.number().min(0).max(100).optional(),
});
