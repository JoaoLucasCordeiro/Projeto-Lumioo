import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// A interface AuthenticatedRequest foi removida

export const createUser = async (req: Request, res: Response) => {
  try {
    const { fullName, academicEmail, username, password, institution, academicLevel, dateOfBirth } = req.body;

    if (!fullName || !academicEmail || !username || !password || !institution || !academicLevel || !dateOfBirth) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    const newUser = await prisma.user.create({
      data: {
        fullName,
        academicEmail,
        username,
        password: hashedPassword, 
        institution,
        academicLevel,
        dateOfBirth: new Date(dateOfBirth),
      },
    });
    
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
        return res.status(409).json({ error: 'Email or username already exists.' });
    }
    res.status(500).json({ error: 'An error occurred while creating the user.' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users.' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ error: 'An error occurred while fetching the user.' });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }

  try {
    const userProfile = await prisma.user.findUnique({
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
        _count: {
          select: {
            posts: true,
          }
        },
        posts: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { username: true, avatar: true } },
            likes: { select: { userId: true } },
            _count: { select: { comments: true } },
            savedBy: { where: { userId }, select: { userId: true } },
          }
        },
        savedPosts: {
          orderBy: { savedAt: 'desc' },
          select: {
            post: {
              include: {
                author: { select: { username: true, avatar: true } },
                likes: { select: { userId: true } },
                _count: { select: { comments: true } },
                savedBy: { where: { userId }, select: { userId: true } },
              }
            }
          }
        }
      }
    });

    if (!userProfile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const formattedProfile = {
      fullName: userProfile.fullName,
      username: userProfile.username,
      email: userProfile.academicEmail,
      institution: userProfile.institution,
      academicLevel: userProfile.academicLevel,
      birthDate: userProfile.dateOfBirth.toISOString(),
      joinDate: userProfile.createdAt.toISOString(),
      bio: userProfile.bio || '',
      avatar: userProfile.avatar,
      coverPhoto: userProfile.coverPhoto,
      followers: 0,
      following: 0,
      posts: userProfile._count.posts,
      userPosts: userProfile.posts.map((post: any) => ({
        id: post.id,
        username: post.author.username,
        authorId: post.authorId,
        userImage: userProfile.avatar,
        image: post.image,
        caption: post.caption,
        likes: post.likes.length,
        comments: post._count.comments,
        timePosted: post.createdAt.toISOString(),
        isLiked: post.likes.some((like: { userId: string }) => like.userId === userId),
        isSaved: post.savedBy.length > 0,
      })),
      savedPosts: userProfile.savedPosts.map((saved: any) => ({
        id: saved.post.id,
        username: saved.post.author.username,
        authorId: saved.post.authorId,
        userImage: saved.post.author.avatar,
        image: saved.post.image,
        caption: saved.post.caption,
        likes: saved.post.likes.length,
        comments: saved.post._count.comments,
        timePosted: saved.post.createdAt.toISOString(),
        isLiked: saved.post.likes.some((like: { userId: string }) => like.userId === userId),
        isSaved: true,
      }))
    };

    res.status(200).json(formattedProfile);

  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Could not fetch profile." });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const tokenUserId = req.user?.userId;

  if (!tokenUserId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }

  const { fullName, username, bio, avatar, coverPhoto } = req.body;

  try {
    if (username) {
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser && existingUser.id !== tokenUserId) {
        return res.status(409).json({ error: 'Username already taken.' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: tokenUserId },
      data: { fullName, username, bio, avatar, coverPhoto }
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'An error occurred while updating the user.' });
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id },
    });

    res.status(204).send(); 
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        return res.status(404).json({ error: 'User not found.' });
    }
    res.status(500).json({ error: 'An error occurred while deleting the user.' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'A senha atual está incorreta.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: 'Senha alterada com sucesso.' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao alterar a senha.' });
  }
};