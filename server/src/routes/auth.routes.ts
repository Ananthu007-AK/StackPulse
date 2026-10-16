import { Router } from 'express';
import { handleRegister, handleLogin, handleMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, handleRegister);
router.post('/login', authRateLimiter, handleLogin);
router.get('/me', authenticate, handleMe);

export const authRoutes = router;
