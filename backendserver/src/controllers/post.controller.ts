import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export const getFeedPosts = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }

  const limit = 5;
  const { cursor } = req.query;

  try {
    const postsFromDb = await prisma.post.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor as string } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { username: true } },
        likes: { select: { userId: true } },
        _count: { select: { comments: true } },
        savedBy: { where: { userId }, select: { userId: true } },
      },
    });

    const formattedPosts = postsFromDb.map(post => ({
      id: post.id,
      username: post.author.username,
      authorId: post.authorId, 
      userImage: '/default-user.png',
      image: post.image,
      caption: post.caption,
      likes: post.likes.length,
      comments: post._count.comments,
      timePosted: post.createdAt.toISOString(),
      isLiked: post.likes.some(like => like.userId === userId),
      isSaved: post.savedBy.length > 0,
    }));

    const nextCursor = postsFromDb.length === limit ? postsFromDb[postsFromDb.length - 1].id : null;

    res.status(200).json({ posts: formattedPosts, nextCursor });

  } catch (error) {
    console.error("Error fetching feed posts:", error);
    res.status(500).json({ error: "Could not fetch feed posts." });
  }
};

export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(403).json({ error: 'User not authenticated.' });
    }
    const { caption, image, location, hashtags } = req.body;
    if (!caption || !image) {
      return res.status(400).json({ error: 'Caption and image are required.' });
    }
    const newPost = await prisma.post.create({
      data: {
        caption,
        image,
        location,
        hashtags,
        authorId: userId, 
      },
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'An error occurred while creating the post.' });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'An error occurred while fetching posts.' });
  }
};

export const getPostById = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId; 
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { username: true } },
        likes: { select: { userId: true } },
        savedBy: { where: { userId }, select: { userId: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { username: true } },
            likes: { select: { userId: true } },
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Formata o post e seus comentários para o front-end
    const formattedPost = {
      id: post.id,
      username: post.author.username,
      authorId: post.authorId, // Adiciona o ID do autor para verificação de posse
      userImage: '/default-user.png',
      image: post.image,
      caption: post.caption,
      likes: post.likes.length,
      timePosted: post.createdAt.toISOString(),
      isLiked: userId ? post.likes.some(like => like.userId === userId) : false,
      isSaved: userId ? post.savedBy.length > 0 : false,
      comments: post.comments.map(comment => ({
        id: comment.id,
        username: comment.author.username,
        userImage: '/default-user.png',
        text: comment.text,
        timePosted: comment.createdAt.toISOString(),
        likes: comment.likes.length,
        isLiked: userId ? comment.likes.some(like => like.userId === userId) : false,
      })),
    };

    res.status(200).json(formattedPost);
  } catch (error) {
    console.error("Error fetching post details:", error);
    res.status(500).json({ error: "Could not fetch post details." });
  }
};

export const updatePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(403).json({ error: 'User not authenticated.' });
    }
    const { id } = req.params;
    const { caption, image, location, hashtags } = req.body;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to update this post.' });
    }
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { caption, image, location, hashtags },
    });
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'An error occurred while updating the post.' });
  }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(403).json({ error: 'User not authenticated.' });
    }
    const { id } = req.params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this post.' });
    }
    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'An error occurred while deleting the post.' });
  }
};