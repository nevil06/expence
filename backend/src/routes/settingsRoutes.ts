import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getUserSettings, updateUserSettings } from '../controllers/settingsController';

const router = Router();

router.get('/', authenticateToken, getUserSettings);
router.put('/', authenticateToken, updateUserSettings);

export const settingsRoutes = router;