import type { Prisma } from '@prisma/client';
import { forbidden, notFound } from '../../shared/errors';
import { prisma } from '../../shared/prisma';
import type { CreatePostInput, UpdatePostInput } from './posts.schemas';
import { postListInclude, toPostDto } from './posts.mapper';

const FEED_PAGE_SIZE = 5;
const LIST_PAGE_SIZE = 20;

const nextCursorOf = <T extends { id: string }>(items: T[], pageSize: number) =>
  items.length === pageSize ? items[items.length - 1].id : null;

export async function getFeed(userId: string, cursor?: string) {
  const posts = await prisma.post.findMany({
    take: FEED_PAGE_SIZE,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: postListInclude(userId),
  });

  return { posts: posts.map((p) => toPostDto(p)), nextCursor: nextCursorOf(posts, FEED_PAGE_SIZE) };
}

export async function listPosts(userId: string | undefined, search?: string, cursor?: string) {
  const where: Prisma.PostWhereInput = search
    ? {
        OR: [
          { caption: { contains: search, mode: 'insensitive' } },
          { author: { username: { contains: search, mode: 'insensitive' } } },
          { hashtags: { has: search } },
        ],
      }
    : {};

  const posts = await prisma.post.findMany({
    take: LIST_PAGE_SIZE,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    where,
    orderBy: { createdAt: 'desc' },
    include: postListInclude(userId),
  });

  return {
    posts: posts.map((p) => toPostDto(p, { isSaved: userId ? p.savedBy.length > 0 : false })),
    nextCursor: nextCursorOf(posts, LIST_PAGE_SIZE),
  };
}

export async function getPost(id: string, userId?: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      ...postListInclude(userId),
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { username: true, avatar: true } },
          likes: { where: { userId: userId ?? '' }, select: { userId: true } },
          _count: { select: { likes: true } },
        },
      },
    },
  });
  if (!post) throw notFound('Post not found.');

  return {
    id: post.id,
    username: post.author.username,
    authorId: post.authorId,
    userImage: post.author.avatar,
    image: post.image,
    caption: post.caption,
    likes: post._count.likes,
    timePosted: post.createdAt.toISOString(),
    isLiked: post.likes.length > 0,
    isSaved: userId ? post.savedBy.length > 0 : false,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      username: comment.author.username,
      authorId: comment.authorId,
      userImage: comment.author.avatar,
      text: comment.text,
      timePosted: comment.createdAt.toISOString(),
      likes: comment._count.likes,
      isLiked: comment.likes.length > 0,
    })),
  };
}

export async function createPost(userId: string, input: CreatePostInput) {
  const post = await prisma.post.create({ data: { ...input, authorId: userId } });
  return {
    id: post.id,
    caption: post.caption,
    image: post.image,
    location: post.location,
    hashtags: post.hashtags,
    authorId: post.authorId,
    createdAt: post.createdAt.toISOString(),
  };
}

/** Garante que o post existe e pertence ao usuário. */
async function findOwnedPost(userId: string, id: string, action: 'update' | 'delete') {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw notFound('Post not found.');
  if (post.authorId !== userId) throw forbidden(`You are not authorized to ${action} this post.`);
  return post;
}

export async function updatePost(userId: string, id: string, input: UpdatePostInput) {
  await findOwnedPost(userId, id, 'update');
  return prisma.post.update({ where: { id }, data: input });
}

export async function deletePost(userId: string, id: string) {
  await findOwnedPost(userId, id, 'delete');
  await prisma.post.delete({ where: { id } });
}

export async function togglePostLike(userId: string, postId: string) {
  if (!(await prisma.post.findUnique({ where: { id: postId }, select: { id: true } }))) {
    throw notFound('Post not found.');
  }

  const existing = await prisma.like.findUnique({ where: { userId_postId: { userId, postId } } });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { message: 'Post unliked successfully.' };
  }
  await prisma.like.create({ data: { userId, postId } });
  return { message: 'Post liked successfully.' };
}

export async function toggleSavePost(userId: string, postId: string) {
  if (!(await prisma.post.findUnique({ where: { id: postId }, select: { id: true } }))) {
    throw notFound('Post not found.');
  }

  const where = { userId_postId: { userId, postId } };
  if (await prisma.savedPost.findUnique({ where })) {
    await prisma.savedPost.delete({ where });
    return { saved: false, message: 'Post unsaved successfully.' };
  }
  await prisma.savedPost.create({ data: { userId, postId } });
  return { saved: true, message: 'Post saved successfully.' };
}
