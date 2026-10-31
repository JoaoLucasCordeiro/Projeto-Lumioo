import { badRequest, conflict, forbidden, isPrismaError, notFound } from '../../shared/errors';
import { prisma } from '../../shared/prisma';

const USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  avatar: true,
  institution: true,
  academicLevel: true,
} as const;

const PAGE_SIZE = 20;

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) throw badRequest('You cannot follow yourself.');

  // Bloqueio em qualquer direção impede seguir
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: followerId, blockedId: followingId },
        { blockerId: followingId, blockedId: followerId },
      ],
    },
  });
  if (block) throw forbidden('Action not allowed.');

  try {
    await prisma.follow.create({ data: { followerId, followingId } });
  } catch (err) {
    if (isPrismaError(err, 'P2002')) throw conflict('You are already following this user.');
    if (isPrismaError(err, 'P2003')) throw notFound('User not found.');
    throw err;
  }
  return { message: 'User followed successfully.' };
}

export async function unfollowUser(followerId: string, followingId: string) {
  try {
    await prisma.follow.delete({ where: { followerId_followingId: { followerId, followingId } } });
  } catch (err) {
    if (isPrismaError(err, 'P2025')) throw notFound('You are not following this user.');
    throw err;
  }
  return { message: 'User unfollowed successfully.' };
}

export async function getFollowers(userId: string, cursor?: string) {
  const follows = await prisma.follow.findMany({
    take: PAGE_SIZE,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { followerId_followingId: { followerId: cursor, followingId: userId } } : undefined,
    where: { followingId: userId },
    orderBy: { createdAt: 'desc' },
    include: { follower: { select: USER_SELECT } },
  });

  return {
    users: follows.map((f) => f.follower),
    nextCursor: follows.length === PAGE_SIZE ? follows[follows.length - 1].followerId : null,
  };
}

export async function getFollowing(userId: string, cursor?: string) {
  const follows = await prisma.follow.findMany({
    take: PAGE_SIZE,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { followerId_followingId: { followerId: userId, followingId: cursor } } : undefined,
    where: { followerId: userId },
    orderBy: { createdAt: 'desc' },
    include: { following: { select: USER_SELECT } },
  });

  return {
    users: follows.map((f) => f.following),
    nextCursor: follows.length === PAGE_SIZE ? follows[follows.length - 1].followingId : null,
  };
}

/** Bloquear remove o follow nos dois sentidos. */
export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) throw badRequest('You cannot block yourself.');

  try {
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
  } catch (err) {
    if (isPrismaError(err, 'P2002')) throw conflict('You have already blocked this user.');
    if (isPrismaError(err, 'P2003')) throw notFound('User not found.');
    throw err;
  }
  return { message: 'User blocked successfully.' };
}

export async function unblockUser(blockerId: string, blockedId: string) {
  try {
    await prisma.block.delete({ where: { blockerId_blockedId: { blockerId, blockedId } } });
  } catch (err) {
    if (isPrismaError(err, 'P2025')) throw notFound('This user is not blocked.');
    throw err;
  }
  return { message: 'User unblocked successfully.' };
}

export async function getBlockedUsers(blockerId: string, cursor?: string) {
  const blocks = await prisma.block.findMany({
    take: PAGE_SIZE,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { blockerId_blockedId: { blockerId, blockedId: cursor } } : undefined,
    where: { blockerId },
    orderBy: { createdAt: 'desc' },
    include: { blocked: { select: USER_SELECT } },
  });

  return {
    users: blocks.map((b) => b.blocked),
    nextCursor: blocks.length === PAGE_SIZE ? blocks[blocks.length - 1].blockedId : null,
  };
}
