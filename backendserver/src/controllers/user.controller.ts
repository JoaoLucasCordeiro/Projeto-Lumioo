import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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


export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, username, institution, academicLevel, dateOfBirth } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        username,
        institution,
        academicLevel,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
     // Handle case where user to update is not found
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        return res.status(404).json({ error: 'User not found.' });
    }
    res.status(500).json({ error: 'An error occurred while updating the user.' });
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