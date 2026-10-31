import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import chatRoutes from './modules/chat/chat.routes';
import commentRoutes from './modules/comments/comments.routes';
import followRoutes from './modules/follows/follows.routes';
import postRoutes from './modules/posts/posts.routes';
import projectRoutes from './modules/projects/projects.routes';
import userRoutes from './modules/users/users.routes';
import workRoutes from './modules/works/works.routes';
import { errorHandler } from './shared/middlewares/errorHandler.middleware';

const API_PREFIX = '/api/v1/lumioo';

/** Monta a aplicação Express (sem abrir porta), o que também facilita testá-la com supertest. */
export function createApp() {
  const app = express();

  // Atrás do Nginx em produção (ver docs/DEPLOY_VPS.md); sem isso, express-rate-limit e req.ip
  // enxergam o IP do proxy reverso, não o do cliente real.
  app.set('trust proxy', 1);

  app.use(cors({ origin: env.allowedOrigins, optionsSuccessStatus: 200 }));
  // Imagens e PDFs trafegam em base64 no corpo (não há armazenamento de arquivos)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.get('/', (_req, res) => {
    res.send('Lumioo API rodando com sucesso 🚀');
  });
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(API_PREFIX, userRoutes);
  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(API_PREFIX, postRoutes);
  app.use(API_PREFIX, commentRoutes);
  app.use(API_PREFIX, projectRoutes);
  app.use(API_PREFIX, workRoutes);
  app.use(API_PREFIX, chatRoutes);
  app.use(API_PREFIX, followRoutes);

  app.use(errorHandler);

  return app;
}
