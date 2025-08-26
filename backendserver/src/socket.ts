// src/socket.ts
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export function initializeSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Usuário conectado: ${socket.id}`);
    
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log("Conexão sem token, desconectando.");
      socket.disconnect();
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err) {
      console.log("Token inválido, desconectando.");
      socket.disconnect();
      return;
    }
    
    const userId = decoded.userId;

    socket.on('joinConversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`Usuário ${userId} entrou na sala ${conversationId}`);
    });

    socket.on('sendMessage', async (data: { conversationId: string; text: string }) => {
      try {
        const newMessage = await prisma.message.create({
          data: {
            text: data.text,
            senderId: userId,
            conversationId: data.conversationId,
          },
          include: {
            sender: { select: { id: true, username: true, avatar: true } }
          }
        });
        
        io.to(data.conversationId).emit('receiveMessage', newMessage);
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Usuário desconectado: ${socket.id}`);
    });
  });
}