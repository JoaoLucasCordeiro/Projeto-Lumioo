import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  avatar: true,
  institution: true,
  academicLevel: true,
};

const LIMIT = 20;

export const followUser = async (req: Request, res: Response) => {
  try {
    const followerId = req.user!.userId;
    const { userId: followingId } = req.params;

    if (followerId === followingId) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: followerId, blockedId: followingId },
          { blockerId: followingId, blockedId: followerId },
        ],
      },
    });

    if (block) {
      return res.status(403).json({ error: 'Action not allowed.' });
    }

    await prisma.follow.create({
      data: { followerId, followingId },
    });

    return res.status(201).json({ message: 'User followed successfully.' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'You are already following this user.' });
    }
    if (error.code === 'P2003') {
      return res.status(404).json({ error: 'User not found.' });
    }
    console.error('Error following user:', error);
    return res.status(500).json({ error: 'Could not follow user.' });
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const followerId = req.user!.userId;
    const { userId: followingId } = req.params;

    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });

    return res.status(200).json({ message: 'User unfollowed successfully.' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'You are not following this user.' });
    }
    console.error('Error unfollowing user:', error);
    return res.status(500).json({ error: 'Could not unfollow user.' });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { cursor } = req.query;

    const follows = await prisma.follow.findMany({
      take: LIMIT,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { followerId_followingId: { followerId: cursor as string, followingId: userId } } : undefined,
      where: { followingId: userId },
      orderBy: { createdAt: 'desc' },
      include: { follower: { select: USER_SELECT } },
    });

    const users = follows.map(f => f.follower);
    const nextCursor = follows.length === LIMIT ? follows[follows.length - 1].followerId : null;

    return res.status(200).json({ users, nextCursor });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return res.status(500).json({ error: 'Could not fetch followers.' });
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { cursor } = req.query;

    const follows = await prisma.follow.findMany({
      take: LIMIT,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { followerId_followingId: { followerId: userId, followingId: cursor as string } } : undefined,
      where: { followerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { following: { select: USER_SELECT } },
    });

    const users = follows.map(f => f.following);
    const nextCursor = follows.length === LIMIT ? follows[follows.length - 1].followingId : null;

    return res.status(200).json({ users, nextCursor });
  } catch (error) {
    console.error('Error fetching following:', error);
    return res.status(500).json({ error: 'Could not fetch following.' });
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const blockerId = req.user!.userId;
    const { userId: blockedId } = req.params;

    if (blockerId === blockedId) {
      return res.status(400).json({ error: 'You cannot block yourself.' });
    }

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: blockerId, followingId: blockedId },
            { followerId: blockedId, followingId: blockerId },
          ],
        },
      }),
      prisma.block.create({ data: { blockerId, blockedId } }),
    ]);

    return res.status(201).json({ message: 'User blocked successfully.' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'You have already blocked this user.' });
    }
    if (error.code === 'P2003') {
      return res.status(404).json({ error: 'User not found.' });
    }
    console.error('Error blocking user:', error);
    return res.status(500).json({ error: 'Could not block user.' });
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const blockerId = req.user!.userId;
    const { userId: blockedId } = req.params;

    await prisma.block.delete({
      where: { blockerId_blockedId: { blockerId, blockedId } },
    });

    return res.status(200).json({ message: 'User unblocked successfully.' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'This user is not blocked.' });
    }
    console.error('Error unblocking user:', error);
    return res.status(500).json({ error: 'Could not unblock user.' });
  }
};

export const getBlockedUsers = async (req: Request, res: Response) => {
  try {
    const blockerId = req.user!.userId;
    const { cursor } = req.query;

    const blocks = await prisma.block.findMany({
      take: LIMIT,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { blockerId_blockedId: { blockerId, blockedId: cursor as string } } : undefined,
      where: { blockerId },
      orderBy: { createdAt: 'desc' },
      include: { blocked: { select: USER_SELECT } },
    });

    const users = blocks.map(b => b.blocked);
    const nextCursor = blocks.length === LIMIT ? blocks[blocks.length - 1].blockedId : null;

    return res.status(200).json({ users, nextCursor });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return res.status(500).json({ error: 'Could not fetch blocked users.' });
  }
};
