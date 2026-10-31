import type { Prisma } from '@prisma/client';

/** Include padrão para listar posts já com os dados da perspectiva do usuário (curtiu/salvou). */
export const postListInclude = (userId?: string) =>
  ({
    author: { select: { username: true, avatar: true } },
    likes: { where: { userId: userId ?? '' }, select: { userId: true } },
    savedBy: { where: { userId: userId ?? '' }, select: { userId: true } },
    _count: { select: { comments: true, likes: true } },
  }) satisfies Prisma.PostInclude;

export type PostListItem = Prisma.PostGetPayload<{
  include: {
    author: { select: { username: true; avatar: true } };
    likes: { select: { userId: true } };
    savedBy: { select: { userId: true } };
    _count: { select: { comments: true; likes: true } };
  };
}>;

/** Formato de post usado no feed, nas listagens e nos perfis. */
export const toPostDto = (post: PostListItem, overrides: { isSaved?: boolean; userImage?: string | null } = {}) => ({
  id: post.id,
  username: post.author.username,
  authorId: post.authorId,
  userImage: overrides.userImage !== undefined ? overrides.userImage : post.author.avatar,
  image: post.image,
  caption: post.caption,
  likes: post._count.likes,
  comments: post._count.comments,
  timePosted: post.createdAt.toISOString(),
  isLiked: post.likes.length > 0,
  isSaved: overrides.isSaved !== undefined ? overrides.isSaved : post.savedBy.length > 0,
});
