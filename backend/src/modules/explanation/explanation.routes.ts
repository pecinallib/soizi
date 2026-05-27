import { Router } from 'express';
import { ExplanationController } from './explanation.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const explanationController = new ExplanationController();

router.get('/', explanationController.getAll);
router.get('/categories', explanationController.getCategories);
router.get('/category/:category', explanationController.getByCategory);
router.get('/:key', explanationController.getByKey);

router.post('/', authMiddleware, explanationController.create);
router.put('/:key', authMiddleware, explanationController.update);
router.delete('/:key', authMiddleware, explanationController.delete);

export { router as explanationRoutes };
