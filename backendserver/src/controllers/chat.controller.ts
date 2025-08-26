import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findOrCreateConversation = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { recipientId } = req.body;

  if (!userId || !recipientId) {
    return res.status(400).json({ error: 'Recipient ID is required.' });
  }

  if (userId === recipientId) {
    return res.status(400).json({ error: 'Cannot start a conversation with yourself.' });
  }

  try {
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: userId } } },
          { participants: { some: { id: recipientId } } },
        ],
      },
      include: {
        participants: {
          where: { NOT: { id: userId } },
          select: { id: true, username: true, avatar: true, fullName: true },
        },
      },
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: userId }, { id: recipientId }],
        },
      },
      include: {
        participants: {
          where: { NOT: { id: userId } },
          select: { id: true, username: true, avatar: true, fullName: true },
        },
      },
    });

    res.status(201).json(newConversation);
  } catch (error) {
    console.error("Error finding/creating conversation:", error);
    res.status(500).json({ error: 'Could not process conversation.' });
  }
};

export const getUserConversations = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(403).json({ error: 'User not authenticated.' });

  try {
    const conversations = await prisma.conversation.findMany({
      where: { 
        participants: { 
          some: { id: userId } 
        } 
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: {
          where: { NOT: { id: userId } },
          select: { id: true, username: true, avatar: true, fullName: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const uniqueConversations = conversations.reduce((acc, conversation) => {
      if (conversation.participants.length === 0) return acc;
      
      const participantId = conversation.participants[0].id;
      
      const existingConversation = acc.find(conv => 
        conv.participants.length > 0 && conv.participants[0].id === participantId
      );
      
      if (!existingConversation) {
        acc.push(conversation);
      } else if (new Date(conversation.updatedAt) > new Date(existingConversation.updatedAt)) {
        const index = acc.indexOf(existingConversation);
        acc[index] = conversation;
      }
      
      return acc;
    }, [] as typeof conversations);

    const conversationsWithCount = uniqueConversations.map(conv => ({
      ...conv,
      _count: {
        messages: 0
      }
    }));
    
    res.status(200).json(conversationsWithCount);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: 'Could not fetch conversations.' });
  }
};


export const getConversationById = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { conversationId } = req.params;

  if (!userId) return res.status(403).json({ error: 'User not authenticated.' });

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          select: { id: true, username: true, avatar: true, fullName: true },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some(p => p.id === userId);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const otherParticipants = conversation.participants.filter(p => p.id !== userId);

    res.status(200).json({
      ...conversation,
      participants: otherParticipants 
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: 'Could not fetch conversation.' });
  }
};

export const getMessagesForConversation = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { conversationId } = req.params;

    if (!userId) return res.status(403).json({ error: 'User not authenticated.' });

    try {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, username: true, avatar: true } }
            }
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: 'Could not fetch messages.' });
    }
};