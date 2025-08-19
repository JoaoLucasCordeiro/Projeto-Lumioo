import { Request, Response } from 'express';
import { PrismaClient, WorkType } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export const createWork = async (req: AuthenticatedRequest, res: Response) => {
  const authorId = req.user?.userId;
  if (!authorId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }

  const {
    title,
    workType,
    coverImage,
    summary,
    description,
    keywords,
    references,
    advisor,
    institution,
    department,
    pdfFile,
  } = req.body;

  if (!title || !workType || !summary || !description || !keywords || !references || !advisor || !institution || !pdfFile) {
    return res.status(400).json({ error: 'All required fields must be provided.' });
  }

  if (!Object.values(WorkType).includes(workType.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid workType value.' });
  }
  
  if (!Array.isArray(keywords) || keywords.length < 3 || keywords.length > 5) {
    return res.status(400).json({ error: 'You must provide between 3 and 5 keywords.' });
  }

  if (!Array.isArray(references)) {
      return res.status(400).json({ error: 'References must be an array.' });
  }

  try {
    const newWork = await prisma.work.create({
      data: {
        title,
        workType: workType.toUpperCase() as WorkType,
        coverImage,
        summary,
        description,
        keywords,
        references,
        advisor,
        institution,
        department,
        pdfFile,
        authorId,
      },
    });

    res.status(201).json(newWork);
  } catch (error) {
    console.error('Error creating work:', error);
    res.status(500).json({ error: 'An error occurred while creating the work.' });
  }
};

export const getAllWorks = async (req: Request, res: Response) => {
  try {
    const works = await prisma.work.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(works);
  } catch (error) {
    console.error('Error fetching works:', error);
    res.status(500).json({ error: 'An error occurred while fetching works.' });
  }
};

export const getWorkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const work = await prisma.work.findUnique({
      where: { id },
    });
    if (!work) {
      return res.status(404).json({ error: 'Work not found.' });
    }
    res.status(200).json(work);
  } catch (error) {
    console.error('Error fetching work:', error);
    res.status(500).json({ error: 'An error occurred while fetching the work.' });
  }
};

export const updateWork = async (req: AuthenticatedRequest, res: Response) => {
  const authorId = req.user?.userId;
  if (!authorId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }
  const { id } = req.params;
  const {
    title,
    workType,
    coverImage,
    summary,
    description,
    keywords,
    references,
    advisor,
    institution,
    department,
    pdfFile,
  } = req.body;
  try {
    const work = await prisma.work.findUnique({ where: { id } });
    if (!work) {
      return res.status(404).json({ error: 'Work not found.' });
    }
    if (work.authorId !== authorId) {
      return res.status(403).json({ error: 'You are not authorized to update this work.' });
    }
    const updatedWork = await prisma.work.update({
      where: { id },
      data: {
        title,
        workType: workType ? workType.toUpperCase() : undefined,
        coverImage,
        summary,
        description,
        keywords,
        references,
        advisor,
        institution,
        department,
        pdfFile,
      },
    });
    res.status(200).json(updatedWork);
  } catch (error) {
    console.error('Error updating work:', error);
    res.status(500).json({ error: 'An error occurred while updating the work.' });
  }
};

export const deleteWork = async (req: AuthenticatedRequest, res: Response) => {
  const authorId = req.user?.userId;
  if (!authorId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }
  const { id } = req.params;
  try {
    const work = await prisma.work.findUnique({ where: { id } });
    if (!work) {
      return res.status(404).json({ error: 'Work not found.' });
    }
    if (work.authorId !== authorId) {
      return res.status(403).json({ error: 'You are not authorized to delete this work.' });
    }
    await prisma.work.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting work:', error);
    res.status(500).json({ error: 'An error occurred while deleting the work.' });
  }
};