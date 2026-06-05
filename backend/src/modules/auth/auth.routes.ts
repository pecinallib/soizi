import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  checkEmailLimiter,
} from '../../middlewares/rate-limit.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', registerLimiter, (req, res, next) => authController.register(req, res, next));
router.post('/login', loginLimiter, (req, res, next) => authController.login(req, res, next));
router.post('/refresh', refreshLimiter, (req, res, next) => authController.refresh(req, res, next));
router.post('/check-email', checkEmailLimiter, (req, res, next) => authController.checkEmail(req, res, next));
router.get('/me', authMiddleware, (req, res, next) => authController.me(req, res, next));

export { router as authRoutes };
