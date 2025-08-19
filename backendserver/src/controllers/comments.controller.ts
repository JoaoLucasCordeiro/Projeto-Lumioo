import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export const createComment = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const { postId } = req.params;
  const { text } = req.body;

  if (!userId) return res.status(403).json({ error: 'User not authenticated.' });
  if (!text) return res.status(400).json({ error: 'Comment text is required.' });

  try {
    const newComment = await prisma.comment.create({
      data: { text, authorId: userId, postId },
    });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Could not create comment.' });
  }
};

export const getCommentsForPost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: { author: { select: { username: true, fullName: true } } }, 
      orderBy: { createdAt: 'asc' },
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch comments.' });
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const { commentId } = req.params;

    if (!userId) return res.status(403).json({ error: 'User not authenticated.' });

    try {
        const comment = await prisma.comment.findUnique({ where: { id: commentId } });

        if (!comment) return res.status(404).json({ error: 'Comment not found.' });
        if (comment.authorId !== userId) return res.status(403).json({ error: 'User not authorized to delete this comment.' });

        await prisma.comment.delete({ where: { id: commentId } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Could not delete comment.' });
    }
};
