import { Request, Response } from 'express';
import { TaskService, CreateTaskDto, UpdateTaskDto } from '../services/task.service';

const taskService = new TaskService();

// Create a new task
export const createTask = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    const taskData: CreateTaskDto = req.body;
    
    const task = await taskService.createTask(userId, taskData);
    
    return res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error creating task',
    });
  }
};

// Get all tasks for the authenticated user
export const getAllTasks = async (req: Request, res: Response) => {
  try {
    // Get user ID from auth middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    const tasks = await taskService.getAllTasks(userId);
    
    return res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving tasks',
    });
  }
};

// Get tasks by project
export const getTasksByProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const projectId = parseInt(req.params.projectId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }
    
    const tasks = await taskService.getTasksByProject(projectId, userId);
    
    return res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Get project tasks error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving project tasks',
    });
  }
};

// Get subtasks
export const getSubtasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const taskId = parseInt(req.params.taskId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
      });
    }
    
    const subtasks = await taskService.getSubtasks(taskId, userId);
    
    return res.json({
      success: true,
      data: subtasks,
    });
  } catch (error) {
    console.error('Get subtasks error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving subtasks',
    });
  }
};

// Get a task by ID
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const taskId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
      });
    }
    
    const task = await taskService.getTaskById(taskId, userId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }
    
    return res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Get task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving task',
    });
  }
};

// Update a task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const taskId = parseInt(req.params.id);
    const taskData: UpdateTaskDto = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
      });
    }
    
    const updatedTask = await taskService.updateTask(taskId, userId, taskData);
    
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }
    
    return res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error updating task',
    });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const taskId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
      });
    }
    
    const success = await taskService.deleteTask(taskId, userId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }
    
    return res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error deleting task',
    });
  }
};

// Complete a task
export const completeTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const taskId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
      });
    }
    
    const completedTask = await taskService.completeTask(taskId, userId);
    
    if (!completedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }
    
    return res.json({
      success: true,
      data: completedTask,
      message: 'Task completed successfully',
    });
  } catch (error) {
    console.error('Complete task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error completing task',
    });
  }
};

// Update task progress
export const updateTaskProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const taskId = parseInt(req.params.id);
    const { progress } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }
    
    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
      });
    }
    
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        error: 'Progress must be a number between 0 and 100',
      });
    }
    
    const updatedTask = await taskService.updateTask(taskId, userId, { progress });
    
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }
    
    return res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error('Update task progress error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error updating task progress',
    });
  }
};
