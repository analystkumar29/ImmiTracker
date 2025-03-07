import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as applicationTypeController from '../controllers/applicationType.controller';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', applicationTypeController.getAllApplicationTypes);
router.get('/category/:category', applicationTypeController.getApplicationTypesByCategory);

// Protected routes (authentication required)
router.post('/', authenticate, applicationTypeController.createApplicationType);
router.post('/:typeId/flag', authenticate, applicationTypeController.flagApplicationType);
router.post('/:typeId/unflag', authenticate, applicationTypeController.unflagApplicationType);

// Admin routes (admin only)
router.post('/promote', authenticate, authorize(['ADMIN']), applicationTypeController.promotePopularApplicationTypes);
router.post('/process-flagged', authenticate, authorize(['ADMIN']), applicationTypeController.processHighlyFlaggedApplicationTypes);

export default router; 