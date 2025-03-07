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
  promotePopularMilestones,
  flagMilestoneTemplate,
  unflagMilestoneTemplate,
  processHighlyFlaggedMilestones,
  getAllUniqueMilestoneTemplates,
  getMilestoneTemplatesByCategory,
  normalizeMilestones
} from '../controllers/milestone.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/program/:programType', getMilestones);
router.get('/templates/all/unique', getAllUniqueMilestoneTemplates);
router.get('/templates/:programType', getMilestoneTemplates);
router.get('/templates', getMilestoneTemplates);
router.get('/templates/category', getMilestoneTemplatesByCategory);

// Protected routes (requires login)
router.post('/custom', authenticate, createCustomMilestone);
router.post('/order', authenticate, updateMilestoneOrder);
router.delete('/:id', authenticate, deleteMilestone);
router.post('/templates/:templateId/flag', authenticate, flagMilestoneTemplate);
router.post('/templates/:templateId/unflag', authenticate, unflagMilestoneTemplate);

// Admin routes
router.post('/template/:id/approve', authenticate, authorize(['ADMIN']), approveMilestoneTemplate);
router.post('/initialize', authenticate, authorize(['ADMIN']), initializeDefaultMilestones);
router.get('/duplicates', authenticate, authorize(['ADMIN']), checkDuplicateMilestones);
router.get('/popular', authenticate, authorize(['ADMIN']), getPopularMilestones);
router.post('/promote', authenticate, authorize(['ADMIN']), promotePopularMilestones);
router.post('/process-flagged', authenticate, authorize(['ADMIN']), processHighlyFlaggedMilestones);
router.post('/normalize', authenticate, authorize(['ADMIN']), normalizeMilestones);

export default router; 