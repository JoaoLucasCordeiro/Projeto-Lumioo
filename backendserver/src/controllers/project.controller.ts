import { Request, Response } from 'express';
import { PrismaClient, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

interface TeamMemberInput {
  name: string;
  role: string;
  photo?: string | null;
}

export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  const ownerId = req.user?.userId;
  if (!ownerId) {
    return res.status(403).json({ error: 'User not authenticated.' });
  }

  const {
    title,
    description,
    image,
    status,
    contactEmail,
    contactPhone,
    teamMembers,
  } = req.body;

  // --- Validações ---
  if (!title || !description || !status || !teamMembers) {
    return res.status(400).json({ error: 'Title, description, status, and teamMembers are required.' });
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
        image,
        status: status.toUpperCase() as ProjectStatus,
        contactEmail,
        contactPhone,
        ownerId,
        teamMembers: {
          create: teamMembers.map((member: TeamMemberInput) => ({
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
    const projects = await prisma.project.findMany({
      include: { teamMembers: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'An error occurred while fetching projects.' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { teamMembers: true },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'An error occurred while fetching the project.' });
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
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
    teamMembers,
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
        status: status ? status.toUpperCase() : undefined,
        contactEmail,
        contactPhone,
        // Para atualizar teamMembers, normalmente é necessário lógica extra (remover, adicionar, atualizar membros)
      },
      include: { teamMembers: true },
    });
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'An error occurred while updating the project.' });
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
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
