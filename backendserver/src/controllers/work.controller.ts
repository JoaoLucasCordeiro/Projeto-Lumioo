import { Request, Response } from 'express';
import { PrismaClient, Prisma, WorkType } from '@prisma/client';

const prisma = new PrismaClient();

// A interface AuthenticatedRequest foi removida

export const createWork = async (req: Request, res: Response) => {
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
        downloads: 0,
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
    const { search, workType, year, area } = req.query;

    const whereClause: Prisma.WorkWhereInput = {};

    if (search) {
      const searchString = search as string;
      whereClause.OR = [
        { title: { contains: searchString, mode: 'insensitive' } },
        { summary: { contains: searchString, mode: 'insensitive' } },
        { author: { fullName: { contains: searchString, mode: 'insensitive' } } },
        { keywords: { has: searchString } }
      ];
    }

    if (workType) {
        const typeString = (workType as string).toUpperCase();
        if (Object.values(WorkType).includes(typeString as WorkType)) {
            whereClause.workType = typeString as WorkType;
        }
    }

    if (year) {
        const numericYear = parseInt(year as string);
        if (!isNaN(numericYear)) {
            const startDate = new Date(numericYear, 0, 1);
            const endDate = new Date(numericYear + 1, 0, 1);
            whereClause.createdAt = {
                gte: startDate,
                lt: endDate,
            };
        }
    }

    if (area) {
      whereClause.institution = { contains: area as string, mode: 'insensitive' };
    }

    const worksFromDb = await prisma.work.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { fullName: true } }
      }
    });

    const formattedWorks = worksFromDb.map((work: any) => ({
        id: work.id,
        title: work.title,
        author: work.author.fullName,
        type: work.workType,
        area: work.institution,
        year: new Date(work.createdAt).getFullYear().toString(),
        abstract: work.summary,
        keywords: work.keywords,
        downloads: work.downloads,
        image: work.coverImage,
    }));

    res.status(200).json(formattedWorks);
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
      include: {
        author: {
          select: {
            fullName: true,
          }
        }
      }
    });

    if (!work) {
      return res.status(404).json({ error: 'Work not found.' });
    }

    const formattedWork = {
        id: work.id,
        title: work.title,
        author: work.author.fullName,
        type: work.workType,
        area: work.institution,
        year: new Date(work.createdAt).getFullYear().toString(),
        abstract: work.summary,
        detailedDescription: work.description,
        keywords: work.keywords,
        downloads: work.downloads,
        fileUrl: work.pdfFile,
        image: work.coverImage,
        advisor: work.advisor,
        institution: work.institution,
        department: work.department,
        references: work.references,
    };

    res.status(200).json(formattedWork);
  } catch (error) {
    console.error('Error fetching work:', error);
    res.status(500).json({ error: 'An error occurred while fetching the work.' });
  }
};

export const downloadWorkById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const work = await prisma.$transaction(async (tx: any) => {
            const updatedWork = await tx.work.update({
                where: { id },
                data: {
                    downloads: {
                        increment: 1,
                    },
                },
            });
            return updatedWork;
        });

        if (!work) {
            return res.status(404).json({ error: 'Work not found.' });
        }

        res.status(200).json({ pdfFile: work.pdfFile, title: work.title });

    } catch (error) {
        console.error('Error downloading work:', error);
        res.status(500).json({ error: 'An error occurred while downloading the work.' });
    }
};

export const updateWork = async (req: Request, res: Response) => {
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
        workType: workType ? (workType.toUpperCase() as WorkType) : undefined,
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

export const deleteWork = async (req: Request, res: Response) => {
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