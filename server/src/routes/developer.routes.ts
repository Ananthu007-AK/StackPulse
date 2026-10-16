import { Router } from 'express';
import { handleGetDeveloperProfile, handleGetDeveloperRepos } from '../controllers/developer.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Developer routes are protected
router.get('/:username', authenticate, handleGetDeveloperProfile);
router.get('/:username/repos', authenticate, handleGetDeveloperRepos);

export const developerRoutes = router;
