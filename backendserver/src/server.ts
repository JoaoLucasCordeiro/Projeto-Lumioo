import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './shared/prisma';
import { initializeSocket } from './socket';

const httpServer = http.createServer(createApp());

const io = new Server(httpServer, {
  cors: { origin: env.allowedOrigins, methods: ['GET', 'POST'] },
});
initializeSocket(io);

httpServer.listen(env.PORT, () => {
  console.log(`Servidor rodando na porta ${env.PORT}`);
});

const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
