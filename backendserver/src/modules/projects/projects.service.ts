import type { Prisma } from '@prisma/client';
import { badRequest, forbidden, notFound } from '../../shared/errors';
import { prisma } from '../../shared/prisma';
import type { CreateProjectInput, UpdateProjectInput } from './projects.schemas';

const LIST_PAGE_SIZE = 20;

const STATS_FIELD_MAP: Record<string, string> = {
  campus: 'campus',
  city: 'city',
  state: 'state',
  country: 'country',
  category: 'category',
  author: 'ownerId',
};

const SUGGESTION_FIELDS = ['campus', 'city'] as const;

// category/ownerId nunca são nulos no schema — filtrar "not: null" neles é rejeitado pelo Prisma.
const NULLABLE_STATS_FIELDS = new Set(['campus', 'city', 'state', 'country']);

export async function createProject(ownerId: string, input: CreateProjectInput) {
  const { teamMembers, ...data } = input;

  if (data.status === 'OPEN_FOR_APPLICATIONS' && (!data.contactEmail || !data.contactPhone)) {
    throw badRequest('Contact email and phone are required when status is OPEN_FOR_APPLICATIONS.');
  }

  return prisma.project.create({
    data: {
      ...data,
      ownerId,
      teamMembers: {
        create: teamMembers.map((m) => ({ name: m.name, role: m.role, photo: m.photo })),
      },
    },
    include: { teamMembers: true },
  });
}

export interface ProjectFilters {
  search?: string;
  category?: string;
  year?: string;
  campus?: string;
  city?: string;
  state?: string;
  country?: string;
  cursor?: string;
}

export async function listProjects(filters: ProjectFilters) {
  const { search, category, year, campus, city, state, country, cursor } = filters;
  const where: Prisma.ProjectWhereInput = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { owner: { fullName: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (category && category !== 'all') where.category = { contains: category, mode: 'insensitive' };
  if (year && year !== 'all') {
    const numericYear = parseInt(year);
    if (!isNaN(numericYear)) {
      where.createdAt = { gte: new Date(numericYear, 0, 1), lt: new Date(numericYear + 1, 0, 1) };
    }
  }
  if (campus) where.campus = { contains: campus, mode: 'insensitive' };
  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (state) where.state = state.toUpperCase();
  if (country) where.country = { contains: country, mode: 'insensitive' };

  const projects = await prisma.project.findMany({
    take: LIST_PAGE_SIZE,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    where,
    orderBy: { createdAt: 'desc' },
    include: { owner: { select: { fullName: true } }, _count: { select: { teamMembers: true } } },
  });

  return {
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      year: new Date(p.createdAt).getFullYear().toString(),
      image: p.image,
      members: p._count.teamMembers,
      institution: p.owner.fullName,
      status: p.status,
      campus: p.campus,
      city: p.city,
      state: p.state,
      country: p.country,
    })),
    nextCursor: projects.length === LIST_PAGE_SIZE ? projects[projects.length - 1].id : null,
  };
}

export async function getProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { fullName: true, username: true, institution: true } },
      teamMembers: true,
    },
  });
  if (!project) throw notFound('Project not found.');

  return {
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
    team: project.teamMembers.map((m) => ({ name: m.name, role: m.role, photo: m.photo })),
    publications: [],
    ownerId: project.ownerId,
  };
}

async function findOwnedProject(ownerId: string, id: string, action: 'update' | 'delete') {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw notFound('Project not found.');
  if (project.ownerId !== ownerId) throw forbidden(`You are not authorized to ${action} this project.`);
}

export async function updateProject(ownerId: string, id: string, input: UpdateProjectInput) {
  await findOwnedProject(ownerId, id, 'update');

  // `category` é aceita pelo schema mas ignorada aqui: a categoria não muda depois de criado.
  const { title, description, image, status, contactEmail, contactPhone, campus, city, state, country } = input;
  return prisma.project.update({
    where: { id },
    data: { title, description, image, status, contactEmail, contactPhone, campus, city, state, country },
    include: { teamMembers: true },
  });
}

export async function deleteProject(ownerId: string, id: string) {
  await findOwnedProject(ownerId, id, 'delete');
  await prisma.$transaction([
    prisma.teamMember.deleteMany({ where: { projectId: id } }),
    prisma.project.delete({ where: { id } }),
  ]);
}

export interface StatsQuery {
  dimension?: string;
  limit?: string;
  state?: string;
  country?: string;
  category?: string;
}

export async function getProjectStats(query: StatsQuery) {
  const { dimension = '' } = query;
  const field = STATS_FIELD_MAP[dimension];
  if (!field) throw badRequest('Invalid dimension.');

  const limit = Math.min(parseInt(query.limit ?? '') || 10, 50);

  const where: Record<string, unknown> = {};
  if (NULLABLE_STATS_FIELDS.has(field)) where[field] = { not: null };
  if (query.state) where.state = query.state.toUpperCase();
  if (query.country) where.country = query.country;
  if (query.category) where.category = { contains: query.category, mode: 'insensitive' };

  // groupBy com campo dinâmico não é tipável pelo Prisma
  const grouped: Record<string, any>[] = await (prisma.project.groupBy as any)({
    by: [field],
    where,
    _count: { [field]: true },
    orderBy: { _count: { [field]: 'desc' } },
    take: limit,
  });

  if (dimension === 'author') {
    const users = await prisma.user.findMany({
      where: { id: { in: grouped.map((g) => g.ownerId as string) } },
      select: { id: true, fullName: true, username: true, avatar: true },
    });
    const byId = new Map(users.map((u) => [u.id, u]));
    return {
      dimension,
      items: grouped.map((g) => {
        const user = byId.get(g.ownerId);
        return {
          value: g.ownerId,
          label: user?.fullName ?? 'Usuário removido',
          username: user?.username ?? null,
          avatar: user?.avatar ?? null,
          count: g._count[field],
        };
      }),
    };
  }

  return { dimension, items: grouped.map((g) => ({ value: g[field], count: g._count[field] })) };
}

export async function getProjectSuggestions(fieldName: string | undefined, rawQuery: string | undefined) {
  const field = fieldName as (typeof SUGGESTION_FIELDS)[number];
  const q = (rawQuery ?? '').trim();

  if (!SUGGESTION_FIELDS.includes(field) || q.length < 2) return { field: fieldName, suggestions: [] };

  const rows = await prisma.project.findMany({
    where: { [field]: { contains: q, mode: 'insensitive' } } as Prisma.ProjectWhereInput,
    distinct: [field],
    select: { [field]: true } as Prisma.ProjectSelect,
    orderBy: { [field]: 'asc' } as Prisma.ProjectOrderByWithRelationInput,
    take: 10,
  });

  const suggestions = (rows as unknown as Record<string, string | null>[]).map((r) => r[field]).filter(Boolean);
  return { field, suggestions };
}
