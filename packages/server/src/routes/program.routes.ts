import express from 'express';
import { getAllPrograms, getProgramById, getProgramByTypeAndSubtype } from '../controllers/program.controller';

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllPrograms);
router.get('/find', getProgramByTypeAndSubtype);
router.get('/:id', getProgramById);

export default router; 