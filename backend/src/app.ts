import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'soizi-api',
  });
});

app.use(errorHandler);

export { app };
