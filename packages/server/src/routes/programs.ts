import express from 'express';
import { immigrationPrograms } from '../data/immigrationPrograms';

const router = express.Router();

// Get all immigration programs
router.get('/', (req, res) => {
  res.json(immigrationPrograms);
});

// Get a specific program by ID
router.get('/:id', (req, res) => {
  const program = immigrationPrograms.find(p => p.id === req.params.id);
  if (!program) {
    return res.status(404).json({ message: 'Program not found' });
  }
  res.json(program);
});

export default router; 