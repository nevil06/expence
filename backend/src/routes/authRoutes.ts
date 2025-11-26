import { Router } from 'express';
import { register, login, resetPassword, updatePassword } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/update-password', updatePassword);

export const authRoutes = router;