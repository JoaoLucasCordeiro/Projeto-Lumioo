import { Request, Response } from 'express';
import { Prisma, WorkType, WorkVisibility, WorkArea } from '@prisma/client';
import { prisma } from '../lib/prisma';

const REQUESTER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  avatar: true,
  institution: true,
  academicLevel: true,
};

const STATS_FIELD_MAP: Record<string, string> = {
  institution: 'institution',
  campus: 'campus',
  city: 'city',
  state: 'state',
  country: 'country',
  area: 'area',
  author: 'authorId',
};

const SUGGESTION_FIELDS = ['institution', 'campus', 'city'] as const;

// institution/country/authorId nunca são nulos no schema — filtrar "not: null" neles é
// rejeitado pelo Prisma ("Argument `not` must not be null").
const NULLABLE_STATS_FIELDS = new Set(['campus', 'city', 'state', 'area']);

export const createWork = async (req: Request, res: Response) => {
  const authorId = req.user?.userId;
  if (!authorId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }

  const {
    title,
    workType,
    visibility,
    coverImage,
    summary,
    description,
    keywords,
    references,
    advisor,
    institution,
    campus,
    city,
    state,
    country,
    area,
    department,
    pdfFile,
  } = req.body;

  if (!title || !workType || !summary || !description || !keywords || !references || !advisor || !institution || !pdfFile) {
    return res.status(400).json({ error: 'All required fields must be provided.' });
  }

  if (!Object.values(WorkType).includes(workType.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid workType value.' });
  }

  if (visibility && !Object.values(WorkVisibility).includes(visibility.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid visibility value.' });
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
        visibility: visibility ? (visibility.toUpperCase() as WorkVisibility) : WorkVisibility.PUBLIC,
        coverImage,
        summary,
        description,
        keywords,
        references,
        advisor,
        institution,
        campus,
        city,
        state,
        country: country || 'Brasil',
        area: area as WorkArea,
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
    const { search, workType, year, area, campus, city, state, country } = req.query;
    const currentUserId = req.user?.userId;

    const andConditions: Prisma.WorkWhereInput[] = [
      currentUserId
        ? { OR: [{ visibility: WorkVisibility.PUBLIC }, { authorId: currentUserId }] }
        : { visibility: WorkVisibility.PUBLIC },
    ];

    if (search) {
      const searchString = search as string;
      andConditions.push({
        OR: [
          { title: { contains: searchString, mode: 'insensitive' } },
          { summary: { contains: searchString, mode: 'insensitive' } },
          { author: { fullName: { contains: searchString, mode: 'insensitive' } } },
          { keywords: { has: searchString } }
        ],
      });
    }

    if (workType) {
        const typeString = (workType as string).toUpperCase();
        if (Object.values(WorkType).includes(typeString as WorkType)) {
            andConditions.push({ workType: typeString as WorkType });
        }
    }

    if (year) {
        const numericYear = parseInt(year as string);
        if (!isNaN(numericYear)) {
            const startDate = new Date(numericYear, 0, 1);
            const endDate = new Date(numericYear + 1, 0, 1);
            andConditions.push({ createdAt: { gte: startDate, lt: endDate } });
        }
    }

    if (area) {
      const areaUpper = (area as string).toUpperCase();
      if (Object.values(WorkArea).includes(areaUpper as WorkArea)) {
        andConditions.push({ area: areaUpper as WorkArea });
      }
    }

    if (campus) {
      andConditions.push({ campus: { contains: campus as string, mode: 'insensitive' } });
    }

    if (city) {
      andConditions.push({ city: { contains: city as string, mode: 'insensitive' } });
    }

    if (state) {
      andConditions.push({ state: (state as string).toUpperCase() });
    }

    if (country) {
      andConditions.push({ country: { contains: country as string, mode: 'insensitive' } });
    }

    const whereClause: Prisma.WorkWhereInput = { AND: andConditions };

    const { cursor } = req.query;
    const LIMIT = 20;

    const worksFromDb = await prisma.work.findMany({
      take: LIMIT,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor as string } : undefined,
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
        visibility: work.visibility,
        area: work.area,
        year: new Date(work.createdAt).getFullYear().toString(),
        abstract: work.summary,
        keywords: work.keywords,
        downloads: work.downloads,
        image: work.coverImage,
        campus: work.campus,
        city: work.city,
        state: work.state,
        country: work.country,
    }));

    const nextCursor = worksFromDb.length === LIMIT ? worksFromDb[worksFromDb.length - 1].id : null;
    res.status(200).json({ works: formattedWorks, nextCursor });
  } catch (error) {
    console.error('Error fetching works:', error);
    res.status(500).json({ error: 'An error occurred while fetching works.' });
  }
};

export const getWorkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;

    const work = await prisma.work.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            fullName: true,
            username: true,
          }
        }
      }
    });

    if (!work) {
      return res.status(404).json({ error: 'Work not found.' });
    }

    const isOwner = currentUserId === work.authorId;

    if (work.visibility === WorkVisibility.PRIVATE && !isOwner) {
      const accessRequest = currentUserId
        ? await prisma.workAccessRequest.findUnique({
            where: { workId_requesterId: { workId: work.id, requesterId: currentUserId } },
          })
        : null;

      if (accessRequest?.status !== 'APPROVED') {
        return res.status(403).json({
          error: 'This work is private.',
          visibility: work.visibility,
          accessRequestStatus: accessRequest?.status ?? null,
        });
      }
    }

    const formattedWork = {
        id: work.id,
        title: work.title,
        author: work.author.fullName,
        authorUsername: work.author.username,
        type: work.workType,
        visibility: work.visibility,
        area: work.area,
        year: new Date(work.createdAt).getFullYear().toString(),
        abstract: work.summary,
        detailedDescription: work.description,
        keywords: work.keywords,
        downloads: work.downloads,
        fileUrl: work.pdfFile,
        image: work.coverImage,
        advisor: work.advisor,
        institution: work.institution,
        campus: work.campus,
        city: work.city,
        state: work.state,
        country: work.country,
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
        const currentUserId = req.user!.userId;

        const existingWork = await prisma.work.findUnique({ where: { id } });
        if (!existingWork) {
            return res.status(404).json({ error: 'Work not found.' });
        }

        const isOwner = currentUserId === existingWork.authorId;

        if (existingWork.visibility === WorkVisibility.PRIVATE && !isOwner) {
            const accessRequest = await prisma.workAccessRequest.findUnique({
                where: { workId_requesterId: { workId: id, requesterId: currentUserId } },
            });

            if (accessRequest?.status !== 'APPROVED') {
                return res.status(403).json({
                    error: 'This work is private.',
                    visibility: existingWork.visibility,
                    accessRequestStatus: accessRequest?.status ?? null,
                });
            }
        }

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
    visibility,
    coverImage,
    summary,
    description,
    keywords,
    references,
    advisor,
    institution,
    campus,
    city,
    state,
    country,
    area,
    department,
    pdfFile,
  } = req.body;

  if (visibility && !Object.values(WorkVisibility).includes(visibility.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid visibility value.' });
  }

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
        visibility: visibility ? (visibility.toUpperCase() as WorkVisibility) : undefined,
        coverImage,
        summary,
        description,
        keywords,
        references,
        advisor,
        institution,
        campus,
        city,
        state,
        country,
        area: area as WorkArea | undefined,
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

export const requestWorkAccess = async (req: Request, res: Response) => {
  try {
    const requesterId = req.user!.userId;
    const { id: workId } = req.params;

    const work = await prisma.work.findUnique({ where: { id: workId } });
    if (!work) {
      return res.status(404).json({ error: 'Work not found.' });
    }
    if (work.visibility === WorkVisibility.PUBLIC) {
      return res.status(400).json({ error: 'This work is public; no access request is needed.' });
    }
    if (work.authorId === requesterId) {
      return res.status(400).json({ error: 'You cannot request access to your own work.' });
    }

    const existing = await prisma.workAccessRequest.findUnique({
      where: { workId_requesterId: { workId, requesterId } },
    });

    if (existing && (existing.status === 'PENDING' || existing.status === 'APPROVED')) {
      return res.status(409).json({ error: 'You already have an active request for this work.' });
    }

    const accessRequest = existing
      ? await prisma.workAccessRequest.update({
          where: { id: existing.id },
          data: { status: 'PENDING', respondedAt: null },
        })
      : await prisma.workAccessRequest.create({
          data: { workId, requesterId },
        });

    return res.status(201).json(accessRequest);
  } catch (error) {
    console.error('Error requesting work access:', error);
    return res.status(500).json({ error: 'Could not request access to this work.' });
  }
};

export const getWorkAccessRequests = async (req: Request, res: Response) => {
  try {
    const authorId = req.user!.userId;
    const { id: workId } = req.params;

    const work = await prisma.work.findUnique({ where: { id: workId } });
    if (!work) {
      return res.status(404).json({ error: 'Work not found.' });
    }
    if (work.authorId !== authorId) {
      return res.status(403).json({ error: 'You are not authorized to view these requests.' });
    }

    const requests = await prisma.workAccessRequest.findMany({
      where: { workId },
      orderBy: { createdAt: 'desc' },
      include: { requester: { select: REQUESTER_SELECT } },
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching access requests:', error);
    return res.status(500).json({ error: 'Could not fetch access requests.' });
  }
};

export const respondToWorkAccessRequest = async (req: Request, res: Response) => {
  try {
    const authorId = req.user!.userId;
    const { id: workId, requestId } = req.params;
    const { status } = req.body as { status: 'APPROVED' | 'DENIED' | 'REVOKED' };

    const work = await prisma.work.findUnique({ where: { id: workId } });
    if (!work) {
      return res.status(404).json({ error: 'Work not found.' });
    }
    if (work.authorId !== authorId) {
      return res.status(403).json({ error: 'You are not authorized to manage these requests.' });
    }

    const accessRequest = await prisma.workAccessRequest.findUnique({ where: { id: requestId } });
    if (!accessRequest || accessRequest.workId !== workId) {
      return res.status(404).json({ error: 'Access request not found.' });
    }

    if (status === 'REVOKED' && accessRequest.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Only approved requests can be revoked.' });
    }
    if ((status === 'APPROVED' || status === 'DENIED') && accessRequest.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only pending requests can be approved or denied.' });
    }

    const updated = await prisma.workAccessRequest.update({
      where: { id: requestId },
      data: { status, respondedAt: new Date() },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error responding to access request:', error);
    return res.status(500).json({ error: 'Could not update access request.' });
  }
};

export const getMyWorkAccessRequests = async (req: Request, res: Response) => {
  try {
    const requesterId = req.user!.userId;

    const requests = await prisma.workAccessRequest.findMany({
      where: { requesterId },
      orderBy: { createdAt: 'desc' },
      include: {
        work: { select: { id: true, title: true, workType: true, coverImage: true } },
      },
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching my access requests:', error);
    return res.status(500).json({ error: 'Could not fetch your access requests.' });
  }
};

export const getWorkStats = async (req: Request, res: Response) => {
  try {
    const dimension = req.query.dimension as string;
    const field = STATS_FIELD_MAP[dimension];
    if (!field) {
      return res.status(400).json({ error: 'Invalid dimension.' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const where: Record<string, unknown> = { visibility: WorkVisibility.PUBLIC };
    if (NULLABLE_STATS_FIELDS.has(field)) where[field] = { not: null };
    if (req.query.state) where.state = (req.query.state as string).toUpperCase();
    if (req.query.country) where.country = req.query.country as string;
    if (req.query.workType) {
      const typeString = (req.query.workType as string).toUpperCase();
      if (Object.values(WorkType).includes(typeString as WorkType)) where.workType = typeString;
    }
    if (req.query.area) {
      const areaString = (req.query.area as string).toUpperCase();
      if (Object.values(WorkArea).includes(areaString as WorkArea)) where.area = areaString;
    }

    const grouped = await (prisma.work.groupBy as any)({
      by: [field],
      where,
      _count: { [field]: true },
      orderBy: { _count: { [field]: 'desc' } },
      take: limit,
    });

    if (dimension === 'author') {
      const authorIds = grouped.map((g: any) => g.authorId as string);
      const users = await prisma.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, fullName: true, username: true, avatar: true },
      });
      const byId = new Map(users.map((u) => [u.id, u]));

      const items = grouped.map((g: any) => {
        const user = byId.get(g.authorId);
        return {
          value: g.authorId,
          label: user?.fullName ?? 'Usuário removido',
          username: user?.username ?? null,
          avatar: user?.avatar ?? null,
          count: g._count[field],
        };
      });

      return res.status(200).json({ dimension, items });
    }

    const items = grouped.map((g: any) => ({ value: g[field], count: g._count[field] }));
    return res.status(200).json({ dimension, items });
  } catch (error) {
    console.error('Error fetching work stats:', error);
    return res.status(500).json({ error: 'Could not fetch work stats.' });
  }
};

export const getWorkFieldSuggestions = async (req: Request, res: Response) => {
  try {
    const field = req.query.field as string;
    const q = ((req.query.q as string) ?? '').trim();

    if (!SUGGESTION_FIELDS.includes(field as any) || q.length < 2) {
      return res.status(200).json({ field, suggestions: [] });
    }

    const rows = await prisma.work.findMany({
      where: {
        [field]: { contains: q, mode: 'insensitive' },
        visibility: WorkVisibility.PUBLIC,
      } as Prisma.WorkWhereInput,
      distinct: [field as any],
      select: { [field]: true } as any,
      orderBy: { [field]: 'asc' } as any,
      take: 10,
    });

    const suggestions = rows.map((r: any) => r[field]).filter(Boolean);
    return res.status(200).json({ field, suggestions });
  } catch (error) {
    console.error('Error fetching work suggestions:', error);
    return res.status(500).json({ error: 'Could not fetch suggestions.' });
  }
};