import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config';
import { authRoutes } from './modules/auth';
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

app.use(errorHandler);

export { app };
