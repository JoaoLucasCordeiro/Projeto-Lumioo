import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const togglePostLike = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { postId } = req.params;

    if (!userId) return res.status(403).json({ error: 'User not authenticated.' });
    if (!postId) return res.status(400).json({ error: 'postId is required.' });

    try {
        const existingLike = await prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (existingLike) {
            await prisma.like.delete({ where: { id: existingLike.id } });
            res.status(200).json({ message: 'Post unliked successfully.' });
        } else {
            await prisma.like.create({
                data: { userId, postId },
            });
            res.status(200).json({ message: 'Post liked successfully.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not process like action.' });
    }
};


export const toggleCommentLike = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { commentId } = req.params;

    if (!userId) return res.status(403).json({ error: 'User not authenticated.' });
    if (!commentId) return res.status(400).json({ error: 'commentId is required.' });

    try {
        const existingLike = await prisma.like.findUnique({
            where: { userId_commentId: { userId, commentId } },
        });

        if (existingLike) {
            await prisma.like.delete({ where: { id: existingLike.id } });
            res.status(200).json({ message: 'Comment unliked successfully.' });
        } else {
            await prisma.like.create({
                data: { userId, commentId },
            });
            res.status(200).json({ message: 'Comment liked successfully.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not process comment like action.' });
    }
};