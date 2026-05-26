import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', authMiddleware, authController.me);

export { router as authRoutes };
