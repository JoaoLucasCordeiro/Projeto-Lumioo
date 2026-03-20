import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const toggleSavePost = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { postId } = req.params;

    if (!userId) return res.status(403).json({ error: 'User not authenticated.' });

    try {
        const existingSave = await prisma.savedPost.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (existingSave) {
            await prisma.savedPost.delete({ where: { userId_postId: { userId, postId } } });
            res.status(200).json({ message: 'Post unsaved successfully.' });
        } else {
            await prisma.savedPost.create({
                data: { userId, postId },
            });
            res.status(201).json({ message: 'Post saved successfully.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not process save action.' });
    }
};