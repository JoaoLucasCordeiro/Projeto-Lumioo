import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const signIn = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; 

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/username and password are required.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { academicEmail: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' } 
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ user: userWithoutPassword, token });

  } catch (error) {
    console.error('Error during sign in:', error);
    res.status(500).json({ error: 'An internal error occurred.' });
  }
};
