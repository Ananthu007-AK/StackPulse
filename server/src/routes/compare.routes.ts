import { Router } from 'express';
import { handleCompare } from '../controllers/compare.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, handleCompare);

export const compareRoutes = router;
