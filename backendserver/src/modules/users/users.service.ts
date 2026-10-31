import bcrypt from 'bcryptjs';
import { conflict, forbidden, isPrismaError, notFound, unauthorized } from '../../shared/errors';
import { prisma } from '../../shared/prisma';
import { postListInclude, toPostDto } from '../posts/posts.mapper';
import type { ChangePasswordInput, CreateUserInput, UpdateProfileInput } from './users.schemas';

// Campos que podem aparecer em listagens públicas (sem e-mail, data de nascimento ou senha — PII).
const PUBLIC_USER_SELECT = {
  id: true,
  fullName: true,
  username: true,
  institution: true,
  academicLevel: true,
  bio: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} as const;

const PROFILE_POSTS_LIMIT = 20;

export async function createUser(input: CreateUserInput) {
  const hashedPassword = await bcrypt.hash(input.password, 10);

  try {
    const user = await prisma.user.create({
      data: { ...input, password: hashedPassword, dateOfBirth: new Date(input.dateOfBirth) },
    });
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (err) {
    if (isPrismaError(err, 'P2002')) throw conflict('Email or username already exists.');
    throw err;
  }
}

export const listUsers = () => prisma.user.findMany({ select: PUBLIC_USER_SELECT });

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_SELECT });
  if (!user) throw notFound('User not found.');
  return user;
}

/** Perfil do próprio usuário: inclui e-mail, data de nascimento e posts salvos. */
export async function getMyProfile(userId: string) {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      fullName: true,
      username: true,
      academicEmail: true,
      institution: true,
      academicLevel: true,
      dateOfBirth: true,
      createdAt: true,
      bio: true,
      avatar: true,
      coverPhoto: true,
      _count: { select: { posts: true, followers: true, following: true } },
      posts: {
        take: PROFILE_POSTS_LIMIT,
        orderBy: { createdAt: 'desc' },
        include: postListInclude(userId),
      },
      savedPosts: {
        take: PROFILE_POSTS_LIMIT,
        orderBy: { savedAt: 'desc' },
        select: { post: { include: postListInclude(userId) } },
      },
    },
  });
  if (!profile) throw notFound('Profile not found.');

  return {
    fullName: profile.fullName,
    username: profile.username,
    email: profile.academicEmail,
    institution: profile.institution,
    academicLevel: profile.academicLevel,
    birthDate: profile.dateOfBirth.toISOString(),
    joinDate: profile.createdAt.toISOString(),
    bio: profile.bio || '',
    avatar: profile.avatar,
    coverPhoto: profile.coverPhoto,
    followers: profile._count.followers,
    following: profile._count.following,
    posts: profile._count.posts,
    userPosts: profile.posts.map((post) => toPostDto(post, { userImage: profile.avatar })),
    savedPosts: profile.savedPosts.map((saved) => toPostDto(saved.post, { isSaved: true })),
  };
}

/** Perfil público por @username. Bloqueio em qualquer direção responde 404 (não revela o bloqueio). */
export async function getPublicProfile(username: string, viewerId?: string) {
  const profile = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      fullName: true,
      username: true,
      institution: true,
      academicLevel: true,
      createdAt: true,
      bio: true,
      avatar: true,
      coverPhoto: true,
      _count: { select: { posts: true, followers: true, following: true } },
      posts: {
        take: PROFILE_POSTS_LIMIT,
        orderBy: { createdAt: 'desc' },
        include: postListInclude(viewerId),
      },
    },
  });
  if (!profile) throw notFound('Profile not found.');

  let isFollowing = false;
  if (viewerId) {
    const [block, follow] = await Promise.all([
      prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: viewerId, blockedId: profile.id },
            { blockerId: profile.id, blockedId: viewerId },
          ],
        },
      }),
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: viewerId, followingId: profile.id } },
      }),
    ]);
    if (block) throw notFound('Profile not found.');
    isFollowing = !!follow;
  }

  return {
    id: profile.id,
    fullName: profile.fullName,
    username: profile.username,
    institution: profile.institution,
    academicLevel: profile.academicLevel,
    joinDate: profile.createdAt.toISOString(),
    bio: profile.bio || '',
    avatar: profile.avatar,
    coverPhoto: profile.coverPhoto,
    posts: profile._count.posts,
    followers: profile._count.followers,
    following: profile._count.following,
    isFollowing,
    isBlocked: false, // se houvesse bloqueio, a resposta já teria sido 404
    userPosts: profile.posts.map((post) => toPostDto(post, { isSaved: viewerId ? post.savedBy.length > 0 : false })),
    savedPosts: [],
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  if (input.username) {
    const existing = await prisma.user.findUnique({ where: { username: input.username } });
    if (existing && existing.id !== userId) throw conflict('Username already taken.');
  }

  const user = await prisma.user.update({ where: { id: userId }, data: input });
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function deleteUser(requesterId: string, targetId: string) {
  if (requesterId !== targetId) throw forbidden('Forbidden: You can only delete your own account.');

  try {
    await prisma.user.delete({ where: { id: targetId } });
  } catch (err) {
    if (isPrismaError(err, 'P2025')) throw notFound('User not found.');
    throw err;
  }
}

export async function changePassword(userId: string, { currentPassword, newPassword }: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('Usuário não encontrado.');

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw unauthorized('A senha atual está incorreta.');
  }

  await prisma.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(newPassword, 10) } });
  return { message: 'Senha alterada com sucesso.' };
}
