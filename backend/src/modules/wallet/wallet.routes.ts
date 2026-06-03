import { Router } from 'express';
import { WalletController } from './wallet.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const walletController = new WalletController();

router.get('/', authMiddleware, walletController.getWallet);
router.get('/transactions', authMiddleware, walletController.getTransactions);
router.post('/transfer', authMiddleware, walletController.transfer);

export { router as walletRoutes };
