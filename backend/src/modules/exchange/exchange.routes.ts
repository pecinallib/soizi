import { Router } from 'express';
import { ExchangeController } from './exchange.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const exchangeController = new ExchangeController();

router.get('/preview', exchangeController.getPreview);
router.get('/currencies', authMiddleware, exchangeController.getSupportedCurrencies);
router.get('/rates/:base', authMiddleware, exchangeController.getRates);
router.post('/convert', authMiddleware, exchangeController.convert);

export { router as exchangeRoutes };
