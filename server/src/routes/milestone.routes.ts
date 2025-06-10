import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  createMilestone,
  getMilestonesByProject,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
  updateMilestoneProgress
} from '../controllers/milestone.controller';
import { validate, createMilestoneSchema, updateMilestoneSchema } from '../utils/validation';

const router = Router();

// Apply auth middleware to all routes
router.use(protect as any);

// Milestone routes
router.post('/', validate(createMilestoneSchema) as any, createMilestone as any);
router.get('/project/:projectId', getMilestonesByProject as any);
router.get('/:id', getMilestoneById as any);
router.put('/:id', validate(updateMilestoneSchema) as any, updateMilestone as any);
router.delete('/:id', deleteMilestone as any);
router.put('/:id/progress', updateMilestoneProgress as any);

export default router;
