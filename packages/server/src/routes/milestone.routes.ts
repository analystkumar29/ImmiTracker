import express from 'express';
import {
  getMilestones,
  getMilestoneTemplates,
  createCustomMilestone,
  updateMilestoneOrder,
  deleteMilestone,
  approveMilestoneTemplate,
  initializeDefaultMilestones,
} from '../controllers/milestone.controller';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// Public routes
router.get('/program/:programType', getMilestones);
router.get('/program/:programType/subtype/:subType', getMilestones);
router.get('/templates/program/:programType', getMilestoneTemplates);
router.get('/templates/program/:programType/subtype/:subType', getMilestoneTemplates);

// Protected routes (require authentication)
router.post('/', protect, createCustomMilestone);
router.put('/:milestoneId/order', protect, updateMilestoneOrder);
router.delete('/:milestoneId', protect, deleteMilestone);

// Admin-only routes
router.post('/templates/:templateId/approve', protect, isAdmin, approveMilestoneTemplate);
router.post('/initialize', protect, isAdmin, initializeDefaultMilestones);

export default router; 