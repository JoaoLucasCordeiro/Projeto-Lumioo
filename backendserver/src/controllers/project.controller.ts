import { Request, Response } from 'express';
import { Prisma, PrismaClient, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

// As interfaces AuthenticatedRequest e TeamMemberInput foram removidas

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
    const { search, category, year } = req.query;

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
      whereClause.category = { equals: category as string, mode: 'insensitive' };
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

    const projectsFromDb = await prisma.project.findMany({
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
    }));

    res.status(200).json(formattedProjects);

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
        owner: { select: { fullName: true } },
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
      institution: project.owner.fullName, 
      status: project.status,
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