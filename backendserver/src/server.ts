import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';
import likeRoutes from './routes/like.routes';
import savedPostRoutes from './routes/savedPost.routes';
import projectRoutes from './routes/project.routes';
import workRoutes from './routes/work.routes';
import chatRoutes from './routes/chat.routes';
import followRoutes from './routes/follow.routes';
import { initializeSocket } from './socket';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { prisma } from './lib/prisma';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Exiting.');
  process.exit(1);
}
if (!process.env.FRONTEND_URL) {
  console.error('FATAL: FRONTEND_URL is not set. Exiting.');
  process.exit(1);
}

const app = express();
// Atrás do Nginx em produção (ver docs/DEPLOY_VPS.md); sem isso, express-rate-limit e req.ip
// enxergam o IP do proxy reverso, não o do cliente real.
app.set('trust proxy', 1);
const httpServer = http.createServer(app);

// Suporta múltiplas origens separadas por vírgula (ex: "http://localhost:5173,http://localhost:8081")
const allowedOrigins = (process.env.FRONTEND_URL ?? '').split(',').map((o) => o.trim());

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

initializeSocket(io);

const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
  res.send('Lumioo API rodando com sucesso 🚀');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/lumioo', userRoutes);
app.use('/api/v1/lumioo/auth', authRoutes);
app.use('/api/v1/lumioo', postRoutes);
app.use('/api/v1/lumioo', commentRoutes);
app.use('/api/v1/lumioo', likeRoutes);
app.use('/api/v1/lumioo', savedPostRoutes);
app.use('/api/v1/lumioo', projectRoutes);
app.use('/api/v1/lumioo', workRoutes);
app.use('/api/v1/lumioo', chatRoutes);
app.use('/api/v1/lumioo', followRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
