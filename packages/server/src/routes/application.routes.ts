import express from 'express';
import {
  createApplication,
  getApplications,
  getApplication,
  updateApplication,
  updateApplicationStatus,
  deleteAllApplications,
} from '../controllers/application.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(protect);

// Application routes
router.post('/', createApplication);
router.get('/', getApplications);
router.get('/:id', getApplication);
router.put('/:id', updateApplication);
router.post('/:id/status', updateApplicationStatus);
router.delete('/clear-all', deleteAllApplications);

export default router; 