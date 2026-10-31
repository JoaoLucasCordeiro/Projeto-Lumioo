import { Prisma, WorkArea, WorkType, WorkVisibility, type Work } from '@prisma/client';
import { badRequest, conflict, forbidden, notFound } from '../../shared/errors';
import { prisma } from '../../shared/prisma';
import type { CreateWorkInput, RespondAccessInput, UpdateWorkInput } from './works.schemas';

const LIST_PAGE_SIZE = 20;

const REQUESTER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  avatar: true,
  institution: true,
  academicLevel: true,
} as const;

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

// institution/country/authorId nunca são nulos no schema — filtrar "not: null" neles é rejeitado
// pelo Prisma ("Argument `not` must not be null").
const NULLABLE_STATS_FIELDS = new Set(['campus', 'city', 'state', 'area']);

const isWorkType = (v: string): v is WorkType => (Object.values(WorkType) as string[]).includes(v);
const isWorkArea = (v: string): v is WorkArea => (Object.values(WorkArea) as string[]).includes(v);

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export const createWork = (authorId: string, input: CreateWorkInput) =>
  prisma.work.create({ data: { ...input, authorId, downloads: 0 } });

export interface WorkFilters {
  search?: string;
  workType?: string;
  year?: string;
  area?: string;
  campus?: string;
  city?: string;
  state?: string;
  country?: string;
  cursor?: string;
}

/** Trabalhos privados só aparecem para o próprio autor. */
export async function listWorks(filters: WorkFilters, viewerId?: string) {
  const { search, workType, year, area, campus, city, state, country, cursor } = filters;

  const and: Prisma.WorkWhereInput[] = [
    viewerId
      ? { OR: [{ visibility: WorkVisibility.PUBLIC }, { authorId: viewerId }] }
      : { visibility: WorkVisibility.PUBLIC },
  ];

  if (search) {
    and.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { author: { fullName: { contains: search, mode: 'insensitive' } } },
        { keywords: { has: search } },
      ],
    });
  }
  if (workType && isWorkType(workType.toUpperCase())) and.push({ workType: workType.toUpperCase() as WorkType });
  if (year) {
    const numericYear = parseInt(year);
    if (!isNaN(numericYear)) {
      and.push({ createdAt: { gte: new Date(numericYear, 0, 1), lt: new Date(numericYear + 1, 0, 1) } });
    }
  }
  if (area && isWorkArea(area.toUpperCase())) and.push({ area: area.toUpperCase() as WorkArea });
  if (campus) and.push({ campus: { contains: campus, mode: 'insensitive' } });
  if (city) and.push({ city: { contains: city, mode: 'insensitive' } });
  if (state) and.push({ state: state.toUpperCase() });
  if (country) and.push({ country: { contains: country, mode: 'insensitive' } });

  const works = await prisma.work.findMany({
    take: LIST_PAGE_SIZE,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    where: { AND: and },
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { fullName: true } } },
  });

  return {
    works: works.map((w) => ({
      id: w.id,
      title: w.title,
      author: w.author.fullName,
      type: w.workType,
      visibility: w.visibility,
      area: w.area,
      year: new Date(w.createdAt).getFullYear().toString(),
      abstract: w.summary,
      keywords: w.keywords,
      downloads: w.downloads,
      image: w.coverImage,
      campus: w.campus,
      city: w.city,
      state: w.state,
      country: w.country,
    })),
    nextCursor: works.length === LIST_PAGE_SIZE ? works[works.length - 1].id : null,
  };
}

/**
 * Regra de acesso: trabalho público, ou privado para o autor ou para quem teve o pedido APROVADO.
 * Caso contrário responde 403 com o status do pedido do usuário (para o cliente oferecer "solicitar acesso").
 */
async function assertCanAccess(work: Work, viewerId?: string) {
  if (work.visibility !== WorkVisibility.PRIVATE || work.authorId === viewerId) return;

  const request = viewerId
    ? await prisma.workAccessRequest.findUnique({
        where: { workId_requesterId: { workId: work.id, requesterId: viewerId } },
      })
    : null;

  if (request?.status !== 'APPROVED') {
    throw forbidden('This work is private.', {
      visibility: work.visibility,
      accessRequestStatus: request?.status ?? null,
    });
  }
}

export async function getWork(id: string, viewerId?: string) {
  const work = await prisma.work.findUnique({
    where: { id },
    include: { author: { select: { fullName: true, username: true } } },
  });
  if (!work) throw notFound('Work not found.');

  await assertCanAccess(work, viewerId);

  return {
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
}

export async function downloadWork(id: string, viewerId: string) {
  const work = await prisma.work.findUnique({ where: { id } });
  if (!work) throw notFound('Work not found.');

  await assertCanAccess(work, viewerId);

  const updated = await prisma.work.update({ where: { id }, data: { downloads: { increment: 1 } } });
  return { pdfFile: updated.pdfFile, title: updated.title };
}

async function findOwnedWork(authorId: string, id: string, message: string) {
  const work = await prisma.work.findUnique({ where: { id } });
  if (!work) throw notFound('Work not found.');
  if (work.authorId !== authorId) throw forbidden(message);
  return work;
}

export async function updateWork(authorId: string, id: string, input: UpdateWorkInput) {
  await findOwnedWork(authorId, id, 'You are not authorized to update this work.');
  return prisma.work.update({ where: { id }, data: input });
}

export async function deleteWork(authorId: string, id: string) {
  await findOwnedWork(authorId, id, 'You are not authorized to delete this work.');
  await prisma.work.delete({ where: { id } });
}

// ─── Pedidos de acesso (trabalhos privados) ───────────────────────────────────

export async function requestAccess(requesterId: string, workId: string) {
  const work = await prisma.work.findUnique({ where: { id: workId } });
  if (!work) throw notFound('Work not found.');
  if (work.visibility === WorkVisibility.PUBLIC) throw badRequest('This work is public; no access request is needed.');
  if (work.authorId === requesterId) throw badRequest('You cannot request access to your own work.');

  const existing = await prisma.workAccessRequest.findUnique({
    where: { workId_requesterId: { workId, requesterId } },
  });
  if (existing && (existing.status === 'PENDING' || existing.status === 'APPROVED')) {
    throw conflict('You already have an active request for this work.');
  }

  // Pedido negado ou revogado pode ser refeito: reaproveita o registro
  return existing
    ? prisma.workAccessRequest.update({ where: { id: existing.id }, data: { status: 'PENDING', respondedAt: null } })
    : prisma.workAccessRequest.create({ data: { workId, requesterId } });
}

export async function listAccessRequests(authorId: string, workId: string) {
  await findOwnedWork(authorId, workId, 'You are not authorized to view these requests.');
  return prisma.workAccessRequest.findMany({
    where: { workId },
    orderBy: { createdAt: 'desc' },
    include: { requester: { select: REQUESTER_SELECT } },
  });
}

export async function respondToAccessRequest(authorId: string, workId: string, requestId: string, { status }: RespondAccessInput) {
  await findOwnedWork(authorId, workId, 'You are not authorized to manage these requests.');

  const request = await prisma.workAccessRequest.findUnique({ where: { id: requestId } });
  if (!request || request.workId !== workId) throw notFound('Access request not found.');

  if (status === 'REVOKED' && request.status !== 'APPROVED') {
    throw badRequest('Only approved requests can be revoked.');
  }
  if ((status === 'APPROVED' || status === 'DENIED') && request.status !== 'PENDING') {
    throw badRequest('Only pending requests can be approved or denied.');
  }

  return prisma.workAccessRequest.update({ where: { id: requestId }, data: { status, respondedAt: new Date() } });
}

export const listMyAccessRequests = (requesterId: string) =>
  prisma.workAccessRequest.findMany({
    where: { requesterId },
    orderBy: { createdAt: 'desc' },
    include: { work: { select: { id: true, title: true, workType: true, coverImage: true } } },
  });

// ─── Estatísticas e sugestões ─────────────────────────────────────────────────

export interface WorkStatsQuery {
  dimension?: string;
  limit?: string;
  state?: string;
  country?: string;
  workType?: string;
  area?: string;
}

export async function getWorkStats(query: WorkStatsQuery) {
  const { dimension = '' } = query;
  const field = STATS_FIELD_MAP[dimension];
  if (!field) throw badRequest('Invalid dimension.');

  const limit = Math.min(parseInt(query.limit ?? '') || 10, 50);

  const where: Record<string, unknown> = { visibility: WorkVisibility.PUBLIC };
  if (NULLABLE_STATS_FIELDS.has(field)) where[field] = { not: null };
  if (query.state) where.state = query.state.toUpperCase();
  if (query.country) where.country = query.country;
  if (query.workType && isWorkType(query.workType.toUpperCase())) where.workType = query.workType.toUpperCase();
  if (query.area && isWorkArea(query.area.toUpperCase())) where.area = query.area.toUpperCase();

  // groupBy com campo dinâmico não é tipável pelo Prisma
  const grouped: Record<string, any>[] = await (prisma.work.groupBy as any)({
    by: [field],
    where,
    _count: { [field]: true },
    orderBy: { _count: { [field]: 'desc' } },
    take: limit,
  });

  if (dimension === 'author') {
    const users = await prisma.user.findMany({
      where: { id: { in: grouped.map((g) => g.authorId as string) } },
      select: { id: true, fullName: true, username: true, avatar: true },
    });
    const byId = new Map(users.map((u) => [u.id, u]));
    return {
      dimension,
      items: grouped.map((g) => {
        const user = byId.get(g.authorId);
        return {
          value: g.authorId,
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

export async function getWorkSuggestions(fieldName: string | undefined, rawQuery: string | undefined) {
  const field = fieldName as (typeof SUGGESTION_FIELDS)[number];
  const q = (rawQuery ?? '').trim();

  if (!SUGGESTION_FIELDS.includes(field) || q.length < 2) return { field: fieldName, suggestions: [] };

  const rows = await prisma.work.findMany({
    where: { [field]: { contains: q, mode: 'insensitive' }, visibility: WorkVisibility.PUBLIC } as Prisma.WorkWhereInput,
    distinct: [field],
    select: { [field]: true } as Prisma.WorkSelect,
    orderBy: { [field]: 'asc' } as Prisma.WorkOrderByWithRelationInput,
    take: 10,
  });

  const suggestions = (rows as unknown as Record<string, string | null>[]).map((r) => r[field]).filter(Boolean);
  return { field, suggestions };
}
