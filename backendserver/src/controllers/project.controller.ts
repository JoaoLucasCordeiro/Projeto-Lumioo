import { Request, Response } from 'express';
import { Prisma, ProjectStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

const STATS_FIELD_MAP: Record<string, string> = {
  campus: 'campus',
  city: 'city',
  state: 'state',
  country: 'country',
  category: 'category',
  author: 'ownerId',
};

const SUGGESTION_FIELDS = ['campus', 'city'] as const;

// category/ownerId nunca são nulos no schema — filtrar "not: null" neles é rejeitado pelo
// Prisma ("Argument `not` must not be null").
const NULLABLE_STATS_FIELDS = new Set(['campus', 'city', 'state', 'country']);

export const createProject = async (req: Request, res: Response) => {
  const ownerId = req.user?.userId;
  if (!ownerId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }

  const {
    title,
    description,
    category,
    image,
    status,
    contactEmail,
    contactPhone,
    campus,
    city,
    state,
    country,
    teamMembers,
  } = req.body;

  if (!title || !description || !category || !status || !teamMembers) {
    return res.status(400).json({ error: 'Title, description, category, status, and teamMembers are required.' });
  }

  if (!Object.values(ProjectStatus).includes(status.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid status value.' });
  }

  if (status === 'OPEN_FOR_APPLICATIONS' && (!contactEmail || !contactPhone)) {
    return res.status(400).json({ error: 'Contact email and phone are required when status is OPEN_FOR_APPLICATIONS.' });
  }

  if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
    return res.status(400).json({ error: 'teamMembers must be a non-empty array.' });
  }
  
  try {
    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        category, 
        image,
        status: status.toUpperCase() as ProjectStatus,
        contactEmail,
        contactPhone,
        campus,
        city,
        state,
        country: country || 'Brasil',
        ownerId,
        teamMembers: {
          create: teamMembers.map((member: { name: string; role: string; photo?: string | null }) => ({
            name: member.name,
            role: member.role,
            photo: member.photo,
          })),
        },
      },
      include: {
        teamMembers: true, 
      },
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'An error occurred while creating the project.' });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { search, category, year, campus, city, state, country } = req.query;

    const whereClause: Prisma.ProjectWhereInput = {};

    if (search) {
      const searchString = search as string;
      whereClause.OR = [
        { title: { contains: searchString, mode: 'insensitive' } },
        { description: { contains: searchString, mode: 'insensitive' } },
        { owner: { fullName: { contains: searchString, mode: 'insensitive' } } },
      ];
    }

    if (category && category !== 'all') {
      whereClause.category = { contains: category as string, mode: 'insensitive' };
    }

    if (year && year !== 'all') {
      const numericYear = parseInt(year as string);
      if (!isNaN(numericYear)) {
        whereClause.createdAt = {
          gte: new Date(numericYear, 0, 1),
          lt: new Date(numericYear + 1, 0, 1),
        };
      }
    }

    if (campus) {
      whereClause.campus = { contains: campus as string, mode: 'insensitive' };
    }

    if (city) {
      whereClause.city = { contains: city as string, mode: 'insensitive' };
    }

    if (state) {
      whereClause.state = (state as string).toUpperCase();
    }

    if (country) {
      whereClause.country = { contains: country as string, mode: 'insensitive' };
    }

    const { cursor } = req.query;
    const LIMIT = 20;

    const projectsFromDb = await prisma.project.findMany({
      take: LIMIT,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor as string } : undefined,
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { fullName: true } },
        _count: { select: { teamMembers: true } },
      },
    });

    const formattedProjects = projectsFromDb.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      year: new Date(project.createdAt).getFullYear().toString(),
      image: project.image,
      members: project._count.teamMembers,
      institution: project.owner.fullName,
      status: project.status,
      campus: project.campus,
      city: project.city,
      state: project.state,
      country: project.country,
    }));

    const nextCursor = projectsFromDb.length === LIMIT ? projectsFromDb[projectsFromDb.length - 1].id : null;
    res.status(200).json({ projects: formattedProjects, nextCursor });

  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Could not fetch projects." });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { fullName: true, username: true, institution: true } },
        teamMembers: true, 
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const formattedProject = {
      id: project.id,
      title: project.title,
      description: project.description, 
      detailedDescription: project.description, 
      category: project.category,
      year: new Date(project.createdAt).getFullYear().toString(),
      image: project.image,
      members: project.teamMembers.length,
      author: project.owner.fullName, 
      authorUsername: project.owner.username, 
      institution: project.owner.institution,
      status: project.status,
      campus: project.campus,
      city: project.city,
      state: project.state,
      country: project.country,
      team: project.teamMembers.map((member: { name: string; role: string; photo: string | null }) => ({
        name: member.name,
        role: member.role,
        photo: member.photo,
      })),
      publications: [], 
      ownerId: project.ownerId, 
    };

    res.status(200).json(formattedProject);
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ error: "Could not fetch project details." });
  }
};


export const updateProject = async (req: Request, res: Response) => {
  const ownerId = req.user?.userId;
  if (!ownerId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }
  const { id } = req.params;
  const {
    title,
    description,
    image,
    status,
    contactEmail,
    contactPhone,
    campus,
    city,
    state,
    country,
  } = req.body;
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    if (project.ownerId !== ownerId) {
      return res.status(403).json({ error: 'You are not authorized to update this project.' });
    }
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        image,
        status: status ? (status.toUpperCase() as ProjectStatus) : undefined,
        contactEmail,
        contactPhone,
        campus,
        city,
        state,
        country,
      },
      include: { teamMembers: true },
    });
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'An error occurred while updating the project.' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const ownerId = req.user?.userId;
  if (!ownerId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    if (project.ownerId !== ownerId) {
      return res.status(403).json({ error: 'You are not authorized to delete this project.' });
    }

    await prisma.$transaction([
      prisma.teamMember.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'An error occurred while deleting the project.' });
  }
};

export const getProjectStats = async (req: Request, res: Response) => {
  try {
    const dimension = req.query.dimension as string;
    const field = STATS_FIELD_MAP[dimension];
    if (!field) {
      return res.status(400).json({ error: 'Invalid dimension.' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const where: Record<string, unknown> = {};
    if (NULLABLE_STATS_FIELDS.has(field)) where[field] = { not: null };
    if (req.query.state) where.state = (req.query.state as string).toUpperCase();
    if (req.query.country) where.country = req.query.country as string;
    if (req.query.category) {
      where.category = { contains: req.query.category as string, mode: 'insensitive' };
    }

    const grouped = await (prisma.project.groupBy as any)({
      by: [field],
      where,
      _count: { [field]: true },
      orderBy: { _count: { [field]: 'desc' } },
      take: limit,
    });

    if (dimension === 'author') {
      const ownerIds = grouped.map((g: any) => g.ownerId as string);
      const users = await prisma.user.findMany({
        where: { id: { in: ownerIds } },
        select: { id: true, fullName: true, username: true, avatar: true },
      });
      const byId = new Map(users.map((u) => [u.id, u]));

      const items = grouped.map((g: any) => {
        const user = byId.get(g.ownerId);
        return {
          value: g.ownerId,
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
    console.error('Error fetching project stats:', error);
    return res.status(500).json({ error: 'Could not fetch project stats.' });
  }
};

export const getProjectFieldSuggestions = async (req: Request, res: Response) => {
  try {
    const field = req.query.field as string;
    const q = ((req.query.q as string) ?? '').trim();

    if (!SUGGESTION_FIELDS.includes(field as any) || q.length < 2) {
      return res.status(200).json({ field, suggestions: [] });
    }

    const rows = await prisma.project.findMany({
      where: {
        [field]: { contains: q, mode: 'insensitive' },
      } as Prisma.ProjectWhereInput,
      distinct: [field as any],
      select: { [field]: true } as any,
      orderBy: { [field]: 'asc' } as any,
      take: 10,
    });

    const suggestions = rows.map((r: any) => r[field]).filter(Boolean);
    return res.status(200).json({ field, suggestions });
  } catch (error) {
    console.error('Error fetching project suggestions:', error);
    return res.status(500).json({ error: 'Could not fetch suggestions.' });
  }
};