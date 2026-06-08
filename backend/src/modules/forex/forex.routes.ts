import { Router } from 'express';
import { ForexController } from './forex.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const forexController = new ForexController();

router.get('/holdings', authMiddleware, forexController.getHoldings);
router.get('/transactions', authMiddleware, forexController.getTransactions);
router.post('/buy', authMiddleware, forexController.buy);
router.post('/sell', authMiddleware, forexController.sell);

export { router as forexRoutes };
