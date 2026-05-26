import { app } from './app';
import { env } from './config';

app.listen(env.PORT, () => {
  console.warn(`🚀 SoIzi API rodando na porta ${env.PORT}`);
  console.warn(`📍 Ambiente: ${env.NODE_ENV}`);
  console.warn(`❤️  Health check: http://localhost:${env.PORT}/health`);
});
