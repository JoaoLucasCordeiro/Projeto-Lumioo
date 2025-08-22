import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// A interface AuthenticatedRequest foi removida daqui

export const createComment = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { postId } = req.params;
  const { text } = req.body;

  if (!userId) return res.status(403).json({ error: 'User not authenticated.' });
  if (!text) return res.status(400).json({ error: 'Comment text is required.' });

  try {
    const newComment = await prisma.comment.create({
      data: { text, authorId: userId, postId },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    const formattedComment = {
        id: newComment.id,
        text: newComment.text,
        authorId: newComment.authorId,
        username: newComment.author.username,
        userImage: '/default-user.png', // Placeholder
        timePosted: newComment.createdAt.toISOString(),
        likes: 0,
        isLiked: false
    };

    res.status(201).json(formattedComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: 'Could not create comment.' });
  }
};


export const getCommentsForPost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch comments.' });
  }
};


export const updateComment = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { commentId } = req.params;
    const { text } = req.body;

    if (!userId) return res.status(403).json({ error: 'User not authenticated.' });
    if (!text) return res.status(400).json({ error: 'Comment text is required.' });

    try {
        const comment = await prisma.comment.findUnique({ where: { id: commentId } });

        if (!comment) return res.status(404).json({ error: 'Comment not found.' });
        if (comment.authorId !== userId) return res.status(403).json({ error: 'User not authorized to edit this comment.' });

        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { text },
            include: { author: { select: { username: true } } } 
        });

        const formattedComment = {
            id: updatedComment.id,
            text: updatedComment.text,
            authorId: updatedComment.authorId,
            username: updatedComment.author.username,
            userImage: '/default-user.png',
            timePosted: updatedComment.createdAt.toISOString(),
            likes: 0, 
            isLiked: false
        };

        res.status(200).json(formattedComment);
    } catch (error) {
        res.status(500).json({ error: 'Could not update comment.' });
    }
};


export const deleteComment = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { commentId } = req.params;

    if (!userId) return res.status(403).json({ error: 'User not authenticated.' });

    try {
        const comment = await prisma.comment.findUnique({ where: { id: commentId } });

        if (!comment) return res.status(404).json({ error: 'Comment not found.' });
        if (comment.authorId !== userId) return res.status(403).json({ error: 'User not authorized to delete this comment.' });
        
        await prisma.like.deleteMany({
            where: { commentId: commentId }
        });

        await prisma.comment.delete({ where: { id: commentId } });
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: 'Could not delete comment.' });
    }
};