import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStatistics
} from '../controllers/project.controller';
import { validate, createProjectSchema, updateProjectSchema } from '../utils/validation';

const router = Router();

// Apply auth middleware to all routes
router.use(protect as any);

// Project routes
router.post('/', validate(createProjectSchema) as any, createProject as any);
router.get('/', getAllProjects as any);
router.get('/:id', getProjectById as any);
router.put('/:id', validate(updateProjectSchema) as any, updateProject as any);
router.delete('/:id', deleteProject as any);
router.get('/:id/statistics', getProjectStatistics as any);

export default router;
