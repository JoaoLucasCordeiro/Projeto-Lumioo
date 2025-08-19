import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Creates a new user.
 * @param req - The request object.
 * @param res - The response object.
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { fullName, academicEmail, username, institution, academicLevel, dateOfBirth } = req.body;

    // Basic validation
    if (!fullName || !academicEmail || !username || !institution || !academicLevel || !dateOfBirth) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newUser = await prisma.user.create({
      data: {
        fullName,
        academicEmail,
        username,
        institution,
        academicLevel,
        dateOfBirth: new Date(dateOfBirth), // Ensure date is in correct format
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    // Handle potential unique constraint errors
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
        return res.status(409).json({ error: 'Email or username already exists.' });
    }
    res.status(500).json({ error: 'An error occurred while creating the user.' });
  }
};

/**
 * Retrieves all users.
 * @param req - The request object.
 * @param res - The response object.
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users.' });
  }
};

/**
 * Retrieves a single user by their ID.
 * @param req - The request object.
 * @param res - The response object.
 */
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

/**
 * Updates an existing user by their ID.
 * @param req - The request object.
 * @param res - The response object.
 */
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

/**
 * Deletes a user by their ID.
 * @param req - The request object.
 * @param res - The response object.
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id },
    });

    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    console.error('Error deleting user:', error);
    // Handle case where user to delete is not found
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        return res.status(404).json({ error: 'User not found.' });
    }
    res.status(500).json({ error: 'An error occurred while deleting the user.' });
  }
};