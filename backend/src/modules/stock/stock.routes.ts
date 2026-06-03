import { Router } from 'express';
import { StockController } from './stock.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const stockController = new StockController();

router.get('/search', authMiddleware, stockController.search);
router.get('/quote/:symbol', authMiddleware, stockController.getQuote);

export { router as stockRoutes };
