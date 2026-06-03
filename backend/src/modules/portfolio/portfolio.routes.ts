import { Router } from 'express';
import { PortfolioController } from './portfolio.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const portfolioController = new PortfolioController();

router.get('/', authMiddleware, portfolioController.getPortfolio);
router.get('/transactions', authMiddleware, portfolioController.getTransactions);
router.post('/buy', authMiddleware, portfolioController.buy);
router.post('/sell', authMiddleware, portfolioController.sell);

export { router as portfolioRoutes };
