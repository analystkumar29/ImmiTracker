import express from 'express';
import {
  createApplication,
  getApplications,
  getApplication,
  updateApplication,
  updateApplicationStatus,
  deleteAllApplications,
} from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Application routes - all protected
router.post('/', authenticate, createApplication);
router.get('/', authenticate, getApplications);
router.get('/:id', authenticate, getApplication);
router.put('/:id', authenticate, updateApplication);
router.post('/:id/status', authenticate, updateApplicationStatus);
router.delete('/clear-all', authenticate, authorize(['ADMIN']), deleteAllApplications);

export default router; 