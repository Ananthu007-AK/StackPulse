import { Router } from 'express';
import {
  handleGetSavedComparisons,
  handleSaveComparison,
  handleGetComparisonById,
  handleUpdateComparison,
  handleDeleteComparison
} from '../controllers/comparison.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', handleGetSavedComparisons);
router.post('/', handleSaveComparison);
router.get('/:id', handleGetComparisonById);
router.patch('/:id', handleUpdateComparison);
router.delete('/:id', handleDeleteComparison);

export const comparisonRoutes = router;
