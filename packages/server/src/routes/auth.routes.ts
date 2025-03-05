import express from 'express';
import { register, login, updateProfile } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.put('/profile', protect, updateProfile);

export default router; 