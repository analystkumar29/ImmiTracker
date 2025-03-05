import express from 'express';
import {
  getMilestones,
  getMilestoneTemplates,
  createCustomMilestone,
  updateMilestoneOrder,
  deleteMilestone,
  approveMilestoneTemplate,
  initializeDefaultMilestones,
  checkDuplicateMilestones,
  getPopularMilestones,
  promotePopularMilestones
} from '../controllers/milestone.controller';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// Public routes
router.get('/program/:programType', getMilestones);
router.get('/templates/:programType', getMilestoneTemplates);

// Protected routes (requires login)
router.use(protect);
router.post('/custom', createCustomMilestone);
router.post('/order', updateMilestoneOrder);
router.delete('/:id', deleteMilestone);

// Admin routes
router.use(isAdmin);
router.post('/template/:id/approve', approveMilestoneTemplate);
router.post('/initialize', initializeDefaultMilestones);
router.get('/duplicates', checkDuplicateMilestones);
router.get('/popular', getPopularMilestones);
router.post('/promote', promotePopularMilestones);

export default router; 