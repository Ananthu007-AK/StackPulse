import { Router } from 'express';
import {
  handleGetPins,
  handleCreatePin,
  handleUpdatePin,
  handleDeletePin
} from '../controllers/pin.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', handleGetPins);
router.post('/', handleCreatePin);
router.patch('/:id', handleUpdatePin);
router.delete('/:id', handleDeletePin);

export const pinRoutes = router;
