import { Router } from 'express';
import { RemittanceController } from './remittance.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const remittanceController = new RemittanceController();

router.use(authMiddleware);

router.post('/', remittanceController.create);
router.post('/send', remittanceController.sendP2P);
router.get('/', remittanceController.list);
router.get('/:id', remittanceController.getById);
router.patch('/:id/cancel', remittanceController.cancel);

export { router as remittanceRoutes };
