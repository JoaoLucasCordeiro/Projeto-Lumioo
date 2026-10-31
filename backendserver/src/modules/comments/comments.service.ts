import { forbidden, notFound } from '../../shared/errors';
import { prisma } from '../../shared/prisma';

const withAuthor = { author: { select: { username: true } } } as const;

type CommentWithAuthor = {
  id: string;
  text: string;
  authorId: string;
  createdAt: Date;
  author: { username: string };
};

const toCommentDto = (c: CommentWithAuthor) => ({
  id: c.id,
  text: c.text,
  authorId: c.authorId,
  username: c.author.username,
  userImage: '/default-user.png', // placeholder: os clientes usam o avatar de GET /posts/:id
  timePosted: c.createdAt.toISOString(),
  likes: 0,
  isLiked: false,
});

export async function createComment(userId: string, postId: string, text: string) {
  if (!(await prisma.post.findUnique({ where: { id: postId }, select: { id: true } }))) {
    throw notFound('Post not found.');
  }
  const comment = await prisma.comment.create({ data: { text, authorId: userId, postId }, include: withAuthor });
  return toCommentDto(comment);
}

export const listComments = (postId: string) =>
  prisma.comment.findMany({ where: { postId }, include: withAuthor, orderBy: { createdAt: 'asc' } });

async function findOwnedComment(userId: string, commentId: string, action: 'edit' | 'delete') {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw notFound('Comment not found.');
  if (comment.authorId !== userId) throw forbidden(`User not authorized to ${action} this comment.`);
}

export async function updateComment(userId: string, commentId: string, text: string) {
  await findOwnedComment(userId, commentId, 'edit');
  const comment = await prisma.comment.update({ where: { id: commentId }, data: { text }, include: withAuthor });
  return toCommentDto(comment);
}

export async function deleteComment(userId: string, commentId: string) {
  await findOwnedComment(userId, commentId, 'delete');
  await prisma.comment.delete({ where: { id: commentId } });
}

export async function toggleCommentLike(userId: string, commentId: string) {
  if (!(await prisma.comment.findUnique({ where: { id: commentId }, select: { id: true } }))) {
    throw notFound('Comment not found.');
  }

  const existing = await prisma.like.findUnique({ where: { userId_commentId: { userId, commentId } } });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { message: 'Comment unliked successfully.' };
  }
  await prisma.like.create({ data: { userId, commentId } });
  return { message: 'Comment liked successfully.' };
}
