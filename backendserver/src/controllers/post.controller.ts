import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const getFeedPosts = async (req: Request, res: Response) => {
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
        author: { select: { username: true, avatar: true } },
        likes: { where: { userId }, select: { userId: true } },
        _count: { select: { comments: true, likes: true } },
        savedBy: { where: { userId }, select: { userId: true } },
      },
    });

    const formattedPosts = postsFromDb.map(post => ({
      id: post.id,
      username: post.author.username,
      authorId: post.authorId,
      userImage: post.author.avatar,
      image: post.image,
      caption: post.caption,
      likes: post._count.likes,
      comments: post._count.comments,
      timePosted: post.createdAt.toISOString(),
      isLiked: post.likes.length > 0,
      isSaved: post.savedBy.length > 0,
    }));

    const nextCursor = postsFromDb.length === limit ? postsFromDb[postsFromDb.length - 1].id : null;

    res.status(200).json({ posts: formattedPosts, nextCursor });

  } catch (error) {
    console.error("Error fetching feed posts:", error);
    res.status(500).json({ error: "Could not fetch feed posts." });
  }
};

export const createPost = async (req: Request, res: Response) => {
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
    res.status(201).json({
      id: newPost.id,
      caption: newPost.caption,
      image: newPost.image,
      location: newPost.location,
      hashtags: newPost.hashtags,
      authorId: newPost.authorId,
      createdAt: newPost.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'An error occurred while creating the post.' });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { search, cursor } = req.query;
  const LIMIT = 20;

  try {
    const whereClause: Prisma.PostWhereInput = search ? {
      OR: [
        { caption: { contains: search as string, mode: 'insensitive' } },
        { author: { username: { contains: search as string, mode: 'insensitive' } } },
        { hashtags: { has: search as string } }
      ]
    } : {};

    const postsFromDb = await prisma.post.findMany({
      take: LIMIT,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor as string } : undefined,
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { username: true, avatar: true } },
        likes: { where: { userId: userId ?? '' }, select: { userId: true } },
        _count: { select: { comments: true, likes: true } },
        savedBy: { where: { userId }, select: { userId: true } },
      },
    });

    const formattedPosts = postsFromDb.map(post => ({
      id: post.id,
      username: post.author.username,
      authorId: post.authorId,
      userImage: post.author.avatar,
      image: post.image,
      caption: post.caption,
      likes: post._count.likes,
      comments: post._count.comments,
      timePosted: post.createdAt.toISOString(),
      isLiked: post.likes.length > 0,
      isSaved: userId ? post.savedBy.length > 0 : false,
    }));

    const nextCursor = postsFromDb.length === LIMIT ? postsFromDb[postsFromDb.length - 1].id : null;
    res.status(200).json({ posts: formattedPosts, nextCursor });

  } catch (error) {
    console.error("Error fetching all posts:", error);
    res.status(500).json({ error: "Could not fetch posts." });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  const userId = req.user?.userId; 
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { username: true, avatar: true } },
        likes: { where: { userId: userId ?? '' }, select: { userId: true } },
        _count: { select: { likes: true } },
        savedBy: { where: { userId }, select: { userId: true } },
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

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const formattedPost = {
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
      comments: post.comments.map(comment => ({
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

    res.status(200).json(formattedPost);
  } catch (error) {
    console.error("Error fetching post details:", error);
    res.status(500).json({ error: "Could not fetch post details." });
  }
};

export const updatePost = async (req: Request, res: Response) => {
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

export const deletePost = async (req: Request, res: Response) => {
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