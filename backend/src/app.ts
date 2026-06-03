import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config';
import { authRoutes } from './modules/auth';
import { exchangeRoutes } from './modules/exchange';
import { remittanceRoutes } from './modules/remittance';
import { explanationRoutes } from './modules/explanation';
import { walletRoutes } from './modules/wallet';
import { stockRoutes } from './modules/stock';
import { portfolioRoutes } from './modules/portfolio';
import { errorHandler } from './middlewares';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'soizi-api',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/exchange', exchangeRoutes);
app.use('/api/remittance', remittanceRoutes);
app.use('/api/explanation', explanationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.use(errorHandler);

export { app };
