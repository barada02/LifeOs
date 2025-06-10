import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  createTask,
  getAllTasks,
  getTasksByProject,
  getSubtasks,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
  updateTaskProgress
} from '../controllers/task.controller';
import { validate, createTaskSchema, updateTaskSchema, updateTaskProgressSchema } from '../utils/validation';

const router = Router();

// Apply auth middleware to all routes
router.use(protect as any);

// Task routes
router.post('/', validate(createTaskSchema) as any, createTask as any);
router.get('/', getAllTasks as any);
router.get('/project/:projectId', getTasksByProject as any);
router.get('/:id', getTaskById as any);
router.get('/:taskId/subtasks', getSubtasks as any);
router.put('/:id', validate(updateTaskSchema) as any, updateTask as any);
router.delete('/:id', deleteTask as any);
router.post('/:id/complete', completeTask as any);
router.put('/:id/progress', validate(updateTaskProgressSchema) as any, updateTaskProgress as any);

export default router;
